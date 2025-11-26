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
import { adminService } from "@/services/admin";
import { toast } from "sonner";

const ROLES = [
  { value: "ADMINISTRADOR", label: "Administrador" },
  { value: "DIRECTOR", label: "Director" },
  { value: "JEFE_UNIDAD", label: "Jefe de Unidad" },
  { value: "MEDICO", label: "Médico" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "LICENCIADO", label: "Licenciado" },
];

export function UsuarioForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rol: "",
    nombres: "",
    paterno: "",
    materno: "",
    ci: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Usuario requerido";
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Contraseña debe tener al menos 6 caracteres";
    }
    if (!formData.rol) newErrors.rol = "Rol requerido";
    if (!formData.nombres.trim()) newErrors.nombres = "Nombres requeridos";
    if (!formData.paterno.trim())
      newErrors.paterno = "Apellido paterno requerido";
    if (!formData.ci.trim()) newErrors.ci = "CI requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await adminService.createUsuario(formData);
      toast.success("Usuario creado exitosamente");
      if (onSuccess) onSuccess();

      // Resetear formulario
      setFormData({
        username: "",
        password: "",
        rol: "",
        nombres: "",
        paterno: "",
        materno: "",
        ci: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">
            Usuario <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="Ej: jperez"
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Rol */}
        <div className="space-y-2">
          <Label htmlFor="rol">
            Rol <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.rol}
            onValueChange={(value) => handleChange("rol", value)}
          >
            <SelectTrigger className={errors.rol ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((rol) => (
                <SelectItem key={rol.value} value={rol.value}>
                  {rol.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rol && <p className="text-sm text-red-500">{errors.rol}</p>}
        </div>

        {/* CI */}
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
          {errors.ci && <p className="text-sm text-red-500">{errors.ci}</p>}
        </div>

        {/* Nombres */}
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

        {/* Apellido Paterno */}
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

        {/* Apellido Materno (opcional) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="materno">Apellido Materno (Opcional)</Label>
          <Input
            id="materno"
            value={formData.materno}
            onChange={(e) => handleChange("materno", e.target.value)}
            placeholder="Ej: García"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Usuario"}
        </Button>
      </div>
    </form>
  );
}
