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
  Pencil,
  AlertTriangle,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
    estado: true,
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

  // Auto-generate username based on name and surname
  useEffect(() => {
    const nombres = formData.nombres.trim();
    const paterno = formData.paterno.trim();

    if (nombres.length >= 3 && paterno.length >= 3) {
      const p1 = nombres.substring(0, 3).toUpperCase();
      const p2 = paterno.substring(0, 3).toUpperCase();
      const base = `${p1}${p2}`;

      let newUsername = base;
      let counter = 2;

      const existingUsernames = new Set(
        usuarios.filter((u) => u.id !== editingId).map((u) => u.username)
      );

      while (existingUsernames.has(newUsername)) {
        newUsername = `${base}${counter.toString().padStart(2, "0")}`;
        counter++;
      }

      if (formData.username !== newUsername) {
        setFormData((prev) => ({ ...prev, username: newUsername }));
      }
    }
  }, [formData.nombres, formData.paterno, usuarios, editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editingId) {
        await adminService.updateUsuario(editingId, formData);
        toast.success("Usuario actualizado correctamente");
      } else {
        await adminService.createUsuario(formData);
        toast.success("Usuario creado correctamente");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      toast.error(
        editingId ? "Error al actualizar usuario" : "Error al crear usuario"
      );
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      nombres: "",
      paterno: "",
      materno: "",
      ci: "",
      rol: "MEDICO",
      email: "",
      estado: true,
    });
    setEditingId(null);
  };

  const handleEdit = (usuario) => {
    // Since getUsuario fails (405), we have to rely on the data we have.
    // If CI is missing, we might have issues saving.
    // But the user requested to fix the 405 error first.
    setFormData({
      username: usuario.username,
      password: "",
      nombres: usuario.nombres || "",
      paterno: usuario.paterno || "",
      materno: usuario.materno || "",
      ci: usuario.ci || "", // Might be empty if not in list
      rol: usuario.rol,
      email: usuario.email || "",
      estado: usuario.estado !== undefined ? usuario.estado : true,
    });
    setEditingId(usuario.id);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      // We cannot fetch full user details because getUsuario returns 405.
      // We will try to update with the data we have.
      // We need to send the structure expected by the backend.
      const payload = {
        username: userToDelete.username,
        // Password is required by the backend. Since we are deactivating the user,
        // we can set a dummy password. This also prevents login if they are somehow reactivated without password reset.
        password: "InactivoUser123!",
        rol: userToDelete.rol,
        estado: false,
        nombres: userToDelete.nombres || "",
        paterno: userToDelete.paterno || "",
        materno: userToDelete.materno || "",
        // Use a unique dummy CI to avoid unique constraint violations.
        // Date.now() provides a unique 13-digit number.
        ci: userToDelete.ci || Date.now().toString(),
      };

      await adminService.updateUsuario(userToDelete.id, payload);
      toast.success("Usuario eliminado correctamente");
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar usuario");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteClick = (usuario) => {
    setUserToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const handleDownloadUsuarios = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Reporte de Usuarios del Sistema", 14, 22);
      doc.setFontSize(11);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 30);

      const columns = [
        { header: "Usuario", dataKey: "username" },
        { header: "Nombre Completo", dataKey: "nombre" },
        { header: "Rol", dataKey: "rol" },
        { header: "Estado", dataKey: "estado" },
        { header: "Fecha Creación", dataKey: "fecha" },
      ];

      const rows = usuarios
        .filter((u) => u.estado) // Only active users in report
        .map((u) => ({
          username: u.username,
          nombre: `${u.nombres} ${u.paterno} ${u.materno || ""}`.trim(),
          rol: u.rol,
          estado: u.estado ? "Activo" : "Inactivo",
          fecha: new Date(u.fecha_creacion).toLocaleDateString(),
        }));

      autoTable(doc, {
        head: [columns.map((c) => c.header)],
        body: rows.map((r) => columns.map((c) => r[c.dataKey])),
        startY: 40,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 66, 66] },
      });

      doc.save("reporte_usuarios.pdf");
      toast.success("Reporte descargado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al generar reporte");
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
          <Button variant="outline" onClick={handleDownloadUsuarios}>
            <FileText className="h-4 w-4 mr-2" />
            Reporte Usuarios
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                      maxLength={15}
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
                  <Label htmlFor="username">
                    Usuario (Generado Automáticamente)
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    readOnly
                    className="bg-muted"
                    placeholder="Se generará automáticamente"
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
                  {editingId ? "Actualizar Usuario" : "Crear Usuario"}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Fecha Creación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuarios
                .filter((u) => u.estado) // Only show active users
                .map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <UserCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground">
                          {usuario.username}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-foreground">
                        {`${usuario.nombres} ${usuario.paterno} ${
                          usuario.materno || ""
                        }`.trim()}
                      </p>
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
                    <td className="px-4 py-4 text-muted-foreground hidden md:table-cell text-sm">
                      {new Date(usuario.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.estado
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {usuario.estado ? "Activo" : "Inactivo"}
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
                          <DropdownMenuItem onClick={() => handleEdit(usuario)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(usuario)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Está seguro de eliminar este usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará al usuario{" "}
              <strong>{userToDelete?.username}</strong> como inactivo. El
              usuario no podrá acceder al sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
