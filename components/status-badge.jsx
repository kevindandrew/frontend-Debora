import { cn } from "@/lib/utils"

const statusConfig = {
  INSCRITO: {
    label: "Inscrito",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  EN_EVALUACION: {
    label: "En Evaluación",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APTO: {
    label: "Apto",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  NO_APTO: {
    label: "No Apto",
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.INSCRITO

  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className)}
    >
      {config.label}
    </span>
  )
}
