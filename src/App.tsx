import { useEffect } from 'react'
import { iniciarAnimacoes } from './animations/iniciar.ts'
import { Header } from './components/Header.tsx'
import { Metadados } from './components/Metadados.tsx'
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
      <Header />
      <main>
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
