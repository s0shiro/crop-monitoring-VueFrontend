import { defineStore } from 'pinia'
import axiosInstance from '@/lib/axios'

export const useAuthStore = defineStore('auth', {
  // State represents the data in the store
  state: () => ({
    user: null,
    loading: false,
    error: null,
    isInitialized: false,
  }),

  // Getters compute derived state based on store state
  getters: {
    isAuthenticated: (state) => !!state.user,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },

  // Actions are methods used to mutate state and handle business logic
  actions: {
    // Register a new user
    async register(userData, redirectPath = '/dashboard') {
      this.loading = true
      this.error = null

      try {
        // Get CSRF cookie
        await axiosInstance.get('/sanctum/csrf-cookie')

        // Register the user
        const response = await axiosInstance.post('/api/register', userData)

        // Set the user if successful
        this.user = response.data.user

        // Use the injected router for navigation
        if (redirectPath) {
          this.router.push(redirectPath)
        }

        return {
          success: true,
          data: response.data,
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed'
        return {
          success: false,
          errors: err.response?.data?.errors || { general: ['An unexpected error occurred'] },
        }
      } finally {
        this.loading = false
      }
    },

    // Login an existing user
    async login(credentials, redirectPath = '/dashboard') {
      this.loading = true
      this.error = null

      try {
        await axiosInstance.get('/sanctum/csrf-cookie')

        const response = await axiosInstance.post('/api/login', credentials)

        this.user = response.data.user

        // Use the injected router for navigation
        if (redirectPath) {
          this.router.push(redirectPath)
        }

        return {
          success: true,
          data: response.data,
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'
        return {
          success: false,
          errors: err.response?.data?.errors || { general: ['Invalid credentials'] },
        }
      } finally {
        this.loading = false
      }
    },

    // Logout the current user
    async logout(redirectPath = '/login') {
      this.loading = true

      try {
        await axiosInstance.post('/api/logout')
        this.user = null

        // Use the injected router for navigation
        if (redirectPath) {
          this.router.push(redirectPath)
        }

        return { success: true }
      } catch (err) {
        this.error = 'Logout failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Check if the user is authenticated
    async checkAuth() {
      if (this.isInitialized && this.user) {
        return true
      }

      this.loading = true

      try {
        const response = await axiosInstance.get('/api/user')
        this.user = response.data
        this.isInitialized = true
        return true
      } catch (err) {
        this.user = null
        this.isInitialized = true
        return false
      } finally {
        this.loading = false
      }
    },

    // Initialize the auth state
    async init() {
      if (!this.isInitialized) {
        await this.checkAuth()
      }
    },

    // Clear all errors
    clearErrors() {
      this.error = null
    },
  },
})
