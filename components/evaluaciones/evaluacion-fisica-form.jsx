"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { evaluacionesService } from "@/services/evaluaciones";
import { toast } from "sonner";

export function EvaluacionFisicaForm({ postulante, onSuccess }) {
  const [formData, setFormData] = useState({
    postulacion_id: postulante.id,
    flexiones: "",
    abdominales: "",
    carrera_3200m: "",
    sabe_leer: true,
    sabe_escribir: true,
    sabe_conducir: false,
    observaciones: "",
    resultado_final_supervisor: true,
  });
  const [loading, setLoading] = useState(false);
  const [checkingMedical, setCheckingMedical] = useState(true);
  const [medicalApproved, setMedicalApproved] = useState(false);

  useEffect(() => {
    checkMedicalStatus();
  }, []);

  const checkMedicalStatus = async () => {
    try {
      const medicalEval = await evaluacionesService.obtenerEvaluacionMedica(
        postulante.id
      );
      if (medicalEval && medicalEval.resultado_apto) {
        setMedicalApproved(true);
      } else {
        setMedicalApproved(false);
        toast.error("El postulante no ha aprobado la evaluación médica");
      }
    } catch (error) {
      // Solo loguear si es un error diferente a 404 (No encontrado)
      if (error.response?.status !== 404) {
        console.error("Error checking medical status:", error);
      }
      setMedicalApproved(false);
    } finally {
      setCheckingMedical(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicalApproved) {
      toast.error("No se puede registrar: Requiere aprobación médica");
      return;
    }
    setLoading(true);

    // Validar formato de carrera (MM:SS)
    const timeRegex = /^\d{1,2}:\d{2}$/;
    if (!timeRegex.test(formData.carrera_3200m)) {
      toast.error(
        "El tiempo de carrera debe estar en formato MM:SS (ej: 14:30)"
      );
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        postulacion_id: formData.postulacion_id,
        flexiones: parseInt(formData.flexiones),
        abdominales: parseInt(formData.abdominales),
        carrera_3200m: formData.carrera_3200m,
        sabe_leer: formData.sabe_leer,
        sabe_escribir: formData.sabe_escribir,
        sabe_conducir: formData.sabe_conducir,
        resultado_final_supervisor: formData.resultado_final_supervisor,
      };

      console.log("📤 Enviando evaluación física:", dataToSend);

      await evaluacionesService.registrarEvaluacionFisica(dataToSend);
      toast.success("Evaluación física registrada correctamente");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("❌ Error al registrar evaluación física:", error);
      console.error("❌ Detalle del error:", error.response?.data);

      const errorMessage =
        error.response?.data?.detail || "Error al registrar evaluación física";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Error de validación (ver consola)"
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingMedical) {
    return (
      <div className="text-center py-10">Verificando requisitos médicos...</div>
    );
  }

  if (!medicalApproved) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚠️ Requisito Pendiente
        </h3>
        <p className="text-yellow-700">
          Este postulante debe aprobar la <strong>Evaluación Médica</strong>{" "}
          antes de proceder con la física.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.history.back()}
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pruebas Físicas</CardTitle>
          <CardDescription>
            Registre los resultados de las pruebas de aptitud física
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flexiones">
              Flexiones de Pecho <span className="text-red-500">*</span>
            </Label>
            <Input
              id="flexiones"
              type="number"
              value={formData.flexiones}
              onChange={(e) => handleChange("flexiones", e.target.value)}
              placeholder="Ej: 30"
              required
            />
            <p className="text-xs text-muted-foreground">
              Cantidad de flexiones realizadas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="abdominales">
              Abdominales <span className="text-red-500">*</span>
            </Label>
            <Input
              id="abdominales"
              type="number"
              value={formData.abdominales}
              onChange={(e) => handleChange("abdominales", e.target.value)}
              placeholder="Ej: 40"
              required
            />
            <p className="text-xs text-muted-foreground">
              Cantidad de abdominales realizadas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrera_3200m">
              Carrera 3200m (MM:SS) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="carrera_3200m"
              type="text"
              value={formData.carrera_3200m}
              onChange={(e) => handleChange("carrera_3200m", e.target.value)}
              placeholder="Ej: 15:30"
              required
            />
            <p className="text-xs text-muted-foreground">
              Tiempo en formato MM:SS
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habilidades Básicas</CardTitle>
          <CardDescription>
            Marque las habilidades que posee el postulante
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sabe_leer">Sabe Leer</Label>
            <Select
              value={formData.sabe_leer.toString()}
              onValueChange={(v) => handleChange("sabe_leer", v === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sabe_escribir">Sabe Escribir</Label>
            <Select
              value={formData.sabe_escribir.toString()}
              onValueChange={(v) => handleChange("sabe_escribir", v === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sabe_conducir">Sabe Conducir</Label>
            <Select
              value={formData.sabe_conducir.toString()}
              onValueChange={(v) => handleChange("sabe_conducir", v === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado de la Evaluación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              placeholder="Observaciones sobre la evaluación física..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resultado">
              Resultado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.resultado_final_supervisor.toString()}
              onValueChange={(v) =>
                handleChange("resultado_final_supervisor", v === "true")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">
                  ✅ APTO - Pasa evaluación física
                </SelectItem>
                <SelectItem value="false">
                  ❌ NO APTO - No pasa evaluación
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? "Registrando..." : "Registrar Evaluación Física"}
        </Button>
      </div>
    </form>
  );
}
