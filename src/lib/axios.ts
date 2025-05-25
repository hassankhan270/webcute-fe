import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          // Forbidden
          console.error('Access forbidden')
          break
        case 404:
          // Not found
          console.error('Resource not found')
          break
        case 500:
          // Server error
          console.error('Server error')
          break
        default:
          console.error('An error occurred')
      }
    }
    return Promise.reject(error)
  }
)

// API methods
export const apiService = {
  // Posts
  getPosts: (page: number, limit: number, status?: string, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    if (status && status !== 'all') {
      params.append('status', status)
    }
    if (search) {
      params.append('search', search)
    }
    return api.get(`/posts?${params.toString()}`)
  },
  getPost: (id: string) => api.get(`/posts/${id}`),
  createPost: (data: any) => api.post('/posts', data),
  updatePost: (id: string, data: any) => api.put(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  togglePostStatus: (id: string, status: string) => 
    api.post(`/posts/${id}/${status}`),

  // Comments
  getComments: (postId: string) => api.get(`/posts/${postId}/comments`),
  createComment: (postId: string, content: string) => 
    api.post(`/posts/${postId}/comments`, { content }),
  deleteComment: (postId: string, commentId: string) => 
    api.delete(`/posts/${postId}/comments/${commentId}`),

  // Auth
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string }) => 
    api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
}

export default api 