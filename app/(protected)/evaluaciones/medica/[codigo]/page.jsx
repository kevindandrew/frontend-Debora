"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { postulantesService } from "@/services/postulantes";
import { EvaluacionMedicaForm } from "@/components/evaluaciones/evaluacion-medica-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EvaluacionMedicaPage() {
  const params = useParams();
  const router = useRouter();
  const [postulante, setPostulante] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostulante();
  }, [params.codigo]);

  const fetchPostulante = async () => {
    try {
      const data = await postulantesService.getPostulanteByCodigo(
        params.codigo
      );
      setPostulante(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar postulante");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success("Evaluación registrada. Redirigiendo...");
    setTimeout(() => {
      router.push("/evaluaciones");
    }, 1500);
  };

  if (loading) {
    return <div className="flex justify-center py-10">Cargando...</div>;
  }

  if (!postulante) {
    return <div className="text-center py-10">Postulante no encontrado</div>;
  }

  const nombreCompleto = postulante.persona
    ? `${postulante.persona.nombres || ""} ${
        postulante.persona.paterno || ""
      } ${postulante.persona.materno || ""}`.trim()
    : "Sin nombre";

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Evaluación Médica</CardTitle>
          <div className="text-sm text-muted-foreground mt-2">
            <p className="font-medium">{nombreCompleto}</p>
            <p>CI: {postulante.persona?.ci || "N/A"}</p>
            <p>Código: {postulante.codigo_inscripcion}</p>
          </div>
        </CardHeader>
        <CardContent>
          <EvaluacionMedicaForm
            postulante={postulante}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
