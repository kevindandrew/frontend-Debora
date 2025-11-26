"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { adminService } from "@/services/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  UserX,
  ClipboardCheck,
  Award,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

const StatsCard = ({ title, value, icon: Icon, variant = "default" }) => {
  const variants = {
    default: "text-primary",
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
    purple: "text-purple-600",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variants[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variants[variant]}`}>{value}</div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gestion, setGestion] = useState(new Date().getFullYear());

  useEffect(() => {
    if (
      user &&
      !["ADMINISTRADOR", "JEFE_UNIDAD", "DIRECTOR"].includes(user.rol)
    ) {
      router.push("/mis-tramites");
      return;
    }

    if (user) {
      fetchStats();
    }
  }, [user, router, gestion]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats(gestion);
      setStats(data);
    } catch (error) {
      console.error("Error cargando estadísticas", error);
      toast.error("Error al cargar estadísticas del dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard & Reportes
          </h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.nombre || user?.username} ({user?.rol})
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

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Postulantes"
          value={totalPostulantes}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Inscritos"
          value={inscritos}
          icon={ClipboardCheck}
          variant="info"
        />
        <StatsCard
          title="En Evaluación"
          value={enEvaluacion}
          icon={Activity}
          variant="warning"
        />
        <StatsCard
          title="Aptos"
          value={aptos}
          icon={UserCheck}
          variant="success"
        />
        <StatsCard
          title="No Aptos"
          value={noAptos}
          icon={UserX}
          variant="danger"
        />
        <StatsCard
          title="Licenciados"
          value={licenciados}
          icon={Award}
          variant="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>
              Porcentaje de postulantes por estado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.value}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {totalPostulantes > 0
                        ? ((item.value / totalPostulantes) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{
                      width: `${
                        totalPostulantes > 0
                          ? (item.value / totalPostulantes) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Distribución por Modalidad */}
        {stats?.por_modalidad && stats.por_modalidad.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Modalidad</CardTitle>
              <CardDescription>
                Postulantes por tipo de servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.por_modalidad.map((modalidad, index) => {
                  const colors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-orange-500",
                  ];
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              colors[index % colors.length]
                            }`}
                          />
                          <span className="text-muted-foreground">
                            {modalidad.modalidad}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{modalidad.total}</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {totalPostulantes > 0
                              ? (
                                  (modalidad.total / totalPostulantes) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`${
                            colors[index % colors.length]
                          } h-2 rounded-full transition-all`}
                          style={{
                            width: `${
                              totalPostulantes > 0
                                ? (modalidad.total / totalPostulantes) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actividad Reciente */}
        {stats?.actividad_reciente && stats.actividad_reciente.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.actividad_reciente.map((actividad, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {actividad.postulante}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {actividad.accion}
                        </p>
                      </div>
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
    </div>
  );
}
