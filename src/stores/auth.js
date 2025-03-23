import { defineStore } from 'pinia'
import axios from '@/lib/axios'

export const useAuthStore = defineStore('auth', {
  // State
  state: () => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,
  }),

  // Getters
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    isLoading: (state) => state.loading,
    authError: (state) => state.error,
    isInitialized: (state) => state.initialized,
  },

  // Actions
  actions: {
    /**
     * Initialize auth state by checking if user is logged in
     */
    async init() {
      // Don't re-initialize if already done
      if (this.initialized && this.user !== null) {
        console.log('Auth already initialized, skipping')
        return
      }

      console.log('Initializing auth store')
      this.loading = true

      try {
        await this.checkAuth()
        this.initialized = true
        console.log('Auth initialization successful, user:', this.user)
      } catch (err) {
        console.error('Failed to initialize auth state', err)
        this.user = null
        this.initialized = true
      } finally {
        this.loading = false
      }
    },

    /**
     * Check if user is authenticated by fetching user data
     */
    async checkAuth() {
      if (this.loading) return

      this.loading = true
      this.error = null

      try {
        // Add cache-busting parameter to avoid browser caching
        const timestamp = new Date().getTime()
        const response = await axios.get(`/api/user?t=${timestamp}`)

        if (response.status === 200) {
          this.user = response.data
          return response.data
        } else {
          this.user = null
          throw new Error('Authentication check failed')
        }
      } catch (err) {
        this.user = null
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Register a new user
     */
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post('/api/register', userData)

        if (response.data.status === 'success') {
          this.user = response.data.user

          // Navigate to dashboard on success
          this.router.push({ name: 'dashboard' })
          return { success: true, data: response.data }
        } else {
          throw new Error(response.data.message || 'Registration failed')
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed'

        // Format errors to match form expectations
        const errors = err.response?.data?.errors || {}
        if (!Object.keys(errors).length && this.error) {
          errors.general = [this.error]
        }

        return { success: false, errors }
      } finally {
        this.loading = false
      }
    },

    /**
     * Login user with email and password
     */
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post('/api/login', credentials)

        if (response.data.status === 'success') {
          this.user = response.data.user

          // Navigate to dashboard on success
          this.router.push({ name: 'dashboard' })
          return { success: true, data: response.data }
        } else {
          throw new Error(response.data.message || 'Login failed')
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'

        // Format errors to match form expectations
        const errors = err.response?.data?.errors || {}
        if (!Object.keys(errors).length && this.error) {
          errors.general = [this.error]
        }

        return { success: false, errors }
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout the current user
     */
    async logout() {
      this.loading = true

      try {
        await axios.post('/api/logout')
        this.user = null

        // Navigate to login page after logout
        this.router.push('/login')
        return { success: true }
      } catch (err) {
        console.error('Logout failed', err)
        this.error = err.response?.data?.message || 'Logout failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    /**
     * Refresh the JWT token
     */
    async refreshToken() {
      try {
        const response = await axios.post('/api/refresh')

        if (response.data.status === 'success') {
          this.user = response.data.user
          return { success: true, data: response.data }
        } else {
          throw new Error(response.data.message || 'Token refresh failed')
        }
      } catch (err) {
        this.user = null
        this.error = err.response?.data?.message || 'Token refresh failed'
        return { success: false, error: this.error }
      }
    },

    /**
     * Set error message
     */
    setError(message) {
      this.error = message
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    },
  },
})
