import api from "@/lib/axios";

export const notificationsService = {
  // Obtener notificaciones del usuario actual
  async getMyNotifications() {
    const response = await api.get("/api/v1/notificaciones/");
    return response.data;
  },

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    const response = await api.patch(
      `/api/v1/notificaciones/${notificationId}/leer`
    );
    return response.data;
  },

  // Marcar todas como leídas
  async markAllAsRead() {
    const response = await api.patch("/api/v1/notificaciones/leer-todas");
    return response.data;
  },

  // Obtener contador de no leídas
  async getUnreadCount() {
    const notifications = await this.getMyNotifications();
    return notifications.filter((n) => !n.leida).length;
  },
};
