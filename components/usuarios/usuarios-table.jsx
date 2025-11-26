"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ROL_COLORS = {
  ADMINISTRADOR: "bg-purple-100 text-purple-800 border-purple-200",
  DIRECTOR: "bg-blue-100 text-blue-800 border-blue-200",
  JEFE_UNIDAD: "bg-green-100 text-green-800 border-green-200",
  MEDICO: "bg-teal-100 text-teal-800 border-teal-200",
  SUPERVISOR: "bg-orange-100 text-orange-800 border-orange-200",
  LICENCIADO: "bg-gray-100 text-gray-800 border-gray-200",
};

export function UsuariosTable({ usuarios }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = usuarios.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Lista de Usuarios
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuario o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Usuario
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
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((usuario) => (
              <tr
                key={usuario.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {usuario.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">
                      {usuario.username}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge
                    variant="outline"
                    className={ROL_COLORS[usuario.rol] || ""}
                  >
                    {usuario.rol.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-muted-foreground hidden md:table-cell text-sm">
                  {usuario.fecha_creacion
                    ? format(new Date(usuario.fecha_creacion), "dd MMM yyyy", {
                        locale: es,
                      })
                    : "N/A"}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={usuario.estado ? "success" : "destructive"}>
                    {usuario.estado ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No se encontraron usuarios
        </div>
      )}
    </div>
  );
}
