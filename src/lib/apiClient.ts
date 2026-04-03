import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.villa-sadulur.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Lebih tinggi untuk shared hosting yang kadang lambat cold-start
  timeout: 20000,
})

// Request interceptor — lampirkan token jika ada
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vs_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor — tangani error global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vs_token')
        localStorage.removeItem('vs_user')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
