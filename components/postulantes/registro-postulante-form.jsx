"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, User, FileText } from "lucide-react";
import { publicService } from "@/services/public";
import { toast } from "sonner";

export function RegistroPostulanteMultiStep({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [modalidades, setModalidades] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [formData, setFormData] = useState({
    nombres: "",
    paterno: "",
    materno: "",
    ci: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    direccion: "",
    modalidad_id: "",
    gestion: new Date().getFullYear(),
    unidad_id: "",
    tutor_nombre: "",
    tutor_ci: "",
    tutor_relacion: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mods, units] = await Promise.all([
        publicService.getModalidades(),
        publicService.getUnidades(),
      ]);
      setModalidades(mods);
      setUnidades(units);
    } catch (error) {
      console.error("Error cargando datos", error);
      toast.error("Error cargando modalidades y unidades");
    }
  };

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 0;
    const parts = birthDateString.split("-");
    if (parts.length !== 3) return 0;

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
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

  const age = calculateAge(formData.fecha_nacimiento);
  const isMinor = age < 18 && age > 0;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) newErrors.nombres = "Nombres requeridos";
    if (!formData.paterno.trim())
      newErrors.paterno = "Apellido paterno requerido";
    if (!formData.ci.trim()) newErrors.ci = "CI requerido";
    if (!formData.fecha_nacimiento)
      newErrors.fecha_nacimiento = "Fecha de nacimiento requerida";
    if (!formData.genero) newErrors.genero = "Género requerido";
    if (!formData.modalidad_id) newErrors.modalidad_id = "Modalidad requerida";
    if (!formData.unidad_id) newErrors.unidad_id = "Unidad requerida";

    if (isMinor) {
      if (!formData.tutor_nombre.trim())
        newErrors.tutor_nombre = "Nombre del tutor requerido";
      if (!formData.tutor_ci.trim())
        newErrors.tutor_ci = "CI del tutor requerido";
      if (!formData.tutor_relacion)
        newErrors.tutor_relacion = "Relación requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    const finalData = {
      nombres: formData.nombres,
      paterno: formData.paterno,
      materno: formData.materno || null,
      ci: formData.ci,
      fecha_nacimiento: formData.fecha_nacimiento,
      genero: formData.genero,
      telefono: formData.telefono || null,
      direccion: formData.direccion || null,
      modalidad_id: parseInt(formData.modalidad_id),
      unidad_id: parseInt(formData.unidad_id),
      gestion: parseInt(formData.gestion),
    };

    if (isMinor && formData.tutor_nombre) {
      finalData.tutor = {
        nombre_completo: formData.tutor_nombre,
        ci: formData.tutor_ci,
        relacion: formData.tutor_relacion,
      };
    }

    onComplete(finalData);
  };

  const selectedMod = modalidades.find(
    (m) => m.id.toString() === formData.modalidad_id
  );
  const selectedUnit = unidades.find(
    (u) => u.id.toString() === formData.unidad_id
  );
  const isAgeValid =
    !selectedMod ||
    !formData.fecha_nacimiento ||
    (age >= selectedMod.edad_minima && age <= selectedMod.edad_maxima);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Badge variant={step === 1 ? "default" : "secondary"} className="gap-2">
          <User className="h-3 w-3" />
          Paso 1: Datos Personales
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Badge variant={step === 2 ? "default" : "secondary"} className="gap-2">
          <FileText className="h-3 w-3" />
          Paso 2: Confirmación
        </Badge>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos Personales del Postulante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">
                  Nombres <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombres"
                  value={formData.nombres}
                  onChange={(e) => handleChange("nombres", e.target.value)}
                  placeholder="Ej: Juan Carlos"
                  className={errors.nombres ? "border-red-500" : ""}
                />
                {errors.nombres && (
                  <p className="text-sm text-red-500">{errors.nombres}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paterno">
                  Apellido Paterno <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="paterno"
                  value={formData.paterno}
                  onChange={(e) => handleChange("paterno", e.target.value)}
                  placeholder="Ej: Pérez"
                  className={errors.paterno ? "border-red-500" : ""}
                />
                {errors.paterno && (
                  <p className="text-sm text-red-500">{errors.paterno}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="materno">Apellido Materno</Label>
                <Input
                  id="materno"
                  value={formData.materno}
                  onChange={(e) => handleChange("materno", e.target.value)}
                  placeholder="Ej: García"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ci">
                  CI <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ci"
                  value={formData.ci}
                  onChange={(e) => handleChange("ci", e.target.value)}
                  placeholder="Ej: 12345678"
                  className={errors.ci ? "border-red-500" : ""}
                />
                {errors.ci && (
                  <p className="text-sm text-red-500">{errors.ci}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) =>
                    handleChange("fecha_nacimiento", e.target.value)
                  }
                  className={errors.fecha_nacimiento ? "border-red-500" : ""}
                />
                {formData.fecha_nacimiento && (
                  <p className="text-xs text-slate-500">
                    Edad: <span className="font-semibold">{age} años</span>
                  </p>
                )}
                {errors.fecha_nacimiento && (
                  <p className="text-sm text-red-500">
                    {errors.fecha_nacimiento}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="genero">
                  Género <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.genero}
                  onValueChange={(v) => handleChange("genero", v)}
                >
                  <SelectTrigger
                    className={errors.genero ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                {errors.genero && (
                  <p className="text-sm text-red-500">{errors.genero}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  placeholder="Ej: 70123456"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  placeholder="Ej: Av. Principal #123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modalidad">
                  Modalidad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.modalidad_id}
                  onValueChange={(v) => handleChange("modalidad_id", v)}
                >
                  <SelectTrigger
                    className={errors.modalidad_id ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidades.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.modalidad_id && (
                  <p className="text-sm text-red-500">{errors.modalidad_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidad_id">
                  Unidad de Reclutamiento{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.unidad_id}
                  onValueChange={(v) => handleChange("unidad_id", v)}
                >
                  <SelectTrigger
                    className={errors.unidad_id ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.nombre} - {u.departamento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unidad_id && (
                  <p className="text-sm text-red-500">{errors.unidad_id}</p>
                )}
              </div>
            </div>

            {isMinor && (
              <div className="border p-4 rounded-md bg-slate-50 mt-4">
                <h3 className="font-semibold mb-3 text-slate-700">
                  Datos del Tutor (Requerido para menores de 18 años)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Nombre Completo Tutor{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.tutor_nombre}
                      onChange={(e) =>
                        handleChange("tutor_nombre", e.target.value)
                      }
                      className={errors.tutor_nombre ? "border-red-500" : ""}
                    />
                    {errors.tutor_nombre && (
                      <p className="text-sm text-red-500">
                        {errors.tutor_nombre}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      CI Tutor <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.tutor_ci}
                      onChange={(e) => handleChange("tutor_ci", e.target.value)}
                      className={errors.tutor_ci ? "border-red-500" : ""}
                    />
                    {errors.tutor_ci && (
                      <p className="text-sm text-red-500">{errors.tutor_ci}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Relación <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.tutor_relacion}
                      onValueChange={(v) => handleChange("tutor_relacion", v)}
                    >
                      <SelectTrigger
                        className={
                          errors.tutor_relacion ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Padre/Madre/..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Padre">Padre</SelectItem>
                        <SelectItem value="Madre">Madre</SelectItem>
                        <SelectItem value="Apoderado">Apoderado</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tutor_relacion && (
                      <p className="text-sm text-red-500">
                        {errors.tutor_relacion}
                      </p>
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
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmación de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                ℹ️ El postulante será registrado con los siguientes datos. Los
                documentos se podrán subir después desde la página de detalles.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-slate-700">
                  Nombre completo:
                </span>
                <span className="col-span-2 text-slate-900">
                  {formData.nombres} {formData.paterno} {formData.materno}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-slate-700">CI:</span>
                <span className="col-span-2 text-slate-900">{formData.ci}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-slate-700">Edad:</span>
                <span className="col-span-2 text-slate-900">{age} años</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-slate-700">Modalidad:</span>
                <span className="col-span-2 text-slate-900">
                  {selectedMod?.nombre || "No seleccionada"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="font-medium text-slate-700">Unidad:</span>
                <span className="col-span-2 text-slate-900">
                  {selectedUnit
                    ? `${selectedUnit.nombre} - ${selectedUnit.departamento}`
                    : "No seleccionada"}
                </span>
              </div>

              {isMinor && formData.tutor_nombre && (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-slate-700">Tutor:</span>
                  <span className="col-span-2 text-slate-900">
                    {formData.tutor_nombre} ({formData.tutor_relacion})
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={step === 1 ? onCancel : handleBack}
        >
          {step === 1 ? (
            "Cancelar"
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={step === 1 ? handleNext : handleSubmit}
          disabled={!isAgeValid}
        >
          {step === 1 ? (
            <>
              Siguiente <ChevronRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            "Completar Registro"
          )}
        </Button>
      </div>
    </div>
  );
}
