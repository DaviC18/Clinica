import type { Config } from 'tailwindcss'

// Dono: Arquiteto. Os valores vivem em src/styles/tokens.css; aqui só há apontadores.
// O Tailwind 4 lê este arquivo pelo @config em src/styles/global.css.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noite: 'var(--cor-noite)',
        cobalto: 'var(--cor-cobalto)',
        'cobalto-vivo': 'var(--cor-cobalto-vivo)',
        porcelana: 'var(--cor-porcelana)',
        'nevoa-clara': 'var(--cor-nevoa-clara)',
        nevoa: 'var(--cor-nevoa)',
        tinta: 'var(--cor-tinta)',
        'tinta-suave': 'var(--cor-tinta-suave)',
        fluor: 'var(--cor-fluor)',
        'fluor-escuro': 'var(--cor-fluor-escuro)',
        ambar: 'var(--cor-ambar)',
        'ambar-escuro': 'var(--cor-ambar-escuro)',
      },
      fontFamily: {
        display: 'var(--fonte-display)',
        corpo: 'var(--fonte-corpo)',
      },
      // O conteúdo pede o layout largo já em 1024 px: abaixo disso o hero empilha quatro linhas.
      screens: {
        xl: '64rem',
      },
      fontSize: {
        legal: ['var(--texto-legal)', { lineHeight: 'var(--entrelinha-corpo)' }],
        corpo: ['var(--texto-corpo)', { lineHeight: 'var(--entrelinha-corpo)' }],
        'corpo-g': ['var(--texto-corpo-g)', { lineHeight: 'var(--entrelinha-corpo)' }],
        'titulo-3': ['var(--texto-titulo-3)', { lineHeight: 'var(--entrelinha-titulo)' }],
        'titulo-2': ['var(--texto-titulo-2)', { lineHeight: 'var(--entrelinha-titulo)' }],
        hero: ['var(--texto-hero)', { lineHeight: 'var(--entrelinha-hero)' }],
        nota: ['var(--texto-nota)', { lineHeight: '1' }],
      },
      spacing: {
        gutter: 'var(--espaco-gutter)',
        secao: 'var(--espaco-secao)',
        bloco: 'var(--espaco-bloco)',
        toque: 'var(--alvo-toque)',
      },
      maxWidth: {
        pagina: 'var(--largura-pagina)',
        texto: 'var(--largura-texto)',
      },
      borderRadius: {
        suave: 'var(--raio-suave)',
      },
      boxShadow: {
        flutuante: 'var(--sombra-flutuante)',
      },
      transitionDuration: {
        rapido: 'var(--duracao-rapido)',
        medio: 'var(--duracao-medio)',
      },
      transitionTimingFunction: {
        foco: 'var(--curva-foco)',
      },
    },
  },
} satisfies Config
