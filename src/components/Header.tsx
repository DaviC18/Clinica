import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { interfaceTextos } from "../data/interface.ts";
import { CtaWhatsApp } from "./CtaWhatsApp.tsx";
import { LinkLigar } from "./LinkLigar.tsx";
import { conteudo } from "../data/conteudo.ts";

const nav = interfaceTextos.nav;

const { eyebrow, ctaPrimario, ctaSecundario } = conteudo.hero;

const linkClasse =
  "inline-flex min-h-toque items-center rounded-suave px-3 text-legal font-semibold text-nevoa transition-colors duration-rapido ease-foco hover:text-porcelana focus-visible:outline-fluor";

function MarcaOlho() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 shrink-0">
      <path d="M16 3v26" stroke="var(--cor-porcelana)" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse
        cx="16"
        cy="16"
        rx="8.5"
        ry="11"
        fill="none"
        stroke="var(--cor-nevoa)"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function Header() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-cobalto bg-noite text-porcelana">
      <div className="mx-auto box-content flex h-16 max-w-pagina items-center justify-between gap-4 px-gutter md:h-20">
        <a
          href="#hero"
          aria-label={`${nav.marca} — ir para o início`}
          className="inline-flex min-h-toque items-center gap-2 focus-visible:outline-fluor"
        >
          <MarcaOlho />
          <span className="hidden font-display text-corpo font-medium md:inline">{nav.marca}</span>
        </a>

        <nav aria-label={nav.rotulo} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.itens.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={linkClasse}>
                  {item.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <CtaWhatsApp rotulo={nav.agendar} compacto semIcone className="text-legal" />
          </div>
          <button
            type="button"
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? nav.fecharMenu : nav.abrirMenu}
            onClick={() => setAberto((valor) => !valor)}
            className="inline-flex size-11 items-center justify-center rounded-suave text-porcelana transition-colors duration-rapido ease-foco hover:bg-cobalto focus-visible:outline-fluor xl:hidden"
          >
            {aberto ? (
              <X aria-hidden="true" className="size-6" />
            ) : (
              <Menu aria-hidden="true" className="size-6" />
            )}
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        hidden={!aberto}
        className="border-t border-cobalto bg-noite px-gutter pt-2 pb-6 xl:hidden"
      >
        <nav aria-label={nav.rotuloMobile}>
          <ul className="flex flex-col">
            {nav.itens.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setAberto(false)} className={linkClasse}>
                  {item.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-3 flex flex-col gap-1 md:mt-4 xl:mt-6 xl:flex-row xl:items-start xl:gap-6">
          <div className="flex flex-col gap-1.5">
            <CtaWhatsApp rotulo={ctaPrimario} className="w-full md:w-auto md:self-start" />
            <p className="text-corpo text-nevoa">{eyebrow}</p>
          </div>
          <LinkLigar
            rotulo={ctaSecundario}
            className="self-start focus-visible:outline-fluor xl:mt-3"
          />
        </div>
      </div>
    </header>
  );
}
