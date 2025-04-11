`<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useInfiniteQuery } from '@tanstack/vue-query'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const route = useRoute()
const { toast } = useToast()

const fetchAssociation = async () => {
  const response = await axiosInstance.get(`/api/associations/${route.params.id}`)
  return response.data
}

const {
  data: associationData,
  error: associationError,
  isPending: isLoadingAssociation,
} = useQuery({
  queryKey: ['association', route.params.id],
  queryFn: fetchAssociation,
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load association details.',
    })
  },
})
</script>

<template>
  <div class="space-y-8">
    <div v-if="isLoadingAssociation" class="text-center py-8">
      <div
        class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"
      ></div>
      <p class="mt-2 text-muted-foreground">Loading association details...</p>
    </div>

    <div v-else-if="associationError" class="text-center py-8 text-destructive">
      Failed to load association details. Please try again later.
    </div>

    <template v-else-if="associationData">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold text-primary">{{ associationData.association.name }}</h1>
          <p class="text-muted-foreground mt-2">{{ associationData.association.description }}</p>
        </div>
        <Button variant="outline" @click="$router.back()">Back</Button>
      </div>

      <!-- Gender Statistics -->
      <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">Gender Statistics</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-primary/10 rounded-lg p-4">
            <div class="text-2xl font-bold text-primary">{{ associationData.genderStats.male }}</div>
            <div class="text-sm text-muted-foreground">Male Farmers</div>
          </div>
          <div class="bg-primary/10 rounded-lg p-4">
            <div class="text-2xl font-bold text-primary">{{ associationData.genderStats.female }}</div>
            <div class="text-sm text-muted-foreground">Female Farmers</div>
          </div>
        </div>
      </Card>

      <!-- Farmers List -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Farmers</h2>
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="farmer in associationData.farmers" :key="farmer.id" class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">{{ farmer.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ farmer.barangay }}, {{ farmer.municipality }}</p>
                <p class="text-sm text-muted-foreground mt-1">
                  RSBSA: {{ farmer.rsbsa || 'Not available' }}
                </p>
              </div>
              <Badge :variant="farmer.gender === 'male' ? 'default' : 'secondary'">
                {{ farmer.gender }}
              </Badge>
            </div>
          </Card>
        </div>

        <div v-if="associationData.farmers.length === 0" class="text-center py-8 text-muted-foreground">
          No farmers in this association yet.
        </div>
      </div>
    </template>
  </div>
</template>`