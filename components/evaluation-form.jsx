"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EvaluationForm({
  postulante,
  evaluationType,
  onClose,
  onSave,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Datos Médicos
    peso: "",
    estatura: "",
    color_piel: "",
    color_ojos: "",
    tipo_nariz: "",
    tipo_boca: "",
    grupo_sanguineo: "",
    prueba_embarazo: "NO_APLICA",
    observaciones: "",

    // Datos Físicos (para futuro uso)
    flexiones: "",
    abdominales: "",
    carrera: "",

    // Resultado General
    estado: "APTO",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      toast.success("Evaluación registrada correctamente");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la evaluación");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Evaluación {evaluationType === "MEDICA" ? "Médica" : "Física"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Postulante: {postulante.nombre_completo || postulante.nombre}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {evaluationType === "MEDICA" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos Biométricos Básicos */}
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 70.5"
                  value={formData.peso}
                  onChange={(e) => handleChange("peso", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estatura">Estatura (cm)</Label>
                <Input
                  id="estatura"
                  type="number"
                  placeholder="Ej: 175"
                  value={formData.estatura}
                  onChange={(e) => handleChange("estatura", e.target.value)}
                  required
                />
              </div>

              {/* Características Físicas */}
              <div className="space-y-2">
                <Label htmlFor="color_piel">Color de Piel</Label>
                <Select
                  value={formData.color_piel}
                  onValueChange={(v) => handleChange("color_piel", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLARA">Clara</SelectItem>
                    <SelectItem value="TRIGUEÑA">Trigueña</SelectItem>
                    <SelectItem value="MORENA">Morena</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color_ojos">Color de Ojos</Label>
                <Select
                  value={formData.color_ojos}
                  onValueChange={(v) => handleChange("color_ojos", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAFE">Café</SelectItem>
                    <SelectItem value="NEGRO">Negro</SelectItem>
                    <SelectItem value="VERDE">Verde</SelectItem>
                    <SelectItem value="AZUL">Azul</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rasgos Faciales */}
              <div className="space-y-2">
                <Label htmlFor="tipo_nariz">Tipo de Nariz</Label>
                <Select
                  value={formData.tipo_nariz}
                  onValueChange={(v) => handleChange("tipo_nariz", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECTA">Recta</SelectItem>
                    <SelectItem value="AGUILEÑA">Aguileña</SelectItem>
                    <SelectItem value="CHATA">Chata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_boca">Tipo de Boca</Label>
                <Select
                  value={formData.tipo_boca}
                  onValueChange={(v) => handleChange("tipo_boca", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEQUEÑA">Pequeña</SelectItem>
                    <SelectItem value="MEDIANA">Mediana</SelectItem>
                    <SelectItem value="GRANDE">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Datos Clínicos */}
              <div className="space-y-2">
                <Label htmlFor="grupo_sanguineo">Grupo Sanguíneo</Label>
                <Select
                  value={formData.grupo_sanguineo}
                  onValueChange={(v) => handleChange("grupo_sanguineo", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prueba Embarazo (Solo Mujeres) */}
              <div className="space-y-2">
                <Label htmlFor="prueba_embarazo">Prueba de Embarazo</Label>
                <Select
                  value={formData.prueba_embarazo}
                  onValueChange={(v) => handleChange("prueba_embarazo", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO_APLICA">No Aplica (Varón)</SelectItem>
                    <SelectItem value="NEGATIVO">Negativo</SelectItem>
                    <SelectItem value="POSITIVO">Positivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Observaciones */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="observaciones">Observaciones Médicas</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Detalles adicionales sobre tatuajes, cicatrices, o condiciones médicas..."
                  value={formData.observaciones}
                  onChange={(e) =>
                    handleChange("observaciones", e.target.value)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pruebas Físicas */}
              <div className="space-y-2">
                <Label htmlFor="flexiones">Flexiones de Brazo</Label>
                <Input
                  id="flexiones"
                  type="number"
                  placeholder="Cantidad realizada"
                  value={formData.flexiones}
                  onChange={(e) => handleChange("flexiones", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="abdominales">Abdominales</Label>
                <Input
                  id="abdominales"
                  type="number"
                  placeholder="Cantidad realizada"
                  value={formData.abdominales}
                  onChange={(e) => handleChange("abdominales", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrera">Carrera 3200m / Aeróbica</Label>
                <Select
                  value={formData.carrera}
                  onValueChange={(v) => handleChange("carrera", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APROBADO">Aprobado</SelectItem>
                    <SelectItem value="REPROBADO">Reprobado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Habilidades Adicionales */}
              <div className="space-y-2">
                <Label htmlFor="saber_nadar">¿Sabe Nadar?</Label>
                <Select
                  value={formData.saber_nadar || "NO"}
                  onValueChange={(v) => handleChange("saber_nadar", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SI">Sí</SelectItem>
                    <SelectItem value="NO">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Evaluación Psicológica / Educacional */}
              <div className="col-span-1 md:col-span-2 border-t border-border pt-4 mt-2">
                <h3 className="font-semibold mb-4">
                  Evaluación Educacional / Psicológica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leer">¿Sabe Leer?</Label>
                    <Select
                      value={formData.leer || "SI"}
                      onValueChange={(v) => handleChange("leer", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">Sí</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escribir">¿Sabe Escribir?</Label>
                    <Select
                      value={formData.escribir || "SI"}
                      onValueChange={(v) => handleChange("escribir", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">Sí</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conducir">¿Sabe Conducir?</Label>
                    <Select
                      value={formData.conducir || "NO"}
                      onValueChange={(v) => handleChange("conducir", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">Sí</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="observaciones">
                  Observaciones del Supervisor
                </Label>
                <Textarea
                  id="observaciones"
                  placeholder="Comentarios sobre el desempeño físico o psicológico..."
                  value={formData.observaciones}
                  onChange={(e) =>
                    handleChange("observaciones", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Veredicto de esta etapa */}
          <div className="pt-4 border-t border-border">
            <Label className="text-base mb-2 block">
              Veredicto de la Evaluación
            </Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={formData.estado === "APTO" ? "default" : "outline"}
                className={
                  formData.estado === "APTO"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
                onClick={() => handleChange("estado", "APTO")}
              >
                APTO
              </Button>
              <Button
                type="button"
                variant={
                  formData.estado === "NO_APTO" ? "destructive" : "outline"
                }
                onClick={() => handleChange("estado", "NO_APTO")}
              >
                NO APTO
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar Evaluación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
