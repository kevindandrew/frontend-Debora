"use client";

import { useState, useEffect } from "react";
import { modalidadesService } from "@/services/modalidades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Settings,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function ModalidadesPage() {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingModalidad, setEditingModalidad] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fecha_inicio_inscripcion: "",
    fecha_fin_inscripcion: "",
  });

  useEffect(() => {
    fetchModalidades();
  }, []);

  const fetchModalidades = async () => {
    try {
      const data = await modalidadesService.getModalidades();
      setModalidades(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar modalidades");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (modalidad) => {
    setEditingModalidad(modalidad);
    setFormData({
      fecha_inicio_inscripcion: modalidad.fecha_inicio_inscripcion || "",
      fecha_fin_inscripcion: modalidad.fecha_fin_inscripcion || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.fecha_inicio_inscripcion || !formData.fecha_fin_inscripcion) {
      toast.error("Debe completar ambas fechas");
      return;
    }

    if (
      new Date(formData.fecha_fin_inscripcion) <
      new Date(formData.fecha_inicio_inscripcion)
    ) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setSaving(true);
    try {
      await modalidadesService.configurarFechas(editingModalidad.id, formData);
      toast.success("Fechas configuradas correctamente");

      // Cerrar el diálogo
      setIsDialogOpen(false);
      setEditingModalidad(null);
      setFormData({
        fecha_inicio_inscripcion: "",
        fecha_fin_inscripcion: "",
      });

      // Forzar recarga desde el backend
      setLoading(true);
      await fetchModalidades();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar las fechas");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (modalidad) => {
    const now = new Date();
    const inicio = modalidad.fecha_inicio_inscripcion
      ? parseISO(modalidad.fecha_inicio_inscripcion)
      : null;
    const fin = modalidad.fecha_fin_inscripcion
      ? parseISO(modalidad.fecha_fin_inscripcion)
      : null;

    if (!inicio || !fin) {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Sin configurar</span>
        </div>
      );
    }

    if (now >= inicio && now <= fin) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Inscripciones Abiertas</span>
        </div>
      );
    }

    if (now < inicio) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Próximamente</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-gray-500">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Cerrado</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Modalidades de Servicio
        </h1>
        <p className="text-muted-foreground">
          Configurar fechas de inscripción para cada modalidad
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modalidades.map((modalidad) => (
            <Card
              key={modalidad.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {modalidad.nombre}
                    </CardTitle>
                    <CardDescription>
                      Edad: {modalidad.edad_minima} - {modalidad.edad_maxima}{" "}
                      años
                    </CardDescription>
                  </div>
                  {getStatusBadge(modalidad)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {modalidad.descripcion && (
                  <p className="text-sm text-muted-foreground">
                    {modalidad.descripcion}
                  </p>
                )}

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Inicio:</span>
                    <span className="font-medium">
                      {modalidad.fecha_inicio_inscripcion
                        ? format(
                            parseISO(modalidad.fecha_inicio_inscripcion),
                            "PPP",
                            { locale: es }
                          )
                        : "No configurado"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fin:</span>
                    <span className="font-medium">
                      {modalidad.fecha_fin_inscripcion
                        ? format(
                            parseISO(modalidad.fecha_fin_inscripcion),
                            "PPP",
                            { locale: es }
                          )
                        : "No configurado"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleEdit(modalidad)}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Fechas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para configurar fechas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Configurar Fechas - {editingModalidad?.nombre}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="inicio">Fecha de Inicio de Inscripciones</Label>
              <Input
                id="inicio"
                type="date"
                value={formData.fecha_inicio_inscripcion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fecha_inicio_inscripcion: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fin">Fecha de Fin de Inscripciones</Label>
              <Input
                id="fin"
                type="date"
                value={formData.fecha_fin_inscripcion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fecha_fin_inscripcion: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
