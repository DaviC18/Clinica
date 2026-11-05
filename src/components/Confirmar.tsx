import { SemQuebra } from './SemQuebra.tsx'

export function Confirmar({ children }: { children: string }) {
  return (
    <span className="rounded-suave bg-ambar box-decoration-clone px-1.5 py-0.5 text-legal font-semibold text-tinta">
      <SemQuebra texto={children} />
    </span>
  )
}
