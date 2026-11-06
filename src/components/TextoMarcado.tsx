import { semPendencias } from './semPendencias.ts'
import { SemQuebra } from './SemQuebra.tsx'

/** Mostra um texto de src/data sem os marcadores [CONFIRMAR]. */
export function TextoMarcado({ texto }: { texto: string }) {
  return <SemQuebra texto={semPendencias(texto)} />
}
