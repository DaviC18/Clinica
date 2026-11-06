import { fatos } from '../data/fatos.ts'
import { semPendencias } from './semPendencias.ts'
import { SemQuebra } from './SemQuebra.tsx'

/** Mostra um texto de src/data sem os marcadores [CONFIRMAR]. */
export function TextoMarcado({ texto }: { texto: string }) {
  const { exibicao, tel } = fatos.telefone
  return (
    <>
      {semPendencias(texto)
        .split(exibicao)
        .map((parte, i) => (
          <span key={i}>
            {i > 0 && (
              <a href={`tel:${tel}`} className="py-3 font-semibold whitespace-nowrap underline underline-offset-4">
                {exibicao}
              </a>
            )}
            <SemQuebra texto={parte} />
          </span>
        ))}
    </>
  )
}
