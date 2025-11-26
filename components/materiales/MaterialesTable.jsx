"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { materialesService } from "@/services/materiales";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function MaterialesTable({ solicitudes, onUpdate, isAdmin }) {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState(null);

  const handleEstadoChange = async (id, nuevoEstado) => {
    setProcessingId(id);
    try {
      await materialesService.actualizarEstado(id, nuevoEstado);
      toast({
        title: "Estado actualizado",
        description: `La solicitud ha sido ${
          nuevoEstado === "APROBADO" ? "aprobada" : "rechazada"
        }.`,
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getBadgeVariant = (estado) => {
    switch (estado) {
      case "APROBADO":
        return "success"; // Assuming you have a success variant or use default/secondary
      case "RECHAZADO":
        return "destructive";
      case "PENDIENTE":
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Solicitudes</CardTitle>
        <CardDescription>
          Listado de solicitudes de material realizadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              {isAdmin && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 6 : 5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No hay solicitudes registradas.
                </TableCell>
              </TableRow>
            ) : (
              solicitudes.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell className="font-medium">{solicitud.id}</TableCell>
                  <TableCell>{solicitud.descripcion_pedido}</TableCell>
                  <TableCell>
                    {/* Si el backend devuelve el objeto unidad o solo el ID, ajustar aquí. 
                        Asumo que devuelve unidad_id o similar, idealmente el nombre si está populado.
                        Por ahora mostramos ID si no hay nombre. */}
                    {solicitud.unidad_id}
                  </TableCell>
                  <TableCell>
                    {solicitud.fecha_solicitud
                      ? format(new Date(solicitud.fecha_solicitud), "PPP", {
                          locale: es,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(solicitud.estado)}>
                      {solicitud.estado}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      {solicitud.estado === "PENDIENTE" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                            onClick={() =>
                              handleEstadoChange(solicitud.id, "APROBADO")
                            }
                            disabled={processingId === solicitud.id}
                          >
                            {processingId === solicitud.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() =>
                              handleEstadoChange(solicitud.id, "RECHAZADO")
                            }
                            disabled={processingId === solicitud.id}
                          >
                            {processingId === solicitud.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
