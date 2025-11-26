"use client";

import { useState } from "react";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Search,
  MoreHorizontal,
  Upload,
  ClipboardCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PostulantesTable({
  postulantes,
  onViewDetails,
  onUploadDocs,
  onLicenciar,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = postulantes.filter((p) => {
    const nombre = p.nombre_completo || p.nombre || "";
    const ci = p.ci || "";
    const searchLower = searchTerm.toLowerCase();

    return (
      nombre.toLowerCase().includes(searchLower) || ci.includes(searchTerm)
    );
  });

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Lista de Postulantes
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o CI..."
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
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                CI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Modalidad
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
            {filtered.map((postulante) => {
              const nombre =
                postulante.nombre_completo || postulante.nombre || "Sin nombre";
              const ci = postulante.ci || "N/A";

              return (
                <tr
                  key={`${postulante.id}-${
                    postulante.codigo_inscripcion || index
                  }`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {nombre.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{ci}</td>
                  <td className="px-4 py-4 text-muted-foreground hidden md:table-cell">
                    {postulante.modalidad}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={postulante.estado} />
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
                          onClick={() => onViewDetails?.(postulante)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUploadDocs?.(postulante)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Documentos
                        </DropdownMenuItem>
                        {postulante.estado === "APTO" && (
                          <DropdownMenuItem
                            className="text-green-600 focus:text-green-700 focus:bg-green-50"
                            onClick={() => onLicenciar?.(postulante)}
                          >
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Licenciar Soldado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No se encontraron postulantes
        </div>
      )}
    </div>
  );
}
