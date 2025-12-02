"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { postulantesService } from "@/services/postulantes";
import { evaluacionesService } from "@/services/evaluaciones";
import { DocumentUpload } from "@/components/document-upload";
import { ExamenesExternosList } from "@/components/postulantes/ExamenesExternosList";
import { HistorialServicioList } from "@/components/postulantes/HistorialServicioList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-context";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PostulanteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [postulante, setPostulante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [evaluaciones, setEvaluaciones] = useState({
    medica: null,
    fisica: null,
  });

  // State for verdict dialog
  const [verdictState, setVerdictState] = useState({
    isOpen: false,
    estado: null,
  });

  const fetchPostulante = async () => {
    try {
      const data = await postulantesService.getPostulanteByCodigo(
        params.codigo
      );

      setPostulante(data);

      // Cargar evaluaciones si existen
      try {
        const [medica, fisica] = await Promise.allSettled([
          evaluacionesService.obtenerEvaluacionMedica(data.id),
          evaluacionesService.obtenerEvaluacionFisica(data.id),
        ]);

        setEvaluaciones({
          medica: medica.status === "fulfilled" ? medica.value : null,
          fisica: fisica.status === "fulfilled" ? fisica.value : null,
        });
      } catch (e) {
        console.error("Error cargando evaluaciones", e);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar el postulante");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostulante();
  }, [params.codigo]);

  const handleVerdictClick = (estado) => {
    setVerdictState({
      isOpen: true,
      estado,
    });
  };

  const confirmVerdict = async () => {
    const { estado } = verdictState;
    if (!estado) return;

    setProcessing(true);
    try {
      await postulantesService.actualizarEstado(
        postulante.id,
        estado,
        "Dictamen final"
      );
      toast.success(`Postulación marcada como ${estado}`);
      await fetchPostulante();
    } catch (error) {
      console.error("Error:", error);
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Error al actualizar estado";
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
      setVerdictState({ isOpen: false, estado: null });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        Cargando información...
      </div>
    );
  }

  if (!postulante) {
    return <div className="text-center py-10">Postulante no encontrado</div>;
  }

  const getRequiredDocs = (modalidad) => {
    const common = ["CI", "CERTIFICADO_NACIMIENTO", "GRUPO_SANGUINEO"];
    if (modalidad?.includes("PREMILITAR")) {
      return [
        ...common,
        "LIBRETA_ESCOLAR_4TO",
        "LIBRETA_ESCOLAR_5TO",
        "INVITACION",
      ];
    }
    if (modalidad?.includes("MILITAR")) {
      return [...common, "PRUEBA_EMBARAZO_MUJERES"];
    }
    if (modalidad?.includes("VOLUNTARIADO")) {
      return [...common, "SEGURO_MEDICO"];
    }
    return common;
  };

  const requiredDocs = getRequiredDocs(postulante.modalidad);
  const canDecide = ["ADMINISTRADOR", "JEFE_UNIDAD", "DIRECTOR"].includes(
    user?.rol
  );

  // Verificar requisitos de evaluación
  const medicaAprobada =
    evaluaciones.medica && evaluaciones.medica.resultado_apto;
  const fisicaAprobada =
    evaluaciones.fisica && evaluaciones.fisica.resultado_final_supervisor;
  const requisitosCompletos = medicaAprobada && fisicaAprobada;
  const nombreCompleto = postulante.persona
    ? `${postulante.persona.nombres || ""} ${
        postulante.persona.paterno || ""
      } ${postulante.persona.materno || ""}`.trim()
    : "Sin nombre";
  const ci = postulante.persona?.ci || "N/A";
  const edad = postulante.persona?.edad || "N/A";
  const fechaRegistro =
    postulante.fecha_postulacion || postulante.fecha_registro;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg mb-4">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-primary">
                    {nombreCompleto.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-center">{nombreCompleto}</h3>
                <p className="text-sm text-muted-foreground">{ci}</p>
                <Badge
                  className="mt-2"
                  variant={
                    postulante.estado === "APTO" ? "success" : "secondary"
                  }
                >
                  {postulante.estado}
                </Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{edad} años</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Inscrito:{" "}
                    {fechaRegistro
                      ? new Date(fechaRegistro).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Código: {postulante.codigo_inscripcion || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentación Requerida
              </CardTitle>
              <CardDescription>
                Suba los documentos digitales requeridos para la modalidad{" "}
                <strong>{postulante.modalidad || "N/A"}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                codigo={postulante.codigo_inscripcion}
                requiredDocs={requiredDocs}
                uploadedDocs={postulante.documentos || []}
                onUploadSuccess={fetchPostulante}
              />
            </CardContent>
          </Card>

          <ExamenesExternosList
            postulacionId={postulante.id}
            readOnly={!canDecide}
          />
          <HistorialServicioList
            postulacionId={postulante.id}
            readOnly={!canDecide}
          />

          {canDecide && (
            <Card>
              <CardHeader>
                <CardTitle>Dictamen Final</CardTitle>
                <CardDescription>
                  Evaluación final para la admisión del postulante.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2 mb-2">
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium">
                      Evaluación Médica:
                    </span>
                    {medicaAprobada ? (
                      <Badge
                        variant="success"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" /> Aprobada
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" /> Pendiente/Reprobada
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium">
                      Evaluación Física:
                    </span>
                    {fisicaAprobada ? (
                      <Badge
                        variant="success"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" /> Aprobada
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" /> Pendiente/Reprobada
                      </Badge>
                    )}
                  </div>
                </div>

                {!requisitosCompletos && (
                  <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
                    ⚠️ Debe aprobar ambas evaluaciones para ser habilitado.
                  </div>
                )}

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleVerdictClick("APTO")}
                  disabled={
                    processing ||
                    postulante.estado === "APTO" ||
                    !requisitosCompletos
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar (APTO)
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleVerdictClick("NO_APTO")}
                  disabled={processing || postulante.estado === "NO_APTO"}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar (NO APTO)
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Alert Dialog para Dictamen */}
      <AlertDialog
        open={verdictState.isOpen}
        onOpenChange={(open) =>
          setVerdictState((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar Dictamen?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de marcar esta postulación como{" "}
              <strong>{verdictState.estado}</strong>? Esta acción es definitiva
              y afectará el estado del postulante en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmVerdict}
              className={
                verdictState.estado === "NO_APTO"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
