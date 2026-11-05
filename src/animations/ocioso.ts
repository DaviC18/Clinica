/** Roda depois de load, em idle. Devolve o cancelamento. */
export function depoisDoLoad(tarefa: () => void, timeout = 2500) {
  let cancelado = false
  let idle = 0
  let plano: ReturnType<typeof setTimeout> | undefined
  const agendar = () => {
    if (cancelado) return
    if (typeof requestIdleCallback === 'function') idle = requestIdleCallback(tarefa, { timeout })
    else plano = setTimeout(tarefa, 300) // Safari não tem requestIdleCallback.
  }
  if (document.readyState === 'complete') agendar()
  else window.addEventListener('load', agendar, { once: true })
  return () => {
    cancelado = true
    window.removeEventListener('load', agendar)
    if (idle) cancelIdleCallback(idle)
    if (plano) clearTimeout(plano)
  }
}

/** Próxima tarefa ociosa, como promessa: separa as etapas do porteiro em tarefas distintas. */
export function ociosa(timeout = 2500) {
  return new Promise<void>((resolve) => {
    depoisDoLoad(() => resolve(), timeout)
  })
}
