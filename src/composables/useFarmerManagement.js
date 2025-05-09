import { ref } from 'vue'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import axios from '@/lib/axios'

export function useFarmerManagement(params = {}) {
  const {
    search = ref(''),
    association = ref('all'),
    sortBy = ref('created_at'),
    sortDirection = ref('desc'),
  } = params
  const queryClient = useQueryClient()

  const {
    data: farmersData,
    isLoading: isLoadingFarmers,
    error: fetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refreshFarmers,
  } = useInfiniteQuery({
    queryKey: ['farmers', search.value, association.value, sortBy.value, sortDirection.value],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await axios.get('/api/farmers', {
        params: {
          cursor: pageParam,
          search: search.value,
          association: association.value,
          sortBy: sortBy.value,
          sortDirection: sortDirection.value,
        },
      })
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
  })

  const { mutateAsync: createFarmer, isPending: isCreatingFarmer } = useMutation({
    mutationFn: async (farmerData) => {
      const { data } = await axios.post('/api/farmers', farmerData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['farmers'])
    },
  })

  return {
    farmersData,
    isLoadingFarmers,
    fetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createFarmer,
    isCreatingFarmer,
    refreshFarmers,
  }
}
