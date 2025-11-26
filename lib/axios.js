import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://backend-debora.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores (401, 422, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expirado o inválido
        if (typeof window !== "undefined") {
          // Opcional: Limpiar token y redirigir
          // localStorage.removeItem('token');
          // window.location.href = '/login';
          console.warn("Sesión expirada o no autorizada");
        }
      }

      if (status === 422) {
        console.error("Error de validación:", JSON.stringify(data, null, 2));
        // Podríamos transformar el error aquí para que sea más fácil de manejar en los componentes
      }
    }
    return Promise.reject(error);
  }
);

export default api;
