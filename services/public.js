import api from "@/lib/axios";

export const publicService = {
  // Modalidades
  async getModalidades() {
    const response = await api.get("/api/v1/modalidades/");
    return response.data;
  },

  async getModalidadById(id) {
    const response = await api.get(`/api/v1/modalidades/${id}`);
    return response.data;
  },

  async getUnidades() {
    try {
      const response = await api.get("/api/v1/unidades/");
      return response.data;
    } catch (error) {
      console.warn("No se pudo cargar unidades", error);
      return [];
    }
  },

  // Postulaciones
  async registrarPostulante(data) {
    // data debe coincidir con PostulacionCreate schema
    const response = await api.post("/api/v1/postulaciones/", data);
    return response.data;
  },

  // Subir documentos
  async subirDocumento(codigoInscripcion, tipoDocumento, archivo) {
    const formData = new FormData();
    formData.append("tipo_documento", tipoDocumento);
    formData.append("archivo", archivo);

    const response = await api.post(
      `/api/v1/postulaciones/${codigoInscripcion}/documentos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
