import { Confirmar } from './Confirmar.tsx'
import { SemQuebra } from './SemQuebra.tsx'

const MARCADOR = /(\[CONFIRMAR(?::[^\]]*)?\])/

/** Mostra um texto de src/data com cada marcador [CONFIRMAR] na etiqueta visível. */
export function TextoMarcado({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(MARCADOR).map((parte, i) =>
        i % 2 === 1 ? (
          <Confirmar key={i}>{parte}</Confirmar>
        ) : (
          <SemQuebra key={i} texto={parte} />
        ),
      )}
    </>
  )
}
