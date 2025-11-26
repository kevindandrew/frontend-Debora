import { cn } from "@/lib/utils"

export function StatsCard({ title, value, icon: Icon, variant = "default" }) {
  const variants = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/20",
    warning: "bg-amber-50 border-amber-200",
    success: "bg-emerald-50 border-emerald-200",
  }

  return (
    <div className={cn("rounded-xl border p-6 transition-shadow hover:shadow-md", variants[variant])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  )
}
