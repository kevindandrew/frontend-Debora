"use client";

import { useEffect, useState } from "react";
import { tramitesService } from "@/services/tramites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminTramitesPage() {
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTramite, setSelectedTramite] = useState(null);
  const [responseForm, setResponseForm] = useState({
    estado: "ACEPTADO",
    respuesta: "",
  });
  const [responding, setResponding] = useState(false);
  const [requisitos, setRequisitos] = useState({});

  const fetchTramites = async () => {
    try {
      const data = await tramitesService.getAllTramites();
      console.log("📋 Trámites básicos recibidos:", data);

      if (Array.isArray(data) && data.length > 0) {
        // Cargar detalles completos de cada trámite para obtener respuesta_admin
        const tramitesConDetalles = await Promise.all(
          data.map(async (tramite) => {
            try {
              const detalle = await tramitesService.getTramiteDetalle(
                tramite.id
              );
              return detalle;
            } catch (error) {
              console.error(
                `Error al cargar detalle de trámite ${tramite.id}:`,
                error
              );
              return tramite;
            }
          })
        );

        setTramites(tramitesConDetalles);
        setLoading(false);

        // Cargar requisitos después (sin bloquear)
        tramitesConDetalles.forEach(async (tramite) => {
          try {
            const reqs = await tramitesService.getRequisitos(tramite.id);
            setRequisitos((prev) => ({ ...prev, [tramite.id]: reqs }));
          } catch (error) {
            // Si no hay requisitos, no hacer nada
          }
        });
      } else {
        setTramites([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error al cargar trámites:", error);
      toast.error("Error al cargar trámites");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTramites();
  }, []);

  const handleResponse = async (e) => {
    e.preventDefault();

    if (responseForm.respuesta.length < 10) {
      toast.error("La respuesta debe tener al menos 10 caracteres");
      return;
    }

    console.log("📤 Enviando respuesta:");
    console.log("- Trámite ID:", selectedTramite.id);
    console.log("- Estado:", responseForm.estado);
    console.log("- Respuesta:", responseForm.respuesta);

    setResponding(true);
    try {
      const result = await tramitesService.responderTramite(
        selectedTramite.id,
        responseForm.estado,
        responseForm.respuesta
      );
      console.log("✅ Respuesta enviada correctamente:", result);
      toast.success("Respuesta enviada correctamente");
      setSelectedTramite(null);
      setResponseForm({ estado: "ACEPTADO", respuesta: "" });
      fetchTramites();
    } catch (error) {
      console.error("❌ Error al responder:", error);
      console.error("❌ Detalles completos:", error.response);
      toast.error(error.response?.data?.detail || "Error al enviar respuesta");
    } finally {
      setResponding(false);
    }
  };

  const filtered = tramites.filter(
    (t) =>
      t.descripcion_solicitud
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      t.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACEPTADO":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Aceptado
          </Badge>
        );
      case "RECHAZADO":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Rechazado
          </Badge>
        );
      case "EN_REVISION":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" /> En Revisión
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" /> Solicitado
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          Gestión de Trámites
        </h1>
        <p className="text-muted-foreground">
          Revisión y respuesta a solicitudes de licenciados
        </p>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por descripción o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando solicitudes...</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((tramite) => (
            <Card
              key={tramite.id}
              className="hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {tramite.tipo?.replace(/_/g, " ")}
                    </CardTitle>
                    <CardDescription>
                      Solicitado el{" "}
                      {new Date(tramite.fecha_solicitud).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(tramite.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-3 rounded-md text-sm">
                    <p>{tramite.descripcion_solicitud}</p>
                  </div>

                  {/* Documentos subidos por el licenciado */}
                  {requisitos[tramite.id] &&
                    requisitos[tramite.id].length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium mb-2">
                          📎 Documentos adjuntos:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {requisitos[tramite.id].map((req, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              asChild
                            >
                              <a
                                href={req.url_archivo}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {req.nombre_requisito || `Documento ${idx + 1}`}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                  {(tramite.estado === "SOLICITADO" ||
                    tramite.estado === "EN_REVISION") && (
                    <Dialog
                      open={selectedTramite?.id === tramite.id}
                      onOpenChange={(open) => !open && setSelectedTramite(null)}
                    >
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedTramite(tramite)}>
                          Responder Solicitud
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Responder Trámite</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleResponse}
                          className="space-y-4 pt-4"
                        >
                          <div className="space-y-2">
                            <Label>Acción</Label>
                            <Select
                              value={responseForm.estado}
                              onValueChange={(v) =>
                                setResponseForm({ ...responseForm, estado: v })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACEPTADO">
                                  Aceptar y Responder
                                </SelectItem>
                                <SelectItem value="RECHAZADO">
                                  Rechazar Solicitud
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>
                              Mensaje de Respuesta (mínimo 10 caracteres)
                            </Label>
                            <Textarea
                              placeholder="Escriba una respuesta para el solicitante..."
                              value={responseForm.respuesta}
                              onChange={(e) =>
                                setResponseForm({
                                  ...responseForm,
                                  respuesta: e.target.value,
                                })
                              }
                              required
                              minLength={10}
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={responding}
                          >
                            {responding && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            Enviar Respuesta
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}

                  {tramite.estado !== "SOLICITADO" &&
                    tramite.estado !== "EN_REVISION" && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          {tramite.estado === "ACEPTADO" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            Respuesta enviada:
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-md text-sm ${
                            tramite.estado === "ACEPTADO"
                              ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {tramite.respuesta_admin || "Sin respuesta"}
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No hay trámites para mostrar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
