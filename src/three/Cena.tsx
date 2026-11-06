import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, FrontSide, type Mesh, Vector2 } from 'three'
import {
  fragFeixe,
  fragLente,
  fragPoeira,
  vertFeixe,
  vertLente,
  vertPoeira,
} from './shaders.ts'

const ALTURA_MUNDO = 10
const RAIO_LENTE = 0.95
const TOPO_ATE_LENTE = 1.65
const ESCALA_LARGA = 1.25
const ESCALA_DEITADO = 1.3
const ESCALA_MINIMA = 0.75
const FOLGA_TEXTO_PX = 8
const BORDA_DO_CONTEUDO_PX = 520 // Da metade da tela até a lente, no máximo: fica ao lado do texto.
const TOTAL_POEIRA = 44

// Um pulso a cada 7 s. O primeiro chega 2,2 s depois da montagem; antes disso a cena segue
// igual à imagem estática, e a troca entre as duas não aparece.
const CICLO_S = 7
const ANTECEDENCIA_S = 2.5
const PRIMEIRA_CHEGADA = 14.2

// A onda do leque leva este tempo até a altura do botão. Convite, não insistência: 3 vezes.
const LUZ_NO_CTA_S = 0.95
const MAX_LUZ_NO_CTA = 3

const MIN_FPS = 24
const QUADROS_VIGIADOS = 90
const QUADROS_IGNORADOS = 10 // Compilação de shader não conta como lentidão.

const faixa = (valor: number, de: number, ate: number) => Math.min(Math.max((valor - de) / (ate - de), 0), 1)

/**
 * Onde a lente fica e com que tamanho. O canvas cobre o hero inteiro; só a lente muda de lugar.
 * Se o texto ocupa a coluna dela, a lente precisa caber acima: o limite é a posição real do
 * texto, que muda com a fonte do sistema, não uma lista de tamanhos de tela.
 */
function layoutDaLente(largura: number, altura: number, texto: { topo: number; direita: number }) {
  if (altura < 500 && largura > altura * 1.6) return { x: 0.91, escala: ESCALA_DEITADO }
  const escala = 1 + (ESCALA_LARGA - 1) * faixa(largura, 768, 1024)
  if (largura >= 1024) return { x: Math.min(0.86, 0.5 + BORDA_DO_CONTEUDO_PX / largura), escala }

  const x = 0.7 + 0.16 * faixa(largura, 390, 1024)
  const bordaDaLente = x * largura - (RAIO_LENTE / ALTURA_MUNDO) * escala * altura
  if (texto.direita <= bordaDaLente) return { x, escala } // Texto ao lado, não embaixo.

  const alturaOcupada = ((TOPO_ATE_LENTE + RAIO_LENTE) / ALTURA_MUNDO) * altura
  const cabe = (texto.topo - FOLGA_TEXTO_PX) / alturaOcupada
  if (cabe >= escala) return { x, escala }
  if (cabe >= ESCALA_MINIMA) return { x, escala: cabe }
  return { x: 1, escala: ESCALA_MINIMA } // Sem espaço acima do texto: metade da lente sai pela borda.
}

// Uma cena só na página: os uniforms ficam fora do componente e o laço de quadros os altera.
const uniforms = {
  uTempo: { value: 12 },
  uDesde: { value: -ANTECEDENCIA_S },
  uAbertura: { value: 0 },
  uLente: { value: new Vector2() },
  uRaio: { value: RAIO_LENTE },
  uEscala: { value: 1 },
}

type PropsConteudo = { aoPronta: () => void; aoLento: () => void }

