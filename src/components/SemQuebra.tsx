const COM_HIFEN = /(\S*-\S*)/g

/** Mantém telefone, CEP, CNPJ e palavras compostas inteiros na quebra de linha. */
export function SemQuebra({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(COM_HIFEN).map((parte, i) =>
        i % 2 === 1 ? (
          <span key={i} className="whitespace-nowrap">
            {parte}
          </span>
        ) : (
          parte
        ),
      )}
    </>
  )
}
