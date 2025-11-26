import api from "@/lib/axios";

export const evaluacionesService = {
  // --- EVALUACIÓN MÉDICA ---

  // Registrar evaluación médica (rol MEDICO)
  async registrarEvaluacionMedica(data) {
    // data debe incluir: postulacion_id, peso, estatura, grupo_sanguineo, etc.
    const response = await api.post("/api/v1/evaluaciones/medica", data);
    return response.data;
  },

  // Obtener evalación médica de una postulación
  async obtenerEvaluacionMedica(postulacionId) {
    const response = await api.get(
      `/api/v1/evaluaciones/medica/${postulacionId}`
    );
    return response.data;
  },

  // --- EVALUACIÓN FÍSICA ---

  // Registrar evaluación física (rol SUPERVISOR)
  async registrarEvaluacionFisica(data) {
    // data debe incluir: postulacion_id, flexiones, abdominales, carrera_3200m, etc.
    const response = await api.post("/api/v1/evaluaciones/fisica", data);
    return response.data;
  },

  // Obtener evaluación física de una postulación
  async obtenerEvaluacionFisica(postulacionId) {
    const response = await api.get(
      `/api/v1/evaluaciones/fisica/${postulacionId}`
    );
    return response.data;
  },
};
