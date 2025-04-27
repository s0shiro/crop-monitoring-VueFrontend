import { ref } from 'vue'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import axios from '@/lib/axios'

export function useUserManagement(params = {}) {
  const {
    search = ref(''),
    role = ref('all'),
    sortBy = ref('created_at'),
    sortDirection = ref('desc'),
  } = params
  const queryClient = useQueryClient()

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: fetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refreshUsers,
  } = useInfiniteQuery({
    queryKey: ['users', search.value, role.value, sortBy.value, sortDirection.value],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await axios.get('/api/users', {
        params: {
          cursor: pageParam,
          search: search.value,
          role: role.value,
          sortBy: sortBy.value,
          sortDirection: sortDirection.value,
        },
      })
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
  })

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationFn: async (userData) => {
      const { data } = await axios.post('/api/users', userData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
    },
  })

  const { mutateAsync: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: async ({ id, userData }) => {
      const { data } = await axios.put(`/api/users/${id}`, userData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
    },
  })

  const { mutateAsync: deleteUser, isLoading: isDeleting } = useMutation({
    mutationFn: async (id) => {
      const { data } = await axios.delete(`/api/users/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
    },
  })

  const getUserDetails = async (id) => {
    const { data } = await axios.get(`/api/users/${id}/profile`)
    return data
  }

  const { mutateAsync: updateUserPermissions } = useMutation({
    mutationFn: async ({ id, permissions }) => {
      const { data } = await axios.put(`/api/users/${id}/permissions`, { permissions })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
    },
  })

  return {
    usersData,
    isLoadingUsers,
    fetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deleteUser,
    isDeleting,
    refreshUsers,
    getUserDetails,
    updateUserPermissions,
  }
}
