"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Users, FileText, Package, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [gestion, setGestion] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStats();
  }, [gestion]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats(gestion);
      setStats(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPostulantes = stats?.total || 0;
  const inscritos = stats?.inscritos || 0;
  const enEvaluacion = stats?.en_evaluacion || 0;
  const aptos = stats?.aptos || 0;
  const noAptos = stats?.no_aptos || 0;
  const licenciados = stats?.licenciados || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Analíticas</h1>
          <p className="text-muted-foreground">
            Estadísticas del sistema de reclutamiento
          </p>
        </div>
        <Select
          value={gestion.toString()}
          onValueChange={(v) => setGestion(parseInt(v))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Gestión" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">Gestión 2024</SelectItem>
            <SelectItem value="2025">Gestión 2025</SelectItem>
            <SelectItem value="2026">Gestión 2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Postulantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPostulantes}</div>
            <p className="text-xs text-muted-foreground">Gestión {gestion}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aptos para Servicio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{aptos}</div>
            <p className="text-xs text-muted-foreground">
              {totalPostulantes > 0
                ? ((aptos / totalPostulantes) * 100).toFixed(1)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenciados</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {licenciados}
            </div>
            <p className="text-xs text-muted-foreground">Servicio completado</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Estado de Postulaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Postulaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inscritos</span>
                <span className="font-medium">{inscritos}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      totalPostulantes > 0
                        ? (inscritos / totalPostulantes) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">En Evaluación</span>
                <span className="font-medium">{enEvaluacion}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${
                      totalPostulantes > 0
                        ? (enEvaluacion / totalPostulantes) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Aptos</span>
                <span className="font-medium">{aptos}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      totalPostulantes > 0
                        ? (aptos / totalPostulantes) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">No Aptos</span>
                <span className="font-medium">{noAptos}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      totalPostulantes > 0
                        ? (noAptos / totalPostulantes) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Licenciados</span>
                <span className="font-medium">{licenciados}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${
                      totalPostulantes > 0
                        ? (licenciados / totalPostulantes) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribución */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Inscritos", value: inscritos, color: "bg-blue-500" },
                {
                  label: "En Evaluación",
                  value: enEvaluacion,
                  color: "bg-yellow-500",
                },
                { label: "Aptos", value: aptos, color: "bg-green-500" },
                { label: "No Aptos", value: noAptos, color: "bg-red-500" },
                {
                  label: "Licenciados",
                  value: licenciados,
                  color: "bg-purple-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.value}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {totalPostulantes > 0
                        ? ((item.value / totalPostulantes) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      {stats?.actividad_reciente && stats.actividad_reciente.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.actividad_reciente.map((actividad, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {actividad.postulante}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {actividad.accion}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {actividad.fecha}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
