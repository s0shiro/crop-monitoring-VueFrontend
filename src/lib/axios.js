import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // This is crucial for cookies to be sent with requests
})

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        await axios.post(
          '/api/refresh',
          {},
          {
            baseURL: axiosInstance.defaults.baseURL,
            withCredentials: true,
          },
        )

        // Retry the original request
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        // The auth store will handle this through checkAuth
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
