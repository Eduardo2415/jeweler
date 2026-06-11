import axios from 'axios'

// n8n base gateway URL loaded from public VITE variables
const baseURL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.em-cloud.top/webhook'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 20000
})

// Diagnostic interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🌐 [n8n Gateway Integration Error]:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

export default api
