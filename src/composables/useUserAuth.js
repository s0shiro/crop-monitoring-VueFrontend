import { useAuthStore } from '@/stores/auth'
import { useFetchUser } from '@/composables/useFetchUser'
import { watchEffect } from 'vue'

export function useUserAuth() {
  const authStore = useAuthStore()
  const { data, isLoading, isError, error, refetch } = useFetchUser()

  // Watch for changes in the user data and update the auth store
  watchEffect(() => {
    if (data.value) {
      authStore.updateUserRolesAndPermissions(data.value)
    }
  })

  return {
    // User data from TanStack Query
    userData: data,
    isLoading,
    isError,
    error,
    refetch,

    // Permission check methods from the auth store
    hasRole: (role) => authStore.hasRole(role),
    hasPermission: (permission) => authStore.hasPermission(permission),
    hasAnyPermission: (permissions) => authStore.hasAnyPermission(permissions),

    // Auth store getters
    isAuthenticated: () => authStore.isAuthenticated,
    roles: () => authStore.roles,
    permissions: () => authStore.permissions,
  }
}
