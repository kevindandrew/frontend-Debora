import api from "@/lib/axios";

export const adminService = {
  // --- USUARIOS ---
  async getUsuarios() {
    const response = await api.get("/api/v1/usuarios/");
    return response.data;
  },

  async createUsuario(usuarioData) {
    const response = await api.post("/api/v1/usuarios/", usuarioData);
    return response.data;
  },

  async deleteUsuario(id) {
    const response = await api.delete(`/api/v1/usuarios/${id}`);
    return response.data;
  },

  // --- UNIDADES ---
  async getUnidades() {
    const response = await api.get("/api/v1/unidades/");
    return response.data;
  },

  async createUnidad(unidadData) {
    const response = await api.post("/api/v1/unidades/", unidadData);
    return response.data;
  },

  async asignarPersonal(unidadId, personalData) {
    const response = await api.post(
      `/api/v1/unidades/${unidadId}/personal`,
      personalData
    );
    return response.data;
  },

  // --- DASHBOARD STATS ---
  async getDashboardStats(gestion = new Date().getFullYear()) {
    const response = await api.get(`/api/v1/postulaciones/`, {
      params: { gestion },
    });

    const postulantes = response.data;

    const stats = {
      total: postulantes.length,
      inscritos: postulantes.filter((p) => p.estado === "INSCRITO").length,
      en_evaluacion: postulantes.filter((p) => p.estado === "EN_EVALUACION")
        .length,
      aptos: postulantes.filter((p) => p.estado === "APTO").length,
      no_aptos: postulantes.filter((p) => p.estado === "NO_APTO").length,
      licenciados: postulantes.filter((p) => p.estado === "LICENCIADO").length,
      por_modalidad: {},
      recientes: postulantes.slice(0, 10),
    };

    postulantes.forEach((p) => {
      if (!stats.por_modalidad[p.modalidad]) {
        stats.por_modalidad[p.modalidad] = 0;
      }
      stats.por_modalidad[p.modalidad]++;
    });

    return stats;
  },

  // --- POSTULANTES ---
  async createPostulante(data) {
    // Endpoint correcto según OpenAPI spec
    const response = await api.post("/api/v1/postulaciones/", data);
    return response.data;
  },
};
