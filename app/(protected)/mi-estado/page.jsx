"use client"

import { postulantes } from "@/lib/mock-data"
import { StatusBadge } from "@/components/status-badge"
import { User, Phone, Mail, Calendar, MapPin, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function MiEstadoPage() {
  // Simulate logged in postulante (ID 4 from mock data - Pedro Mamani)
  const miDatos = postulantes.find((p) => p.id === 1) || postulantes[0]

  const statusMessages = {
    INSCRITO: "Tu inscripción ha sido recibida. Pendiente de revisión.",
    EN_EVALUACION: "Estás en proceso de evaluación. Te notificaremos los resultados.",
    APTO: "¡Felicidades! Has sido declarado APTO para el servicio.",
    NO_APTO: "Lo sentimos, no has cumplido con los requisitos mínimos requeridos.",
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Status Card - Main Focus */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div
          className={`p-6 text-center ${
            miDatos.estado === "APTO"
              ? "bg-emerald-50"
              : miDatos.estado === "NO_APTO"
                ? "bg-red-50"
                : miDatos.estado === "EN_EVALUACION"
                  ? "bg-amber-50"
                  : "bg-slate-50"
          }`}
        >
          <div className="mb-3">
            <StatusBadge status={miDatos.estado} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {miDatos.estado === "APTO"
              ? "¡Felicidades!"
              : miDatos.estado === "NO_APTO"
                ? "Proceso Finalizado"
                : "Estado Actual"}
          </h2>
          <p className="text-sm text-muted-foreground">{statusMessages[miDatos.estado]}</p>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{miDatos.nombre}</h3>
              <p className="text-sm text-muted-foreground">{miDatos.modalidad}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">CI:</span>
              <span className="font-medium text-foreground">{miDatos.ci}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Unidad:</span>
              <span className="font-medium text-foreground">{miDatos.unidad}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Teléfono:</span>
              <span className="font-medium text-foreground">{miDatos.telefono}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{miDatos.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Nacimiento:</span>
              <span className="font-medium text-foreground">
                {new Date(miDatos.fechaNacimiento).toLocaleDateString("es-BO")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <Link
        href="/mis-tramites"
        className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Mis Documentos</p>
            <p className="text-xs text-muted-foreground">Gestiona tus requisitos</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>
    </div>
  )
}
