import api from "@/lib/axios";

export const tramitesService = {
  // Obtener mis trámites (Licenciado)
  async getMisTramites() {
    const response = await api.get("/api/v1/tramites/");
    return response.data;
  },

  // Crear nuevo trámite
  async crearTramite(tipoTramite, descripcion) {
    const response = await api.post("/api/v1/tramites/", {
      tipo_tramite: tipoTramite,
      descripcion: descripcion,
    });
    return response.data;
  },

  // Obtener detalle completo de un trámite
  async getTramiteDetalle(tramiteId) {
    const response = await api.get(`/api/v1/tramites/${tramiteId}`);
    return response.data;
  },

  // Subir documento a un trámite específico
  async subirDocumento(tramiteId, archivo, tipoRequisito) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombre_requisito", tipoRequisito);

    const response = await api.post(
      `/api/v1/tramites/${tramiteId}/requisitos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Obtener requisitos de un trámite
  async getRequisitos(tramiteId) {
    const response = await api.get(`/api/v1/tramites/${tramiteId}/requisitos`);
    return response.data;
  },

  // --- ADMIN ---

  // Obtener todos los trámites (Admin)
  // El backend filtra automáticamente por rol - admins ven todo, licenciados solo los suyos
  async getAllTramites() {
    const response = await api.get("/api/v1/tramites/");
    return response.data;
  },

  // Responder trámite (Aprobar/Rechazar)
  async responderTramite(id, estado, respuestaTexto) {
    // Según OpenAPI: PATCH /tramites/{tramite_id}/respuesta
    // Body: { estado: "ACEPTADO"|"RECHAZADO", respuesta_texto: string (min 10 chars) }

    const payload = {
      estado: estado,
      respuesta_texto: respuestaTexto,
    };

    console.log("📤 Enviando respuesta de trámite:", payload);
    console.log("📤 ID del trámite:", id);

    const response = await api.patch(
      `/api/v1/tramites/${id}/respuesta`,
      payload
    );
    return response.data;
  },
};
