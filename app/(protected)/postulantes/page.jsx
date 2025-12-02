"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { postulantesService } from "@/services/postulantes";
import { adminService } from "@/services/admin";
import { PostulantesTable } from "@/components/postulantes-table";
import { RegistroPostulanteMultiStep } from "@/components/postulantes/registro-postulante-form";
import { DocumentUploadModal } from "@/components/postulacion/DocumentUploadModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Filter } from "lucide-react";
import { toast } from "sonner";
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

export default function PostulantesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRegistroDialogOpen, setIsRegistroDialogOpen] = useState(false);
  const [registering, setRegistering] = useState(false);

  // State for licensing dialog
  const [postulanteToLicense, setPostulanteToLicense] = useState(null);
  const [isLicenciarDialogOpen, setIsLicenciarDialogOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    gestion: new Date().getFullYear(),
    estado: "",
  });

  const canRegister = ["ADMINISTRADOR", "JEFE_UNIDAD", "DIRECTOR"].includes(
    user?.rol
  );

  useEffect(() => {
    if (
      user &&
      !["ADMINISTRADOR", "JEFE_UNIDAD", "DIRECTOR"].includes(user.rol)
    ) {
      router.push("/mis-tramites");
      return;
    }
    fetchPostulantes();
  }, [filters, user, router]);

  const fetchPostulantes = async () => {
    try {
      const activeFilters = {};
      if (filters.gestion) activeFilters.gestion = filters.gestion;
      if (filters.estado) activeFilters.estado = filters.estado;

      // Filtrar por unidad para roles específicos
      // Filtrar por unidad para roles específicos
      if (["JEFE_UNIDAD", "SUPERVISOR", "MEDICO"].includes(user?.rol)) {
        if (!user?.unidad_id) {
          // Si el usuario tiene rol restringido pero no tiene unidad asignada,
          // no mostramos nada para evitar mostrar todos los postulantes.
          setPostulantes([]);
          setLoading(false);
          toast.error(
            "No tienes una unidad asignada. Contacta al administrador."
          );
          return;
        }
        activeFilters.unidad_id = user.unidad_id;
      }

      const data = await postulantesService.getPostulantes(activeFilters);
      setPostulantes(data);
    } catch (error) {
      console.error("❌ Error al cargar postulantes:", error);
      console.error("❌ Detalle del error:", error.response?.data);
      toast.error("Error al cargar postulantes");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (postulante) => {
    router.push(
      `/dashboard/postulantes/${postulante.codigo_inscripcion || postulante.id}`
    );
  };

  const handleUploadDocs = (postulante) => {
    setSelectedPostulante(postulante);
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setSelectedPostulante(null);
  };

  const handleCompleteRegistro = async (formData) => {
    setRegistering(true);
    try {
      const newPostulante = await adminService.createPostulante(formData);
      toast.success("Postulante registrado correctamente");
      setIsRegistroDialogOpen(false);
      await fetchPostulantes();

      // Opcional: redirigir a la página de detalles para subir documentos
      toast.info("Ahora puede subir los documentos del postulante");
      router.push(`/dashboard/postulantes/${newPostulante.codigo_inscripcion}`);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail || "Error al registrar postulante"
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleLicenciarClick = (postulante) => {
    if (!postulante.codigo_inscripcion) {
      toast.error(
        "Error: No se puede licenciar. Falta el código de inscripción."
      );
      return;
    }

    setPostulanteToLicense(postulante);
    setIsLicenciarDialogOpen(true);
  };

  const confirmLicenciar = async () => {
    if (!postulanteToLicense) return;

    try {
      // First, fetch the full postulante details to get the numeric ID
      const postulanteCompleto = await postulantesService.getPostulanteByCodigo(
        postulanteToLicense.codigo_inscripcion
      );

      if (!postulanteCompleto.id) {
        toast.error("Error: No se pudo obtener el ID del postulante");
        return;
      }

      // Now license using the numeric ID
      await postulantesService.licenciarSoldado(postulanteCompleto.id);
      toast.success(
        `Soldado ${postulanteToLicense.nombre_completo} licenciado correctamente`
      );
      fetchPostulantes();
    } catch (error) {
      console.error(error);
      toast.error("Error al licenciar soldado");
    } finally {
      setIsLicenciarDialogOpen(false);
      setPostulanteToLicense(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Lista de Postulantes
          </h1>
          <p className="text-muted-foreground">
            Todos los postulantes registrados en el sistema
          </p>
        </div>

        {canRegister && (
          <Button onClick={() => setIsRegistroDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Añadir Nuevo Postulante
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-muted/30 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Gestión</label>
            <Select
              value={filters.gestion?.toString()}
              onValueChange={(value) =>
                setFilters({ ...filters, gestion: parseInt(value) })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Estado</label>
            <Select
              value={filters.estado || "TODOS"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  estado: value === "TODOS" ? "" : value,
                })
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="INSCRITO">Inscrito</SelectItem>
                <SelectItem value="EN_EVALUACION">En Evaluación</SelectItem>
                <SelectItem value="APTO">Apto</SelectItem>
                <SelectItem value="NO_APTO">No Apto</SelectItem>
                <SelectItem value="LICENCIADO">Licenciado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <PostulantesTable
          postulantes={postulantes}
          onViewDetails={handleViewDetails}
          onUploadDocs={handleUploadDocs}
          onLicenciar={handleLicenciarClick}
        />
      )}

      {selectedPostulante && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={handleCloseModal}
          codigoInscripcion={
            selectedPostulante.codigo_inscripcion || selectedPostulante.id
          }
        />
      )}

      {/* Dialog de registro multi-step */}
      <Dialog
        open={isRegistroDialogOpen}
        onOpenChange={setIsRegistroDialogOpen}
      >
        <DialogContent
          className="!max-w-none w-[95vw] max-h-[90vh] overflow-y-auto"
          style={{ width: "85vw" }}
        >
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Postulante</DialogTitle>
          </DialogHeader>
          <RegistroPostulanteMultiStep
            onComplete={handleCompleteRegistro}
            onCancel={() => setIsRegistroDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para Licenciar */}
      <AlertDialog
        open={isLicenciarDialogOpen}
        onOpenChange={setIsLicenciarDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Está seguro de licenciar al soldado?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará al soldado {postulanteToLicense?.nombres} como
              LICENCIADO. Esto indica que ha completado su servicio militar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLicenciar}>
              Confirmar Licenciamiento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
