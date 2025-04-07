<script setup>
import { useRoute } from 'vue-router'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import axiosInstance from '@/lib/axios'
import { useToast } from '@/components/ui/toast/use-toast'

const route = useRoute()
const cropId = route.params.cropId
const { toast } = useToast()

const fetchVarieties = async ({ pageParam = 0 }) => {
  const response = await axiosInstance.get(`/api/crops/${cropId}/varieties`, {
    params: { cursor: pageParam },
  })
  return response.data
}

const {
  data: varietiesData,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
} = useInfiniteQuery({
  queryKey: ['varieties', cropId],
  queryFn: fetchVarieties,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load varieties.',
    })
  },
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-extrabold text-primary">Varieties</h1>
      <Button @click="$router.back()" variant="default">Back to Crops</Button>
    </div>

    <div v-if="isLoading" class="text-center text-muted-foreground py-4 italic">
      Loading varieties...
    </div>
    <div v-else-if="error" class="text-center text-destructive py-4 italic">
      Failed to load varieties.
    </div>
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-for="page in varietiesData.pages" :key="page.id">
          <Card
            v-for="variety in page.data"
            :key="variety.id"
            class="flex flex-col items-start p-4 shadow-md hover:shadow-lg transition-shadow rounded-lg"
          >
            <div class="flex justify-between w-full">
              <h3 class="text-lg font-semibold text-primary">{{ variety.name }}</h3>
            </div>
            <p class="text-sm text-muted-foreground">Maturity Days: {{ variety.maturity_days }}</p>
          </Card>
        </template>
      </div>
      <div class="text-center mt-6">
        <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" variant="default">
          Load More
        </Button>
        <div v-else-if="isFetchingNextPage" class="text-muted-foreground italic">Loading...</div>
      </div>
    </div>
  </div>
</template>
