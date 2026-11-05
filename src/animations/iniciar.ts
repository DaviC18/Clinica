import { depoisDoLoad } from './ocioso.ts'

const FECHADO = 'inset(0% calc(50% - 1px))'
const ABERTO = 'inset(0% calc(0% - 0px))'

/** GSAP fora do JS inicial: nada aqui toca #hero ou CTA. */
export function iniciarAnimacoes() {
  let desfazer: (() => void) | undefined
  let cancelado = false

  // Sem movimento não há o que animar: GSAP nem é baixado.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const cancelarEspera = depoisDoLoad(() => {
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelado) return
      gsap.registerPlugin(ScrollTrigger)
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // IntersectionObserver em vez de um ScrollTrigger por bloco: cada trigger a mais força layout.
        const observador = new IntersectionObserver(
          (entradas) => {
            for (const { isIntersecting, target } of entradas) {
              if (!isIntersecting) continue
              observador.unobserve(target)
              gsap.from(target, { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all' })
            }
          },
          { rootMargin: '0px 0px -10% 0px' },
        )
        for (const el of gsap.utils.toArray<HTMLElement>('[data-revelar]')) observador.observe(el)

        // A assinatura: a fenda se abre em #diferenciais e se fecha antes de #cta-final.
        // Só as faixas sem texto são recortadas, e o gesto termina antes de o título entrar.
        gsap.fromTo(
          '[data-fenda]',
          { clipPath: FECHADO },
          {
            clipPath: ABERTO,
            ease: 'none',
            scrollTrigger: { trigger: '[data-fenda]', start: 'top bottom', end: 'bottom bottom', scrub: true },
          },
        )
        gsap.fromTo(
          '[data-cortina]',
          { clipPath: ABERTO },
          {
            clipPath: FECHADO,
            ease: 'none',
            scrollTrigger: { trigger: '[data-cortina]', start: 'top 70%', end: 'bottom 40%', scrub: true },
          },
        )
        return () => observador.disconnect()
      })
      desfazer = () => mm.revert()
    })
  })

  return () => {
    cancelado = true
    cancelarEspera()
    desfazer?.()
  }
}
