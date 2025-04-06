import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axios'

export function useUserManagement() {
  const queryClient = useQueryClient()

  // Fetch users query
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: fetchError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/users')
      return data
    },
  })

  // Get user details query
  const getUserDetails = async (userId) => {
    const { data } = await axiosInstance.get(`/api/users/${userId}/profile`)
    return data
  }

  // Create user mutation
  const {
    mutateAsync: createUser,
    isPending: isCreating,
    isError: isCreateError,
    error: createError,
  } = useMutation({
    mutationFn: async (userData) => {
      const { data } = await axiosInstance.post('/api/users', userData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  // Update user mutation
  const {
    mutateAsync: updateUser,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
  } = useMutation({
    mutationFn: async (userData) => {
      const { data } = await axiosInstance.put(`/api/users/${userData.id}`, userData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  // Delete user mutation
  const {
    mutateAsync: deleteUser,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: async (userId) => {
      const { data } = await axiosInstance.delete(`/api/users/${userId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  // Update user permissions mutation
  const {
    mutateAsync: updateUserPermissions,
    isPending: isUpdatingPermissions,
    isError: isUpdatePermissionsError,
    error: updatePermissionsError,
  } = useMutation({
    mutationFn: async ({ id, permissions }) => {
      const { data } = await axiosInstance.patch(`/api/users/${id}/permissions`, { permissions })
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
    },
  })

  return {
    // Queries
    users,
    isLoadingUsers,
    fetchError,
    getUserDetails,

    // Create mutation
    createUser,
    isCreating,
    isCreateError,
    createError,

    // Update mutation
    updateUser,
    isUpdating,
    isUpdateError,
    updateError,

    // Delete mutation
    deleteUser,
    isDeleting,
    isDeleteError,
    deleteError,

    // Update Permissions mutation
    updateUserPermissions,
    isUpdatingPermissions,
    isUpdatePermissionsError,
    updatePermissionsError,
  }
}
