"use client";

import { useEffect, useState } from "react";
import { tramitesService } from "@/services/tramites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  Paperclip,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function MisTramitesPage() {
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Upload document dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTramite, setSelectedTramite] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    tipo: "",
    descripcion: "",
  });

  const fetchTramites = async () => {
    try {
      const data = await tramitesService.getMisTramites();
      console.log("📋 Trámites básicos recibidos:", data);

      if (Array.isArray(data) && data.length > 0) {
        // Cargar detalles completos de cada trámite para obtener respuesta_admin
        const tramitesConDetalles = await Promise.all(
          data.map(async (tramite) => {
            try {
              const detalle = await tramitesService.getTramiteDetalle(
                tramite.id
              );
              console.log(`📋 Detalle del trámite ${tramite.id}:`, detalle);
              return detalle; // Retornar el detalle completo
            } catch (error) {
              console.error(
                `Error al cargar detalle de trámite ${tramite.id}:`,
                error
              );
              return tramite; // Si falla, devolver el básico
            }
          })
        );

        setTramites(tramitesConDetalles);
      } else {
        setTramites([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar trámites:", error);
      toast.error("Error al cargar mis trámites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTramites();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.tipo) {
      toast.error("Seleccione un tipo de trámite");
      return;
    }

    setCreating(true);
    try {
      await tramitesService.crearTramite(formData.tipo, formData.descripcion);
      toast.success("Trámite solicitado correctamente");
      setIsDialogOpen(false);
      setFormData({ tipo: "", descripcion: "" });
      fetchTramites();
    } catch (error) {
      console.error(error);
      toast.error("Error al solicitar trámite");
    } finally {
      setCreating(false);
    }
  };

  const handleAddFile = () => {
    setUploadFiles([
      ...uploadFiles,
      { tipoRequisito: "COPIA_CI", archivo: null },
    ]);
  };

  const handleRemoveFile = (index) => {
    setUploadFiles(uploadFiles.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, field, value) => {
    const newFiles = [...uploadFiles];
    newFiles[index][field] = value;
    setUploadFiles(newFiles);
  };

  const handleUploadDocuments = async (e) => {
    e.preventDefault();

    if (uploadFiles.length === 0) {
      toast.error("Debe agregar al menos un documento");
      return;
    }

    if (uploadFiles.some((f) => !f.archivo)) {
      toast.error("Todos los documentos deben tener un archivo seleccionado");
      return;
    }

    setUploading(true);
    try {
      // Subir cada archivo secuencialmente
      for (const file of uploadFiles) {
        await tramitesService.subirDocumento(
          selectedTramite.id,
          file.archivo,
          file.tipoRequisito
        );
      }

      toast.success(
        `${uploadFiles.length} documento(s) subido(s) correctamente`
      );
      setUploadDialogOpen(false);
      setUploadFiles([]);
      setSelectedTramite(null);
      fetchTramites();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir documentos");
    } finally {
      setUploading(false);
    }
  };

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
      default: // SOLICITADO
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" /> Solicitado
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Trámites</h1>
          <p className="text-muted-foreground">
            Solicitud de certificados y rectificaciones
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Trámite
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Solicitar Nuevo Trámite</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Trámite</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERDIDA">
                      Pérdida de Documento
                    </SelectItem>
                    <SelectItem value="RECTIFICACION">
                      Rectificación de Datos
                    </SelectItem>
                    <SelectItem value="CERTIFICACION">Certificación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción / Motivo</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalle el motivo de su solicitud..."
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  required
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                💡 Podrá subir documentos de respaldo después de crear el
                trámite
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Solicitud
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {tramites.map((tramite) => (
            <Card key={tramite.id}>
              <CardHeader className="pb-3">
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
              <CardContent className="space-y-3">
                <div className="bg-muted/30 p-3 rounded-md text-sm">
                  <p>{tramite.descripcion_solicitud}</p>
                </div>

                {/* Respuesta del admin */}
                {tramite.estado !== "SOLICITADO" && tramite.respuesta_admin && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {tramite.estado === "ACEPTADO" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <p className="text-sm font-medium">
                        Respuesta del Administrador:
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-md text-sm ${
                        tramite.estado === "ACEPTADO"
                          ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {tramite.respuesta_admin}
                      </p>
                    </div>
                    {tramite.archivo_respuesta_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        asChild
                      >
                        <a
                          href={tramite.archivo_respuesta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Descargar Documento Oficial
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                {tramite.estado === "SOLICITADO" && (
                  <Dialog
                    open={
                      uploadDialogOpen && selectedTramite?.id === tramite.id
                    }
                    onOpenChange={(open) => {
                      setUploadDialogOpen(open);
                      if (!open) setSelectedTramite(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTramite(tramite)}
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Subir Documentos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Subir Documentos de Respaldo</DialogTitle>
                        <DialogDescription>
                          Puede agregar múltiples documentos para este trámite
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleUploadDocuments}
                        className="space-y-4 pt-4"
                      >
                        {/* Lista de archivos */}
                        <div className="space-y-3">
                          {uploadFiles.map((file, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-3 space-y-3 relative"
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 p-0"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>

                              <div className="space-y-2">
                                <Label>Tipo de Documento</Label>
                                <Select
                                  value={file.tipoRequisito}
                                  onValueChange={(value) =>
                                    handleFileChange(
                                      index,
                                      "tipoRequisito",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="COPIA_CI">
                                      Copia de CI
                                    </SelectItem>
                                    <SelectItem value="DECLARACION_JURADA">
                                      Declaración Jurada
                                    </SelectItem>
                                    <SelectItem value="FOTOGRAFIA">
                                      Fotografía 4x4
                                    </SelectItem>
                                    <SelectItem value="OTRO">Otro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Archivo</Label>
                                <Input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) =>
                                    handleFileChange(
                                      index,
                                      "archivo",
                                      e.target.files?.[0]
                                    )
                                  }
                                  required
                                />
                                {file.archivo && (
                                  <p className="text-xs text-muted-foreground">
                                    {file.archivo.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleAddFile}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Agregar Documento
                        </Button>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={uploading || uploadFiles.length === 0}
                        >
                          {uploading && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Subir {uploadFiles.length} Documento(s)
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))}
          {tramites.length === 0 && (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium">No tienes trámites solicitados</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Inicia un nuevo trámite usando el botón superior.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
