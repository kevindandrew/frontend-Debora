"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        toast.success("Bienvenido al sistema");
        router.push("/dashboard");
      } else {
        // Manejar mensaje de error específico
        const errorMessage = result.error || "Credenciales inválidas";
        toast.error(errorMessage);
        // Limpiar contraseña en caso de error
        setPassword("");
      }
    } catch (error) {
      console.error(error);
      // Si el error es 401, mostrar mensaje específico
      if (error.response?.status === 401) {
        toast.error("Usuario o contraseña incorrectos");
      } else {
        toast.error("Error al iniciar sesión. Intente nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage:
              "url('/bolivian-military-soldiers-armed-forces-bolivia-fl.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-4 mb-8">
            <Image
              src="/images/image.png"
              alt="Dirección General Territorial Militar"
              width={80}
              height={80}
              className="object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold">SIREM</h1>
              <p className="text-sm text-slate-300">
                Dirección General Territorial Militar
              </p>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 text-balance">
            Sistema de Reclutamiento Militar
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Plataforma oficial de las Fuerzas Armadas de Bolivia para la gestión
            de postulantes premilitares y militares.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Image
              src="/images/image.png"
              alt="Estado Plurinacional de Bolivia - Ministerio de Defensa"
              width={48}
              height={60}
              className="object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">SIREM</h1>
              <p className="text-xs text-muted-foreground">
                Dirección General Territorial Militar
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Iniciar Sesión
            </h2>
            <p className="text-muted-foreground mt-1">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingrese su usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                forceUppercase={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  forceUppercase={false}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
