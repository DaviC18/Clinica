import { Phone } from "lucide-react";
import { fatos } from "../data/fatos.ts";

type Props = { rotulo: string; className?: string };

export function LinkLigar({ rotulo, className = "" }: Props) {
  // Sem WhatsApp o botão principal já liga: um segundo link seria uma escolha falsa.
  if (!fatos.whatsapp.confirmado) return null;
  return (
    <a
      href={`tel:${fatos.telefone.tel}`}
      className={`inline-flex min-h-toque items-center gap-2 text-corpo font-semibold underline decoration-1 underline-offset-4 ${className}`}
    >
      <Phone aria-hidden="true" className="size-5 shrink-0" />
      {rotulo}
    </a>
  );
}
