"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
  UserPlus,
  MoreHorizontal,
  UserCircle,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const rolColors = {
  ADMINISTRADOR: "bg-primary/10 text-primary",
  JEFE_UNIDAD: "bg-purple-50 text-purple-700",
  MEDICO: "bg-blue-50 text-blue-700",
  SUPERVISOR: "bg-amber-50 text-amber-700",
  POSTULANTE: "bg-slate-100 text-slate-700",
  DIRECTOR: "bg-indigo-50 text-indigo-700",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombres: "",
    paterno: "",
    materno: "",
    ci: "",
    rol: "MEDICO",
    email: "",
  });

  const fetchUsuarios = async () => {
    try {
      const data = await adminService.getUsuarios();
      setUsuarios(data.filter((u) => u.rol !== "LICENCIADO"));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminService.createUsuario(formData);
      toast.success("Usuario creado correctamente");
      setIsDialogOpen(false);
      setFormData({
        username: "",
        password: "",
        nombres: "",
        paterno: "",
        materno: "",
        ci: "",
        rol: "MEDICO",
        email: "",
      });
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear usuario");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return;
    try {
      await adminService.deleteUsuario(id);
      toast.success("Usuario eliminado");
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar usuario");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestión de usuarios del sistema
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast.info("Funcionalidad próximamente")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Reporte Usuarios
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) =>
                      setFormData({ ...formData, nombres: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paterno">Apellido Paterno</Label>
                    <Input
                      id="paterno"
                      value={formData.paterno}
                      onChange={(e) =>
                        setFormData({ ...formData, paterno: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="materno">Apellido Materno</Label>
                    <Input
                      id="materno"
                      value={formData.materno}
                      onChange={(e) =>
                        setFormData({ ...formData, materno: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ci">CI</Label>
                    <Input
                      id="ci"
                      value={formData.ci}
                      onChange={(e) =>
                        setFormData({ ...formData, ci: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select
                      value={formData.rol}
                      onValueChange={(v) =>
                        setFormData({ ...formData, rol: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMINISTRADOR">
                          Administrador
                        </SelectItem>
                        <SelectItem value="JEFE_UNIDAD">
                          Jefe de Unidad
                        </SelectItem>
                        <SelectItem value="DIRECTOR">Director</SelectItem>
                        <SelectItem value="MEDICO">Médico</SelectItem>
                        <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario (Login)</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Crear Usuario
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Cargando usuarios...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  CI
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {usuario.nombre_completo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {usuario.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground hidden sm:table-cell">
                    {usuario.ci}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rolColors[usuario.rol] || "bg-gray-100"
                      }`}
                    >
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(usuario.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
