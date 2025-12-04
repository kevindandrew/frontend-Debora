"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, History, FileText } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuditLogsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // System Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Unit History State
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState("");
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    if (user && !["ADMINISTRADOR", "DIRECTOR"].includes(user.rol)) {
      router.push("/dashboard");
      return;
    }

    if (user) {
      fetchLogs();
      fetchUnidades();
    }
  }, [user, router]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await adminService.getSystemLogs();
      if (data && data.logs) {
        const parsedLogs = data.logs
          .map((log) => {
            const parts = log.split(" | ");
            if (parts.length >= 5) {
              return {
                timestamp: parts[0],
                method: parts[1],
                path: parts[2],
                status: parts[3],
                duration: parts[4],
                raw: log,
              };
            }
            return { raw: log };
          })
          .reverse();
        setLogs(parsedLogs);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Error al cargar los logs del sistema");
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchUnidades = async () => {
    try {
      const data = await adminService.getUnidades();
      setUnidades(data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const handleUnidadChange = async (unidadId) => {
    setSelectedUnidad(unidadId);
    setLoadingHistorial(true);
    try {
      const data = await adminService.getHistorialPersonal(unidadId);
      setHistorial(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Error al cargar el historial de la unidad");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const translateAction = (method, path) => {
    if (!path) return "Actividad desconocida";
    if (path.includes("/auth/login")) return "Inicio de Sesión";
    if (path.includes("/estadisticas/evolucion-usuarios"))
      return "Visualizó Gráfico de Evolución";
    if (path.includes("/auditoria/logs"))
      return "Consultó Registro de Auditoría";
    if (path.includes("/usuarios")) {
      if (method === "GET" && path.split("/").length > 4)
        return "Consultó detalle de usuario";
      if (method === "GET") return "Visualizó lista de usuarios";
      if (method === "POST") return "Registró un nuevo usuario";
      if (method === "PUT") return "Actualizó datos de usuario";
      if (method === "DELETE") return "Eliminó un usuario";
    }
    if (path.includes("/postulaciones")) {
      if (method === "GET") return "Visualizó lista de postulantes";
      if (method === "POST") return "Registró nuevo postulante";
    }
    if (path.includes("/unidades")) {
      if (method === "GET") return "Visualizó lista de unidades";
    }
    if (path.includes("/modalidades")) {
      if (method === "GET") return "Consultó modalidades";
    }
    return `${method} ${path}`;
  };

  const translateStatus = (status) => {
    const code = parseInt(status);
    if (code >= 200 && code < 300) return "Exitoso";
    if (code === 401 || code === 403) return "No Autorizado";
    if (code === 404) return "No Encontrado";
    if (code >= 400 && code < 500) return "Error de Cliente";
    if (code >= 500) return "Error del Sistema";
    return status;
  };

  const getStatusBadgeVariant = (status) => {
    const code = parseInt(status);
    if (code >= 200 && code < 300) return "default";
    if (code >= 400) return "destructive";
    return "secondary";
  };

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    if (log.raw && log.raw.toLowerCase().includes(searchLower)) return true;
    if (log.path) {
      const action = translateAction(log.method, log.path).toLowerCase();
      return action.includes(searchLower);
    }
    return false;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Auditoría y Control
        </h1>
        <p className="text-muted-foreground">
          Supervisión de actividades y personal
        </p>
      </div>

      <Tabs defaultValue="system-logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system-logs">
            <FileText className="h-4 w-4 mr-2" />
            Logs del Sistema
          </TabsTrigger>
          <TabsTrigger value="unit-history">
            <History className="h-4 w-4 mr-2" />
            Historial de Personal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system-logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar actividad..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={fetchLogs}
              disabled={loadingLogs}
              variant="outline"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loadingLogs ? "animate-spin" : ""}`}
              />
              Refrescar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                      <TableHead>Acción Realizada</TableHead>
                      <TableHead className="w-[150px]">Resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingLogs && logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (
                        <TableRow key={index}>
                          {log.timestamp ? (
                            <>
                              <TableCell className="font-medium text-xs">
                                {log.timestamp}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-foreground/80">
                                  {translateAction(log.method, log.path)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={getStatusBadgeVariant(log.status)}
                                >
                                  {translateStatus(log.status)}
                                </Badge>
                              </TableCell>
                            </>
                          ) : (
                            <TableCell
                              colSpan={3}
                              className="text-muted-foreground"
                            >
                              {log.raw}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No se encontraron actividades recientes.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Personal por Unidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="w-full sm:w-[300px]">
                <Select
                  value={selectedUnidad}
                  onValueChange={handleUnidadChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Unidad Militar" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUnidad && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gestión</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Nombre Completo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingHistorial ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : historial.length > 0 ? (
                        historial.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.gestion}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.rol}</Badge>
                            </TableCell>
                            <TableCell>{item.nombre_completo}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No hay historial registrado para esta unidad.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!selectedUnidad && (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                  Seleccione una unidad para ver su historial de personal.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
