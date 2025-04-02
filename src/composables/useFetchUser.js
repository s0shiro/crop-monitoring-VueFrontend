import { authApi } from '@/api/authApi'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { computed, watch, onMounted } from 'vue'

export function useFetchUser() {
  const authStore = useAuthStore()

  // Get the current user's ID from the auth store
  const currentUserId = computed(() => authStore.user?.id)

  const fetchUser = async () => {
    const { data } = await authApi.getCurrentUser()
    return data
  }

  // Create the query with the current user ID in the query key
  const query = useQuery({
    // Including the user ID in the key ensures a new query when user changes
    queryKey: ['user', currentUserId],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
    // Don't cache this data for long
    staleTime: 5 * 1000, // 5 seconds
    // Only try to fetch if we have a user
    enabled: computed(() => !!authStore.isAuthenticated),
    onSuccess: (data) => {
      console.log('User data fetched:', data)
    },
    onError: (err) => {
      console.error('Error fetching user:', err)
    },
  })

  // Watch for user ID changes and force refetch when it changes
  watch(currentUserId, (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      console.log('User ID changed, forcing refetch')
      // Force an immediate refetch
      query.refetch()
    }
  })

  // Force refetch on mount to ensure fresh data
  onMounted(() => {
    query.refetch()
  })

  return query
}
