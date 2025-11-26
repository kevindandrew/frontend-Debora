import api from "@/lib/axios";

export const materialesService = {
  // Solicitar material (Jefe de Unidad)
  async solicitarMaterial(descripcion) {
    const response = await api.post("/api/v1/materiales/solicitar", {
      descripcion_pedido: descripcion,
    });
    return response.data;
  },

  // Listar solicitudes (Admin/Director ve todas, Jefe ve suyas)
  async getSolicitudes(estado = null) {
    const params = {};
    if (estado) params.estado = estado;

    const response = await api.get("/api/v1/materiales/", { params });
    return response.data;
  },

  // Actualizar estado (Admin/Director)
  async actualizarEstado(id, estado) {
    const response = await api.patch(`/api/v1/materiales/${id}/estado`, {
      estado: estado,
    });
    return response.data;
  },
};
