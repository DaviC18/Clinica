const MARCADOR = '\\[CONFIRMAR(?::[^\\]]*)?\\]'

/**
 * Tira da tela os marcadores de src/data, que seguem lá como lista de pendências.
 * Sem o marcador, RQE e WhatsApp ficariam como afirmações pela metade: saem junto.
 */
export function semPendencias(texto: string) {
  return texto
    .replace(new RegExp(`\\s*·\\s*RQE\\s*${MARCADOR}`, 'g'), '')
    .replace(new RegExp(`Pelo WhatsApp\\s*${MARCADOR}\\s*ou pelo telefone`, 'g'), 'Pelo telefone')
    .replace(new RegExp(`\\s*${MARCADOR}`, 'g'), '')
    .trim()
}
