import api from "@/lib/axios";

export const modalidadesService = {
  // Listar todas las modalidades
  async getModalidades() {
    const response = await api.get("/api/v1/modalidades/");
    return response.data;
  },

  // Obtener una modalidad específica
  async getModalidadById(id) {
    const response = await api.get(`/api/v1/modalidades/${id}`);
    return response.data;
  },

  // Configurar fechas de una modalidad (ADMINISTRADOR)
  async configurarFechas(modalidadId, fechas) {
    const response = await api.patch(
      `/api/v1/modalidades/${modalidadId}`,
      fechas
    );
    return response.data;
  },
};
