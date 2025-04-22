import { defineStore } from 'pinia'
import { authApi } from '@/api/authApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    loggingIn: false,
    error: null,
    userRoles: [],
    userPermissions: [],
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    isLoading: (state) => state.loading,
    isLoggingIn: (state) => state.loggingIn,
    authError: (state) => state.error,
    roles: (state) => state.userRoles,
    permissions: (state) => state.userPermissions,
  },

  actions: {
    /**
     * Check if user is authenticated by fetching user data
     */
    async checkAuth() {
      if (this.loading) return

      this.loading = true
      this.error = null

      try {
        const response = await authApi.getCurrentUser()

        if (response.status === 200) {
          this.user = response.data.user || response.data
          this.updateUserRolesAndPermissions(this.user)
          return this.user
        } else {
          this.clearUserData()
          throw new Error('Authentication check failed')
        }
      } catch (err) {
        this.clearUserData()
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear all user-related data
     */
    clearUserData() {
      this.user = null
      this.userRoles = []
      this.userPermissions = []
    },

    /**
     * Login user with username/email and password
     */
    async login(credentials) {
      this.loggingIn = true
      this.error = null
      this.clearUserData()

      try {
        const response = await authApi.login({
          login: credentials.login,
          password: credentials.password,
        })

        if (response.data.status === 'success') {
          this.user = response.data.user
          this.updateUserRolesAndPermissions(response.data.user)
          this.router.push({ name: 'dashboard' })
          return { success: true, data: response.data }
        }
        throw new Error(response.data.message || 'Login failed')
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'
        const errors = err.response?.data?.errors || {}
        if (!Object.keys(errors).length && this.error) {
          errors.general = [this.error]
        }
        return { success: false, errors }
      } finally {
        this.loggingIn = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      this.clearUserData()

      try {
        const response = await authApi.register(userData)
        if (response.data.status === 'success') {
          this.user = response.data.user
          this.updateUserRolesAndPermissions(response.data.user)
          this.router.push({ name: 'dashboard' })
          return { success: true, data: response.data }
        }
        throw new Error(response.data.message || 'Registration failed')
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed'
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
        await authApi.logout()
        this.clearUserData()
        this.router.push({ name: 'login' })
        return { success: true }
      } catch (err) {
        console.error('Logout failed', err)
        this.clearUserData()
        return { success: false, error: 'Logout failed' }
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user roles and permissions
     */
    updateUserRolesAndPermissions(userData) {
      if (userData) {
        this.userRoles = userData.roles || []
        this.userPermissions = userData.permissions || []
      } else {
        this.userRoles = []
        this.userPermissions = []
      }
    },

    /**
     * Check if user has a specific role
     */
    hasRole(role) {
      return this.userRoles.includes(role)
    },

    /**
     * Check if user has a specific permission
     */
    hasPermission(permission) {
      return this.userPermissions.includes(permission)
    },
  },
})
