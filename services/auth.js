import api from "@/lib/axios";

export const authService = {
  async login(username, password) {
    const response = await api.post("/api/v1/auth/login", {
      username,
      password,
    });
    return response.data;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser() {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },
};
