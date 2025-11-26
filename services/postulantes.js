import api from "@/lib/axios";

export const postulantesService = {
  // Obtener todos los postulantes (con filtros opcionales si el backend soporta)
  async getPostulantes(filters = {}) {
    const response = await api.get("/api/v1/postulaciones/", {
      params: filters, // { gestion, estado, unidad_id, ci, apellido }
    });
    return response.data;
  },

  // Obtener detalle de un postulante por código
  async getPostulanteByCodigo(codigo) {
    const response = await api.get(`/api/v1/postulaciones/${codigo}`);
    return response.data;
  },

  // Subir un documento para un postulante
  async subirDocumento(codigo, tipoDocumento, file) {
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("tipo_documento", tipoDocumento);

    const response = await api.post(
      `/api/v1/postulaciones/${codigo}/documentos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Actualizar estado del postulante (Aprobar/Rechazar)
  // Nota: El endpoint requiere el ID numérico de la postulación, no el código
  async actualizarEstado(postulacionId, estadoFinal, comentario = null) {
    const response = await api.patch(
      `/api/v1/postulaciones/${postulacionId}/veredicto`,
      {
        estado_final: estadoFinal, // "APTO" o "NO_APTO"
        comentario: comentario,
      }
    );
    return response.data;
  },

  // Licenciar soldado (Fin del servicio)
  async licenciarSoldado(postulacionId) {
    const response = await api.patch(
      `/api/v1/postulaciones/${postulacionId}/licenciar`
    );
    return response.data;
  },

  // Registrar examen externo
  async registrarExamenExterno(postulacionId, data) {
    const formData = new FormData();
    formData.append("tipo_examen", data.tipo_examen);
    formData.append("resultado", data.resultado);
    formData.append("fecha_examen", data.fecha_examen);
    if (data.archivo) {
      formData.append("archivo", data.archivo);
    }

    const response = await api.post(
      `/api/v1/postulaciones/${postulacionId}/examenes`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Obtener exámenes externos
  async getExamenesExternos(postulacionId) {
    const response = await api.get(
      `/api/v1/postulaciones/${postulacionId}/examenes`
    );
    return response.data;
  },

  // Agregar historial de servicio
  async agregarHistorial(postulacionId, data) {
    const response = await api.post(
      `/api/v1/postulaciones/${postulacionId}/historial`,
      data
    );
    return response.data;
  },

  // Obtener historial de servicio
  async getHistorial(postulacionId) {
    const response = await api.get(
      `/api/v1/postulaciones/${postulacionId}/historial`
    );
    return response.data;
  },
};
