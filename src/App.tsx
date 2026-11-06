import { useEffect } from 'react'
import { iniciarAnimacoes } from './animations/iniciar.ts'
import { Header } from './components/Header.tsx'
import { Metadados } from './components/Metadados.tsx'
import { interfaceTextos } from './data/interface.ts'
import { Avaliacoes } from './sections/Avaliacoes.tsx'
import { CtaFinal } from './sections/CtaFinal.tsx'
import { Diferenciais } from './sections/Diferenciais.tsx'
import { Faq } from './sections/Faq.tsx'
import { Hero } from './sections/Hero.tsx'
import { Horarios } from './sections/Horarios.tsx'
import { Medica } from './sections/Medica.tsx'
import { Rodape } from './sections/Rodape.tsx'
import { Servicos } from './sections/Servicos.tsx'

export default function App() {
  useEffect(() => iniciarAnimacoes(), [])

  return (
    <>
      <Metadados />
      <a
        href="#conteudo"
        className="fixed top-0 left-2 z-60 max-w-[calc(100vw-1rem)] -translate-y-full rounded-suave bg-fluor px-4 py-3 text-corpo font-semibold text-tinta focus-visible:translate-y-2"
      >
        {interfaceTextos.pularConteudo}
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Diferenciais />
        <Medica />
        <Servicos />
        <Avaliacoes />
        <Horarios />
        <Faq />
        <CtaFinal />
      </main>
      <Rodape />
    </>
  )
}
