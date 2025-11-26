"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { publicService } from "@/services/public";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

function RegistroContent() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const [modalidades, setModalidades] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedModalidad = searchParams.get("modalidad");

  const fechaNacimiento = watch("fecha_nacimiento");
  const modalidadId = watch("modalidad_id");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mods, units] = await Promise.all([
          publicService.getModalidades(),
          publicService.getUnidades(),
        ]);
        setModalidades(mods);
        setUnidades(units);

        if (preselectedModalidad) {
          setValue("modalidad_id", preselectedModalidad);
        }
      } catch (error) {
        console.error("Error cargando datos", error);
        toast.error("Error cargando datos del formulario");
      }
    };
    loadData();
  }, [preselectedModalidad, setValue]);

  // Calcular edad para validación visual (la real la hace el backend)
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 0;
    // Parsear manualmente para evitar problemas de zona horaria con new Date(string)
    const parts = birthDateString.split("-");
    if (parts.length !== 3) return 0;

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Meses en JS son 0-11
    const day = parseInt(parts[2]);

    const today = new Date();
    const birth = new Date(year, month, day);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validar edad con la modalidad seleccionada antes de enviar
      const selectedMod = modalidades.find(
        (m) => m.id.toString() === data.modalidad_id
      );
      if (selectedMod) {
        const edad = calculateAge(data.fecha_nacimiento);
        if (edad < selectedMod.edad_minima || edad > selectedMod.edad_maxima) {
          toast.error(
            `Para ${selectedMod.nombre}, debes tener entre ${selectedMod.edad_minima} y ${selectedMod.edad_maxima} años. (Tienes ${edad})`
          );
          setLoading(false);
          return;
        }
      }

      // Formatear datos para la API
      const payload = {
        ...data,
        modalidad_id: parseInt(data.modalidad_id),
        unidad_id: parseInt(data.unidad_id),
        materno: data.materno ? data.materno : null,
        direccion: data.direccion ? data.direccion : null,
        // Si es menor de edad, el backend pedirá tutor.
        tutor: data.tutor_nombre
          ? {
              nombre_completo: data.tutor_nombre,
              ci: data.tutor_ci,
              relacion: data.tutor_relacion,
            }
          : null,
      };

      // Limpiar campos de tutor si no se usan
      if (!payload.tutor) delete payload.tutor;
      delete payload.tutor_nombre;
      delete payload.tutor_ci;
      delete payload.tutor_relacion;

      const response = await publicService.registrarPostulante(payload);

      toast.success(
        "Registro exitoso. Guarda tu código: " + response.codigo_inscripcion
      );
      // Redirigir a una página de éxito o mostrar modal con el código
      router.push(`/?registro_exitoso=${response.codigo_inscripcion}`);
    } catch (error) {
      console.error("Error en registro:", error);

      if (error.response?.data) {
        const data = error.response.data;
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            toast.error(
              `Error: ${data.detail[0].msg} en ${data.detail[0].loc.join(".")}`
            );
          } else {
            toast.error(`Error: ${data.detail}`);
          }
        } else {
          // Fallback para otros errores
          toast.error(`Error del servidor: ${JSON.stringify(data)}`);
        }
      } else {
        toast.error(
          "Error al registrar. Verifique los datos e intente nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const age = calculateAge(fechaNacimiento);
  const isMinor = age < 18;

  // Validación en tiempo real para mostrar mensaje
  const selectedMod = modalidades.find((m) => m.id.toString() === modalidadId);
  const isAgeValid =
    !selectedMod ||
    !fechaNacimiento ||
    (age >= selectedMod.edad_minima && age <= selectedMod.edad_maxima);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Formulario de Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit, (errors) => {
              console.log("Errores de validación:", errors);
            })}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  {...register("nombres", { required: true })}
                  placeholder="Ej. Juan"
                />
                {errors.nombres && (
                  <span className="text-red-500 text-xs">Requerido</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="paterno">Apellido Paterno</Label>
                <Input
                  id="paterno"
                  {...register("paterno", { required: true })}
                  placeholder="Ej. Pérez"
                />
                {errors.paterno && (
                  <span className="text-red-500 text-xs">Requerido</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="materno">Apellido Materno</Label>
                <Input
                  id="materno"
                  {...register("materno")}
                  placeholder="Ej. Mamani"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ci">Cédula de Identidad</Label>
                <Input
                  id="ci"
                  {...register("ci", { required: true })}
                  placeholder="Ej. 1234567"
                />
                {errors.ci && (
                  <span className="text-red-500 text-xs">Requerido</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  id="fecha_nacimiento"
                  {...register("fecha_nacimiento", { required: true })}
                />
                {errors.fecha_nacimiento && (
                  <span className="text-red-500 text-xs">Requerido</span>
                )}
                {fechaNacimiento && (
                  <p className="text-xs text-slate-500 mt-1">
                    Edad calculada:{" "}
                    <span className="font-semibold">
                      {calculateAge(fechaNacimiento)} años
                    </span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select onValueChange={(val) => setValue("genero", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("genero", { required: true })}
                />
                {errors.genero && (
                  <span className="text-red-500 text-xs">Requerido</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección de Domicilio</Label>
                <Input
                  id="direccion"
                  {...register("direccion")}
                  placeholder="Av. Principal #123"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modalidad">Modalidad</Label>
                <Select
                  onValueChange={(val) => setValue("modalidad_id", val)}
                  defaultValue={preselectedModalidad || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidades.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("modalidad_id", { required: true })}
                />
                {errors.modalidad_id && (
                  <span className="text-red-500 text-xs">Requerido</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad de Reclutamiento</Label>
                <Select onValueChange={(val) => setValue("unidad_id", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.length > 0 ? (
                      unidades.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.nombre} - {u.departamento}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0" disabled>
                        No hay unidades disponibles (o requiere login)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("unidad_id", { required: true })}
                />
                {errors.unidad_id && (
                  <span className="text-red-500 text-xs">Requerido</span>
                )}
                {unidades.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Nota: Si no aparecen unidades, contacte al administrador.
                  </p>
                )}
              </div>
            </div>
            {/* Sección Tutor - Condicional si es menor de edad */}
            {isMinor && (
              <div className="border p-4 rounded-md bg-slate-50 mt-4">
                <h3 className="font-semibold mb-3 text-slate-700">
                  Datos del Tutor (Requerido para menores de 18)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo Tutor</Label>
                    <Input
                      {...register("tutor_nombre", { required: isMinor })}
                    />
                    {errors.tutor_nombre && (
                      <span className="text-red-500 text-xs">Requerido</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>CI Tutor</Label>
                    <Input {...register("tutor_ci", { required: isMinor })} />
                    {errors.tutor_ci && (
                      <span className="text-red-500 text-xs">Requerido</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Relación</Label>
                    <Select
                      onValueChange={(val) => setValue("tutor_relacion", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Padre/Madre/..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Padre">Padre</SelectItem>
                        <SelectItem value="Madre">Madre</SelectItem>
                        <SelectItem value="Apoderado">Apoderado</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      {...register("tutor_relacion", { required: isMinor })}
                    />
                    {errors.tutor_relacion && (
                      <span className="text-red-500 text-xs">Requerido</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isAgeValid && selectedMod && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                <p className="font-bold">
                  Edad no permitida para esta modalidad.
                </p>
                <p>
                  {selectedMod.nombre} requiere entre {selectedMod.edad_minima}{" "}
                  y {selectedMod.edad_maxima} años. Tienes {age} años.
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isAgeValid}
            >
              {loading ? "Registrando..." : "Enviar Postulación"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <RegistroContent />
    </Suspense>
  );
}
