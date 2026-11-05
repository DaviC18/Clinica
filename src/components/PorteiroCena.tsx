import { lazy, Suspense, useEffect, useState } from 'react'
import { ociosa } from '../animations/ocioso.ts'

const Cena = lazy(() => import('../three/Cena.tsx'))

// Calibração em docs/arquitetura.md, seção 5. Depende do laço de sondarCpu.
const LIMIAR_VOLTAS_POR_MS = 4.5
const AQUECIMENTO_MS = 12
const MEDICAO_MS = 30

type ConexaoInfo = { saveData?: boolean; effectiveType?: string }
type NavegadorCapacidade = Navigator & { connection?: ConexaoInfo; deviceMemory?: number }

function recusaBarata(): string | null {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'movimento-reduzido'
  const nav = navigator as NavegadorCapacidade
  const conexao = nav.connection
  if (conexao?.saveData) return 'economia-de-dados'
  if (conexao?.effectiveType === 'slow-2g' || conexao?.effectiveType === '2g') return 'rede-lenta'
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return 'memoria'
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return 'nucleos'
  return null
}

const RENDER_POR_SOFTWARE = /swiftshader|llvmpipe|software|softpipe|lavapipe|basic render/i

function recusaWebgl(): string | null {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true })
  if (!gl) return 'sem-webgl'
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  return RENDER_POR_SOFTWARE.test(renderer) ? 'webgl-por-software' : null
}

/** Trabalho fixo (aritmética e memória, como a inicialização da cena). Voltas por ms: maior é melhor. */
function sondarCpu() {
  const dados = new Float64Array(2048)
  let acumulado = 1
  const volta = () => {
    for (let i = 0; i < dados.length; i++) {
      acumulado = (acumulado * 1.000001 + i) % 1024
      dados[i] = acumulado + dados[(i * 7) & 2047]
    }
  }
  const inicio = performance.now()
  while (performance.now() - inicio < AQUECIMENTO_MS) volta()
  const comeco = performance.now()
  let voltas = 0
  while (performance.now() - comeco < MEDICAO_MS) {
    volta()
    voltas++
  }
  return voltas / (performance.now() - comeco)
}

function registrar(estado: string) {
  document.documentElement.dataset.cena = estado
}

export function PorteiroCena({ aoPronta }: { aoPronta: (pronta: boolean) => void }) {
  const [montar, setMontar] = useState(false)

  useEffect(() => {
    let ativo = true
    const barata = recusaBarata()
    if (barata) {
      registrar(`recusada:${barata}`)
      return
    }
    void (async () => {
      await ociosa()
      if (!ativo) return
      const webgl = recusaWebgl()
      if (webgl) {
        registrar(`recusada:${webgl}`)
        return
      }
      await ociosa()
      if (!ativo) return
      const voltasPorMs = sondarCpu()
      if (voltasPorMs < LIMIAR_VOLTAS_POR_MS) {
        registrar(`recusada:cpu:${voltasPorMs.toFixed(2)}`)
        return
      }
      registrar(`aprovada:cpu:${voltasPorMs.toFixed(2)}`)
      await ociosa()
      if (ativo && document.getElementById('hero')!.getBoundingClientRect().bottom > 0) setMontar(true)
    })()
    return () => {
      ativo = false
    }
  }, [])

  if (!montar) return null

  return (
    <Suspense fallback={null}>
      <Cena
        aoPronta={() => aoPronta(true)}
        aoFalhar={(motivo) => {
          registrar(`desmontada:${motivo}`)
          aoPronta(false)
          setMontar(false)
        }}
      />
    </Suspense>
  )
}
