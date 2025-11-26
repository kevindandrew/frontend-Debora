"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import { materialesService } from "@/services/materiales";
import { MaterialesTable } from "@/components/materiales/MaterialesTable";
import { SolicitudMaterialForm } from "@/components/materiales/SolicitudMaterialForm";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MaterialesPage() {
  const [user, setUser] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await materialesService.getSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error("Error fetching solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isJefeUnidad = user.rol === "JEFE_UNIDAD";
  const isAdmin = user.rol === "ADMINISTRADOR" || user.rol === "DIRECTOR";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de Materiales
        </h1>
      </div>

      {isJefeUnidad && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-1">
            <SolicitudMaterialForm onSuccess={fetchSolicitudes} />
          </div>
          <div className="md:col-span-1">
            {/* Espacio reservado o estadísticas rápidas si se desea */}
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
                <CardDescription>
                  Aquí puedes ver el estado de tus solicitudes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Las solicitudes son revisadas por el Administrador o Director.
                  Una vez aprobadas, recibirás una notificación.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <MaterialesTable
        solicitudes={solicitudes}
        onUpdate={fetchSolicitudes}
        isAdmin={isAdmin}
      />
    </div>
  );
}
