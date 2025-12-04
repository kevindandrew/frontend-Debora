"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { Button } from "@/components/ui/button";
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
  UserPlus,
  MoreHorizontal,
  UserCircle,
  Trash2,
  Loader2,
  Award,
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
  LICENCIADO: "bg-gray-100 text-gray-700",
};

export default function LicenciadosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsuarios = async () => {
    try {
      const data = await adminService.getUsuarios();
      setUsuarios(data.filter((u) => u.rol === "LICENCIADO"));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar licenciados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleDeleteClick = (usuario) => {
    setUserToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await adminService.deleteUsuario(userToDelete.id);
      toast.success("Licenciado eliminado");
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar licenciado");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Licenciados</h1>
          <p className="text-muted-foreground">
            Gestión de personal licenciado
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Cargando licenciados...</div>
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
                        <Award className="h-6 w-6 text-muted-foreground" />
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
      {usuarios.length === 0 && !loading && (
        <div className="p-8 text-center text-muted-foreground">
          No se encontraron licenciados
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              al licenciado{" "}
              <span className="font-bold text-foreground">
                {userToDelete?.nombre_completo}
              </span>{" "}
              y eliminará sus datos de nuestros servidores.
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
