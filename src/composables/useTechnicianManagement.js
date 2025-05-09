import { ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import axios from '@/lib/axios'

export function useTechnicianManagement(params = {}) {
  const { search = ref('') } = params

  const {
    data: techniciansData,
    isLoading: isLoadingTechnicians,
    error: fetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refreshTechnicians,
  } = useInfiniteQuery({
    queryKey: ['my-technicians', search.value],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await axios.get('/api/my-technicians', {
        params: {
          cursor: pageParam,
          search: search.value,
        },
      })
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
  })

  return {
    techniciansData,
    isLoadingTechnicians,
    fetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refreshTechnicians,
  }
}
