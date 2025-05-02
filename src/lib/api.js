import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const chatAPI = {
  async sendMessage(chatId, message) {
    const response = await api.post(`/chats/${chatId}/messages`, { message })
    return response.data
  },

  async createChat(title) {
    const response = await api.post('/chats', { title })
    return response.data
  },

  async getChat(chatId) {
    const response = await api.get(`/chats/${chatId}`)
    return response.data
  },

  async getChats() {
    const response = await api.get('/chats')
    return response.data
  }
}
