<script setup>
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useToast } from '@/components/ui/toast/use-toast'
import { Loading } from '@/components/ui/loading'
import axiosInstance from '@/lib/axios'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users2,
  ChevronLeft,
  User,
  MapPin,
  FileText,
  UserCircle2,
  UserCircle,
  Ruler,
} from 'lucide-vue-next'

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
  <div>
    <Loading v-if="isLoadingAssociation">Loading association details...</Loading>

    <div v-else-if="associationError" class="text-center py-8 text-destructive">
      <p class="text-lg">Failed to load association details. Please try again later.</p>
    </div>

    <template v-else-if="associationData">
      <!-- Header Section -->
      <div class="mb-8">
        <Button
          variant="ghost"
          @click="$router.back()"
          class="mb-4 text-muted-foreground hover:text-primary"
        >
          <ChevronLeft class="h-4 w-4 mr-2" />
          Back to Associations
        </Button>

        <div class="flex items-start justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <Building2 class="h-8 w-8 text-primary" />
              <h1 class="text-3xl font-extrabold text-primary">
                {{ associationData.association.name }}
              </h1>
            </div>
            <p class="text-muted-foreground max-w-2xl pl-11">
              {{ associationData.association.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2">
        <!-- Gender Statistics Card -->
        <Card class="p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center gap-3 mb-6">
            <Users2 class="h-5 w-5 text-primary" />
            <h2 class="text-xl font-semibold">Gender Distribution</h2>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div
              class="bg-primary/5 rounded-lg p-6 flex items-center gap-4 transition-all hover:bg-primary/10"
            >
              <UserCircle2 class="h-8 w-8 text-blue-500" />
              <div>
                <div class="text-2xl font-bold text-primary">
                  {{ associationData.genderStats.male }}
                </div>
                <div class="text-sm text-muted-foreground">Male Farmers</div>
              </div>
            </div>
            <div
              class="bg-primary/5 rounded-lg p-6 flex items-center gap-4 transition-all hover:bg-primary/10"
            >
              <UserCircle class="h-8 w-8 text-pink-500" />
              <div>
                <div class="text-2xl font-bold text-primary">
                  {{ associationData.genderStats.female }}
                </div>
                <div class="text-sm text-muted-foreground">Female Farmers</div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Total Members Card -->
        <Card class="p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center gap-3 mb-6">
            <Users2 class="h-5 w-5 text-primary" />
            <h2 class="text-xl font-semibold">Total Members</h2>
          </div>
          <div class="flex items-center gap-4">
            <div class="bg-primary/5 rounded-lg p-6 flex-1">
              <div class="text-3xl font-bold text-primary">
                {{ associationData.totalFarmers }}
              </div>
              <div class="text-sm text-muted-foreground mt-1">Active Farmers</div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Farmers List Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <User class="h-5 w-5 text-primary" />
            <h2 class="text-xl font-semibold">Association Members</h2>
          </div>
        </div>

        <div
          v-if="associationData.farmers.length === 0"
          class="text-center py-12 bg-primary/5 rounded-lg"
        >
          <Users2 class="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p class="text-muted-foreground">No farmers in this association yet.</p>
        </div>

        <div v-else class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="farmer in associationData.farmers"
            :key="farmer.id"
            class="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/20 group"
          >
            <div class="flex justify-between items-start">
              <div class="space-y-4 w-full">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <User class="h-5 w-5 text-primary" />
                    <h3 class="font-semibold text-lg group-hover:text-primary transition-colors">
                      {{ farmer.name }}
                    </h3>
                  </div>
                  <Badge :variant="farmer.gender === 'male' ? 'default' : 'secondary'" class="mt-2">
                    {{ farmer.gender }}
                  </Badge>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin class="h-4 w-4" />
                    <span>{{ farmer.barangay }}, {{ farmer.municipality }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText class="h-4 w-4" />
                    <span>RSBSA: {{ farmer.rsbsa || 'Not available' }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ruler class="h-4 w-4" />
                    <span>Land Size: {{ farmer.landsize }} hectares</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
