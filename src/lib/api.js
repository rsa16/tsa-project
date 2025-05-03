import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const chatAPI = {
  async sendMessage(chatId, message, userId) {
    const response = await api.post(`/chats/${chatId}/messages`, {
      user_id: userId,
      message: message,
    });
    return response.data;
  },

  async createChat(title, userId) {
    const response = await api.post("/chats", {
      title: title,
      user_id: userId,
    });
    return response.data;
  },

  async getChats(userId) {
    const response = await api.get(`/chats/${userId}`);

    return response.data;
  },
};
export const userAPI = {
  async register(email, password) {},
};
