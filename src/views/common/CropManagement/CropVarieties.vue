<script setup>
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { Button } from '@/components/ui/button'
import axiosInstance from '@/lib/axios'
import { useToast } from '@/components/ui/toast/use-toast'

const route = useRoute()
const cropId = route.params.cropId
const { toast } = useToast()

const {
  data: varieties,
  isLoading,
  error,
} = useQuery({
  queryKey: ['varieties', cropId],
  queryFn: async () => {
    const response = await axiosInstance.get(`/api/crops/${cropId}/varieties`)
    return response.data
  },
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
    <h1 class="text-3xl font-extrabold text-primary">Varieties</h1>
    <div v-if="isLoading" class="text-center text-muted-foreground py-4 italic">
      Loading varieties...
    </div>
    <div v-else-if="error" class="text-center text-destructive py-4 italic">
      Failed to load varieties.
    </div>
    <div v-else>
      <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <li
          v-for="variety in varieties"
          :key="variety.id"
          class="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <h3 class="text-lg font-semibold text-primary">{{ variety.name }}</h3>
          <p class="text-sm text-muted-foreground">Maturity Days: {{ variety.maturity_days }}</p>
        </li>
      </ul>
    </div>
    <Button
      @click="$router.back()"
      class="mt-6 bg-secondary text-white hover:bg-secondary/90 rounded-lg shadow-md"
    >
      Back to Crops
    </Button>
  </div>
</template>