function Conteudo({ aoPronta, aoLento }: PropsConteudo) {
  const lente = useRef<Mesh>(null)
  const { width, height } = useThree((s) => s.size)
  const definirDpr = useThree((s) => s.setDpr)
  const [texto, setTexto] = useState({ topo: Number.POSITIVE_INFINITY, direita: 0 })
  const larguraMundo = (ALTURA_MUNDO * width) / height
  const { x, escala } = layoutDaLente(width, height, texto)
  const lenteX = (x - 0.5) * larguraMundo
  const lenteY = ALTURA_MUNDO / 2 - TOPO_ATE_LENTE * escala

  useEffect(() => {
    // Canvas do tamanho do hero: menos pixels no desktop. Refaz ao girar o celular.
    definirDpr(Math.min(window.devicePixelRatio, width >= 1024 ? 1.25 : 1.5))
  }, [definirDpr, width])

  useEffect(() => {
    let ativo = true
    const medir = () => {
      const hero = document.getElementById('hero')
      const bloco = hero?.querySelector('h1')?.parentElement
      if (!ativo || !hero || !bloco) return
      const { top, right } = bloco.getBoundingClientRect()
      setTexto({ topo: top - hero.getBoundingClientRect().top, direita: right })
    }
    const quadro = requestAnimationFrame(medir)
    void document.fonts.ready.then(medir) // A fonte final muda a altura do texto.
    return () => {
      ativo = false
      cancelAnimationFrame(quadro)
    }
  }, [width, height])
  const poeira = useMemo(() => {
    const geometria = new BufferGeometry()
    const posicoes = new Float32Array(TOTAL_POEIRA * 3)
    const fases = new Float32Array(TOTAL_POEIRA)
    for (let i = 0; i < TOTAL_POEIRA; i++) {
      // Sequência fixa, para o quadro inicial ser sempre o mesmo da imagem estática.
      const u = (i * 0.618034) % 1
      posicoes.set([(u - 0.5) * 3.4, 0.6, 0.4], i * 3)
      fases[i] = (i * 0.754877) % 1
    }
    geometria.setAttribute('position', new BufferAttribute(posicoes, 3))
    geometria.setAttribute('aFase', new BufferAttribute(fases, 1))
    return geometria
  }, [])

  const vigia = useRef({ quadros: 0, tempo: 0, encerrado: false })
  const luz = useRef({ desdeAnterior: -ANTECEDENCIA_S, vezes: 0 })

  useFrame((_, delta) => {
    const t = (uniforms.uTempo.value += delta)
    const desde = ((t - PRIMEIRA_CHEGADA + ANTECEDENCIA_S) % CICLO_S) - ANTECEDENCIA_S
    uniforms.uDesde.value = desde
    uniforms.uLente.value.set(lenteX, lenteY)
    uniforms.uEscala.value = escala

    // innerHeight em vez de medir o hero: nenhuma leitura de layout por quadro.
    const alvo = Math.min(window.scrollY / window.innerHeight, 1)
    uniforms.uAbertura.value += (alvo - uniforms.uAbertura.value) * (1 - Math.exp(-delta * 8))

    const l = luz.current
    if (l.vezes < MAX_LUZ_NO_CTA && l.desdeAnterior < LUZ_NO_CTA_S && desde >= LUZ_NO_CTA_S && alvo < 0.5) {
      l.vezes++
      document.querySelector<HTMLElement>('.cta-luz')?.setAttribute('data-ativa', '')
    }
    l.desdeAnterior = desde

    if (lente.current) {
      // Duas frequências: o giro não repete no mesmo compasso e não parece um pêndulo.
      // O impacto empurra o vidro de leve, e ele volta devagar.
      const empurrao = desde > 0 ? Math.min(desde / 0.07, 1) * Math.exp(-desde / 0.6) : 0
      lente.current.rotation.y = 0.58 + Math.sin(t * 0.11) * 0.13 + Math.sin(t * 0.043) * 0.04 + empurrao * 0.035
      lente.current.rotation.x = 0.10 + Math.cos(t * 0.08) * 0.055
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
      {/* Mesmo plano da lente: com profundidade, a perspectiva desalinha fenda e vidro. */}
      <mesh>
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
      <group position={[lenteX, lenteY, 0]} scale={escala}>
        <mesh ref={lente} scale={[RAIO_LENTE, RAIO_LENTE, 0.3]}>
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
      </group>
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
