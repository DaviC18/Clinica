import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, FrontSide, type Mesh } from 'three'
import {
  fragFeixe,
  fragLente,
  fragPoeira,
  vertFeixe,
  vertLente,
  vertPoeira,
} from './shaders.ts'

const ALTURA_MUNDO = 10
const LENTE: [number, number] = [1.05, 3.35]
const RAIO_LENTE = 0.95
const TOTAL_POEIRA = 44

const MIN_FPS = 24
const QUADROS_VIGIADOS = 90
const QUADROS_IGNORADOS = 10 // Compilação de shader não conta como lentidão.

// Uma cena só na página: os uniforms ficam fora do componente e o laço de quadros os altera.
const uniforms = { uTempo: { value: 12 }, uLente: { value: LENTE }, uRaio: { value: RAIO_LENTE } }

type PropsConteudo = { aoPronta: () => void; aoLento: () => void }

function Conteudo({ aoPronta, aoLento }: PropsConteudo) {
  const lente = useRef<Mesh>(null)
  const larguraMundo = useThree((s) => (ALTURA_MUNDO * s.size.width) / s.size.height)
  const poeira = useMemo(() => {
    const geometria = new BufferGeometry()
    const posicoes = new Float32Array(TOTAL_POEIRA * 3)
    const fases = new Float32Array(TOTAL_POEIRA)
    for (let i = 0; i < TOTAL_POEIRA; i++) {
      // Sequência fixa, para o quadro inicial ser sempre o mesmo da imagem estática.
      const u = (i * 0.618034) % 1
      posicoes.set([LENTE[0] + (u - 0.5) * 3.4, LENTE[1] + 0.6, 0.4], i * 3)
      fases[i] = (i * 0.754877) % 1
    }
    geometria.setAttribute('position', new BufferAttribute(posicoes, 3))
    geometria.setAttribute('aFase', new BufferAttribute(fases, 1))
    return geometria
  }, [])

  const vigia = useRef({ quadros: 0, tempo: 0, encerrado: false })

  useFrame((_, delta) => {
    const t = (uniforms.uTempo.value += delta)
    if (lente.current) {
      lente.current.rotation.y = 0.62 + Math.sin(t * 0.17) * 0.09
      lente.current.rotation.x = 0.12 + Math.cos(t * 0.13) * 0.05
    }
    const v = vigia.current
    if (v.encerrado) return
    v.quadros++
    if (v.quadros === 2) aoPronta()
    if (v.quadros <= QUADROS_IGNORADOS) return
    v.tempo += delta
    if (v.quadros - QUADROS_IGNORADOS >= QUADROS_VIGIADOS) {
      v.encerrado = true
      if (QUADROS_VIGIADOS / v.tempo < MIN_FPS) aoLento()
    }
  })

  return (
    <>
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[Math.max(larguraMundo, 10) + 2, ALTURA_MUNDO + 2]} />
        <shaderMaterial
          vertexShader={vertFeixe}
          fragmentShader={fragFeixe}
          uniforms={uniforms}
          blending={AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh ref={lente} position={[LENTE[0], LENTE[1], 0]} scale={[RAIO_LENTE, RAIO_LENTE, 0.3]}>
        <sphereGeometry args={[1, 48, 32]} />
        <shaderMaterial
          vertexShader={vertLente}
          fragmentShader={fragLente}
          uniforms={uniforms}
          side={FrontSide}
          blending={AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
      <points geometry={poeira}>
        <shaderMaterial
          vertexShader={vertPoeira}
          fragmentShader={fragPoeira}
          uniforms={uniforms}
          blending={AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </points>
    </>
  )
}

type Props = { aoPronta: () => void; aoFalhar: (motivo: string) => void }

export default function Cena({ aoPronta, aoFalhar }: Props) {
  const raiz = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)
  const [rodando, setRodando] = useState(true)
  const encerrada = useRef(false)

  // Desmontar perde o contexto de propósito: vale só o primeiro motivo.
  const falhar = (motivo: string) => {
    if (encerrada.current) return
    encerrada.current = true
    aoFalhar(motivo)
  }

  useEffect(() => {
    const el = raiz.current!
    let naTela = true
    const atualizar = () => setRodando(naTela && !document.hidden)
    const observador = new IntersectionObserver(([entrada]) => {
      naTela = entrada.isIntersecting
      atualizar()
    })
    observador.observe(el)
    document.addEventListener('visibilitychange', atualizar)
    return () => {
      observador.disconnect()
      document.removeEventListener('visibilitychange', atualizar)
    }
  }, [])

  const distancia = ALTURA_MUNDO / 2 / Math.tan((30 / 2) * (Math.PI / 180))

  return (
    <div
      ref={raiz}
      className={`pointer-events-none absolute inset-0 transition-opacity duration-[600ms] ${visivel ? '' : 'opacity-0'}`}
    >
      <Canvas
        dpr={[1, 1.5]}
        resize={{ offsetSize: true }}
        flat
        linear
        frameloop={rodando ? 'always' : 'never'}
        camera={{ fov: 30, position: [0, 0, distancia], near: 1, far: 60 }}
        gl={{ alpha: false, antialias: true, stencil: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1)
          gl.domElement.addEventListener('webglcontextlost', () => falhar('contexto-perdido'), { once: true })
        }}
      >
        <Conteudo
          aoPronta={() => {
            setVisivel(true)
            aoPronta()
          }}
          aoLento={() => falhar('lenta')}
        />
      </Canvas>
    </div>
  )
}
