"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { postulantesService } from "@/services/postulantes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, Dumbbell } from "lucide-react";
import { toast } from "sonner";

export default function EvaluacionesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isMedico = user?.rol === "MEDICO";
  const isSupervisor = user?.rol === "SUPERVISOR";

  useEffect(() => {
    fetchPostulantes();
  }, []);

  const fetchPostulantes = async () => {
    try {
      const data = await postulantesService.getPostulantes();

      const pendientes = data.filter(
        (p) => p.estado === "INSCRITO" || p.estado === "EN_EVALUACION"
      );

      setPostulantes(pendientes);
    } catch (error) {
      console.error("❌ Error al cargar postulantes:", error);
      console.error("❌ Detalle:", error.response?.data);
      toast.error("Error al cargar postulantes");
    } finally {
      setLoading(false);
    }
  };

  const filtered = postulantes.filter((p) => {
    const nombre = p.nombre_completo || p.nombre || "";
    const ci = p.ci || "";
    return (
      nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ci.includes(searchTerm)
    );
  });

  const handleEvaluar = (postulante) => {
    if (isMedico) {
      router.push(
        `/evaluaciones/medica/${postulante.codigo_inscripcion || postulante.id}`
      );
    } else if (isSupervisor) {
      router.push(
        `/evaluaciones/fisica/${postulante.codigo_inscripcion || postulante.id}`
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isMedico && "Evaluaciones Médicas"}
            {isSupervisor && "Evaluaciones Físicas"}
          </h1>
          <p className="text-muted-foreground">
            {isMedico && "Registre las evaluaciones médicas de los postulantes"}
            {isSupervisor &&
              "Registre las evaluaciones físicas de los postulantes"}
          </p>
        </div>
        {isMedico && <Stethoscope className="h-8 w-8 text-primary" />}
        {isSupervisor && <Dumbbell className="h-8 w-8 text-primary" />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Postulantes Pendientes de Evaluación</CardTitle>
          <CardDescription>
            Lista de postulantes que requieren evaluación{" "}
            {isMedico ? "médica" : "física"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o CI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="text-center py-10">Cargando postulantes...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No hay postulantes pendientes de evaluación
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((postulante) => {
                const nombre =
                  postulante.nombre_completo ||
                  postulante.nombre ||
                  "Sin nombre";
                const ci = postulante.ci || "N/A";

                return (
                  <Card
                    key={`${postulante.id}-${postulante.codigo_inscripcion}`}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {nombre}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            CI: {ci}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {postulante.codigo_inscripcion}
                          </p>
                        </div>
                        <Badge
                          variant={
                            postulante.estado === "INSCRITO"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {postulante.estado}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => handleEvaluar(postulante)}
                        className="w-full"
                        size="sm"
                      >
                        {isMedico && "Evaluar Médicamente"}
                        {isSupervisor && "Evaluar Físicamente"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
