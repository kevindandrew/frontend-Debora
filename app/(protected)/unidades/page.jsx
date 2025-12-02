"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin, Loader2, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAsignarDialogOpen, setIsAsignarDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    departamento: "",
    provincia: "",
    direccion: "",
    capacidad_maxima: "",
  });

  const [asignacionData, setAsignacionData] = useState({
    usuario_id: "",
    rol_en_unidad: "",
    gestion: new Date().getFullYear(),
  });

  const fetchData = async () => {
    try {
      const [unidadesData, usuariosData] = await Promise.all([
        adminService.getUnidades(),
        adminService.getUsuarios(),
      ]);

      const medicos = usuariosData.filter((u) => u.rol === "MEDICO");

      setUnidades(unidadesData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminService.createUnidad({
        ...formData,
        capacidad_maxima: parseInt(formData.capacidad_maxima),
      });
      toast.success("Unidad creada correctamente");
      setIsDialogOpen(false);
      setFormData({
        nombre: "",
        departamento: "",
        provincia: "",
        direccion: "",
        capacidad_maxima: "",
      });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear unidad");
    } finally {
      setCreating(false);
    }
  };

  const handleAsignar = async () => {
    if (!asignacionData.usuario_id || !asignacionData.rol_en_unidad) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const payload = {
      usuario_id: parseInt(asignacionData.usuario_id),
      rol_en_unidad: asignacionData.rol_en_unidad,
      gestion: parseInt(asignacionData.gestion),
    };

    try {
      await adminService.asignarPersonal(selectedUnidad.id, payload);

      toast.success(
        `Personal asignado a ${selectedUnidad.nombre} correctamente`
      );
      setIsAsignarDialogOpen(false);
      setAsignacionData({
        usuario_id: "",
        rol_en_unidad: "",
        gestion: new Date().getFullYear(),
      });
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("❌ Response data:", error.response?.data);
      console.error("❌ Status:", error.response?.status);

      const errorMessage =
        error.response?.data?.detail || "Error al asignar personal";
      toast.error(errorMessage);
    }
  };

  const openAsignarDialog = (unidad) => {
    setSelectedUnidad(unidad);
    setIsAsignarDialogOpen(true);
  };

  const personalDisponible = usuarios.filter((u) => {
    const rol = u.rol?.toUpperCase();
    return rol === "MEDICO" || rol === "SUPERVISOR" || rol === "JEFE_UNIDAD";
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Unidades de Reclutamiento
          </h1>
          <p className="text-muted-foreground">Gestión de centros militares</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Unidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Unidad Militar</DialogTitle>
              <DialogDescription>
                Complete los datos para registrar una nueva unidad de
                reclutamiento.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Unidad</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: RI-1 COLORADOS"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    placeholder="La Paz"
                    value={formData.departamento}
                    onChange={(e) =>
                      setFormData({ ...formData, departamento: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    placeholder="Murillo"
                    value={formData.provincia}
                    onChange={(e) =>
                      setFormData({ ...formData, provincia: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  placeholder="Av. Saavedra esq. Calle 1"
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad Máxima</Label>
                <Input
                  id="capacidad"
                  type="number"
                  placeholder="Ej: 500"
                  value={formData.capacidad_maxima}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacidad_maxima: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar Unidad
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando unidades...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unidades.map((unidad) => (
            <Card key={unidad.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                  {unidad.nombre}
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm mt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {unidad.departamento}, {unidad.provincia}
                    </span>
                  </div>
                  <p className="text-muted-foreground pl-6">
                    {unidad.direccion}
                  </p>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="font-medium">Capacidad:</span>
                    <span className="bg-secondary px-2 py-1 rounded text-xs">
                      {unidad.capacidad_maxima} reclutas
                    </span>
                  </div>

                  {/* Personal Asignado Section */}
                  <div className="pt-4 border-t mt-4">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Personal Asignado
                    </h4>

                    {!unidad.jefes_unidad?.length &&
                    !unidad.medicos?.length &&
                    !unidad.supervisores?.length ? (
                      <p className="text-xs text-muted-foreground italic">
                        Sin personal asignado
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {unidad.jefes_unidad?.map((p) => (
                          <div
                            key={`jefe-${p.id}`}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-muted-foreground text-xs">
                              Jefe Unidad
                            </span>
                            <span
                              className="font-medium truncate max-w-[150px]"
                              title={`${p.nombres} ${p.paterno} ${
                                p.materno || ""
                              }`}
                            >
                              {p.nombres} {p.paterno} {p.materno || ""}
                            </span>
                          </div>
                        ))}
                        {unidad.medicos?.map((p) => (
                          <div
                            key={`medico-${p.id}`}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-muted-foreground text-xs">
                              Médico
                            </span>
                            <span
                              className="font-medium truncate max-w-[150px]"
                              title={`${p.nombres} ${p.paterno} ${
                                p.materno || ""
                              }`}
                            >
                              {p.nombres} {p.paterno} {p.materno || ""}
                            </span>
                          </div>
                        ))}
                        {unidad.supervisores?.map((p) => (
                          <div
                            key={`sup-${p.id}`}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-muted-foreground text-xs">
                              Supervisor
                            </span>
                            <span
                              className="font-medium truncate max-w-[150px]"
                              title={`${p.nombres} ${p.paterno} ${
                                p.materno || ""
                              }`}
                            >
                              {p.nombres} {p.paterno} {p.materno || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => openAsignarDialog(unidad)}
                    className="w-full mt-3"
                    size="sm"
                    variant="outline"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Asignar Personal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {unidades.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No hay unidades registradas.
            </div>
          )}
        </div>
      )}

      {/* Dialog asignar personal */}
      <Dialog open={isAsignarDialogOpen} onOpenChange={setIsAsignarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Asignar Personal a {selectedUnidad?.nombre}
            </DialogTitle>
            <DialogDescription>
              Seleccione un médico o supervisor para asignar a esta unidad.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Usuario (Médico o Supervisor)</Label>
              <Select
                value={asignacionData.usuario_id}
                onValueChange={(v) =>
                  setAsignacionData({ ...asignacionData, usuario_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {personalDisponible.length > 0 ? (
                    personalDisponible.map((u) => {
                      // Mostrar nombre completo ahora que el backend lo devuelve
                      const nombreCompleto = [u.nombres, u.paterno, u.materno]
                        .filter(Boolean)
                        .join(" ");

                      const display = nombreCompleto
                        ? `${nombreCompleto} (${u.username})`
                        : u.username;

                      return (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {display} - {u.rol}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No hay médicos o supervisores disponibles.
                      <br />
                      <a
                        href="/usuarios"
                        className="text-primary hover:underline"
                      >
                        Crear usuarios aquí
                      </a>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rol en la Unidad</Label>
              <Select
                value={asignacionData.rol_en_unidad}
                onValueChange={(v) =>
                  setAsignacionData({ ...asignacionData, rol_en_unidad: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICO">Médico</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="JEFE_UNIDAD">Jefe de Unidad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gestión</Label>
              <Select
                value={asignacionData.gestion.toString()}
                onValueChange={(v) =>
                  setAsignacionData({ ...asignacionData, gestion: parseInt(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAsignarDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAsignar}>Asignar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
