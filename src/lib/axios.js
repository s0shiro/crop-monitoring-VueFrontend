import router from '@/router'
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // This is crucial for cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only try refresh if:
    // 1. It's a 401 error
    // 2. Not already retrying
    // 3. Not a refresh request itself
    // 4. Not a login/register request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/api/refresh') &&
      !originalRequest.url.includes('/api/login') &&
      !originalRequest.url.includes('/api/register')
    ) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        await axiosInstance.post('/api/refresh')
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // If refresh fails and we're not on a guest route, redirect to login
        if (!router.currentRoute.value.meta.requiresGuest) {
          router.push({ name: 'login' })
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
