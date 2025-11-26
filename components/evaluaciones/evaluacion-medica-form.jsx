"use client";

import { useState } from "react";
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

export function EvaluacionMedicaForm({ postulante, onSuccess }) {
  const [formData, setFormData] = useState({
    postulacion_id: postulante.id,
    peso: "",
    estatura: "",
    grupo_sanguineo: "",
    color_piel: "",
    color_ojos: "",
    tipo_nariz: "",
    tipo_boca: "",
    prueba_embarazo: null,
    observaciones: "",
    resultado_apto: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        peso: parseFloat(formData.peso),
        estatura: parseFloat(formData.estatura),
      };

      // Si es mujer, incluir prueba_embarazo
      if (
        postulante.persona?.genero === "F" &&
        formData.prueba_embarazo !== null
      ) {
        dataToSend.prueba_embarazo = formData.prueba_embarazo === "true";
      } else {
        delete dataToSend.prueba_embarazo;
      }

      await evaluacionesService.registrarEvaluacionMedica(dataToSend);
      toast.success("Evaluación médica registrada correctamente");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail || "Error al registrar evaluación médica"
      );
    } finally {
      setLoading(false);
    }
  };

  const esMujer = postulante.persona?.genero === "F";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos Físicos</CardTitle>
          <CardDescription>
            Medidas y características del postulante
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="peso">
              Peso (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="peso"
              type="number"
              step="0.1"
              value={formData.peso}
              onChange={(e) => handleChange("peso", e.target.value)}
              placeholder="Ej: 70.5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estatura">
              Estatura (m) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estatura"
              type="number"
              step="0.01"
              value={formData.estatura}
              onChange={(e) => handleChange("estatura", e.target.value)}
              placeholder="Ej: 1.75"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grupo_sanguineo">
              Grupo Sanguíneo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.grupo_sanguineo}
              onValueChange={(v) => handleChange("grupo_sanguineo", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
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

          {esMujer && (
            <div className="space-y-2">
              <Label htmlFor="prueba_embarazo">Prueba de Embarazo</Label>
              <Select
                value={formData.prueba_embarazo?.toString() || ""}
                onValueChange={(v) => handleChange("prueba_embarazo", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Negativo</SelectItem>
                  <SelectItem value="true">Positivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Características Físicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color_piel">Color de Piel</Label>
            <Input
              id="color_piel"
              value={formData.color_piel}
              onChange={(e) => handleChange("color_piel", e.target.value)}
              placeholder="Ej: Trigueño"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color_ojos">Color de Ojos</Label>
            <Input
              id="color_ojos"
              value={formData.color_ojos}
              onChange={(e) => handleChange("color_ojos", e.target.value)}
              placeholder="Ej: Café"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_nariz">Tipo de Nariz</Label>
            <Input
              id="tipo_nariz"
              value={formData.tipo_nariz}
              onChange={(e) => handleChange("tipo_nariz", e.target.value)}
              placeholder="Ej: Aguileña"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_boca">Tipo de Boca</Label>
            <Input
              id="tipo_boca"
              value={formData.tipo_boca}
              onChange={(e) => handleChange("tipo_boca", e.target.value)}
              placeholder="Ej: Mediana"
            />
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
              placeholder="Observaciones médicas..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resultado">
              Resultado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.resultado_apto.toString()}
              onValueChange={(v) =>
                handleChange("resultado_apto", v === "true")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">
                  ✅ APTO - Pasa evaluación médica
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
          {loading ? "Registrando..." : "Registrar Evaluación Médica"}
        </Button>
      </div>
    </form>
  );
}
