"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Mapear los datos del token al formato que espera la app
        // El token tiene: sub (id?), rol, usuario_id
        // La app espera: nombre, rol, email?
        const storedUser = authService.getCurrentUser();

        setUser({
          ...decoded,
          ...storedUser,
          rol: decoded.rol || storedUser?.rol, // Asegurar que el rol esté disponible
          unidad_id: decoded.unidad_id || storedUser?.unidad_id,
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token inválido", error);
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      // data: { access_token, token_type, rol, usuario_id }

      localStorage.setItem("token", data.access_token);

      const userData = {
        id: data.usuario_id,
        rol: data.rol,
        username: username,
        nombre: username, // Usamos username como nombre por ahora si no viene más info
        unidad_id: data.unidad_id,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      // Solo loguear si no es un error de credenciales (401)
      if (error.response?.status !== 401) {
        console.error("Login error", error);
      }

      const errorMessage =
        error.response?.data?.detail || "Credenciales inválidas";
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
