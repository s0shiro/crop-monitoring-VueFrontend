import { ref } from 'vue'
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import axios from '@/lib/axios'

export function useCropPlantingManagement(params = {}) {
  const {
    search = ref(''),
    status = ref('all'),
    category = ref('all'),
    dateFrom = ref(''),
    dateTo = ref(''),
    sortBy = ref('created_at'),
    sortDirection = ref('desc'),
  } = params

  const {
    data: plantingsData,
    isLoading: isLoadingPlantings,
    error: fetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refreshPlantings,
  } = useInfiniteQuery({
    queryKey: [
      'crop-plantings',
      search.value,
      status.value,
      category.value,
      dateFrom.value,
      dateTo.value,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await axios.get('/api/crop-plantings', {
        params: {
          cursor: pageParam,
          search: search.value,
          status: status.value !== 'all' ? status.value : undefined,
          category_id: category.value !== 'all' ? category.value : undefined,
          date_from: dateFrom.value || undefined,
          date_to: dateTo.value || undefined,
          sortBy: sortBy.value,
          sortDirection: sortDirection.value,
        },
      })
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
  })

  // Get Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axios.get('/api/categories')
      return data
    },
  })

  return {
    plantingsData,
    isLoadingPlantings,
    fetchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refreshPlantings,
    categories,
  }
}
