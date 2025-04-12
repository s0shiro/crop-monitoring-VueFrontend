<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import { CalendarIcon, MapPinIcon, Wheat, UsersIcon, Loader2Icon } from 'lucide-vue-next'
import { format } from 'date-fns'

const router = useRouter()
const { toast } = useToast()

// Filter states
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedCategory = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

// Available statuses for filter
const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'standing', label: 'Standing' },
  { value: 'harvest', label: 'Ready for Harvest' },
  { value: 'partially harvested', label: 'Partially Harvested' },
  { value: 'harvested', label: 'Harvested' },
]

// Fetch categories for filter
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/categories')
    return response.data
  },
})

// Function to build query parameters
const buildQueryParams = (cursor = 0) => {
  const params = { cursor }
  if (searchQuery.value) params.search = searchQuery.value
  if (selectedStatus.value !== 'all') params.status = selectedStatus.value
  if (selectedCategory.value !== 'all') params.category = selectedCategory.value
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value) params.date_to = dateTo.value
  return params
}

// Fetch crop plantings with filters
const {
  data: plantingsData,
  error: plantingsError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading: isLoadingPlantings,
  refetch,
} = useInfiniteQuery({
  queryKey: ['crop-plantings', searchQuery, selectedStatus, selectedCategory, dateFrom, dateTo],
  queryFn: async ({ pageParam = 0 }) => {
    const response = await axiosInstance.get('/api/crop-plantings', {
      params: buildQueryParams(pageParam),
    })
    return response.data
  },
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load crop plantings.',
    })
  },
})

// Computed property for status counts
const statusCounts = computed(() => {
  if (!plantingsData.value) return {}
  return plantingsData.value.pages[0]?.counts || {}
})

// Status badge color mapping
const getStatusColor = (status) => {
  const colors = {
    standing: 'bg-yellow-500',
    harvest: 'bg-green-500',
    'partially harvested': 'bg-blue-500',
    harvested: 'bg-gray-500',
  }
  return colors[status] || 'bg-gray-500'
}

// Handler for filter changes
const handleFilterChange = () => {
  refetch()
}

// Navigate to planting details
const viewPlantingDetails = (id) => {
  router.push({ name: 'crop-planting-details', params: { id } })
}

// Navigate to add new planting
const addNewPlanting = () => {
  router.push({ name: 'crop-planting-form' })
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-extrabold text-primary">Crop Plantings</h1>
      <Button @click="addNewPlanting" variant="default">Add New Planting</Button>
    </div>

    <!-- Status Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        v-for="status in statuses.slice(1)"
        :key="status.value"
        class="p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="
          () => {
            selectedStatus = status.value
            handleFilterChange()
          }
        "
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">{{ status.label }}</p>
            <p class="text-2xl font-bold mt-1">
              {{ statusCounts[status.value.replace(' ', '_')] || 0 }}
            </p>
          </div>
          <div :class="[getStatusColor(status.value), 'w-3 h-3 rounded-full']"></div>
        </div>
      </Card>
    </div>

    <!-- Filters Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <Input
          v-model="searchQuery"
          placeholder="Search plantings..."
          @input="handleFilterChange"
        />
      </div>
      <div>
        <Select v-model="selectedStatus" @update:modelValue="handleFilterChange">
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select v-model="selectedCategory" @update:modelValue="handleFilterChange">
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Input
          v-model="dateFrom"
          type="date"
          placeholder="From Date"
          @change="handleFilterChange"
        />
      </div>
      <div>
        <Input v-model="dateTo" type="date" placeholder="To Date" @change="handleFilterChange" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingPlantings" class="flex justify-center py-8">
      <Loader2Icon class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="plantingsError" class="text-center text-destructive py-8">
      Failed to load crop plantings.
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!plantingsData?.pages[0]?.data?.length"
      class="text-center text-muted-foreground py-8"
    >
      No crop plantings found.
    </div>

    <!-- Plantings List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="planting in plantingsData?.pages.flatMap((page) => page.data)"
        :key="planting.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="viewPlantingDetails(planting.id)"
      >
        <div class="p-6 space-y-4">
          <!-- Header with Status -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Wheat class="w-5 h-5 text-primary" />
              <h3 class="text-lg font-semibold">{{ planting.crop.name }}</h3>
            </div>
            <div
              :class="[
                getStatusColor(planting.status),
                'px-2 py-1 rounded-full text-white text-xs font-medium',
              ]"
            >
              {{ planting.status }}
            </div>
          </div>

          <!-- Farmer Info -->
          <div class="flex items-center space-x-2 text-sm text-muted-foreground">
            <UsersIcon class="w-4 h-4" />
            <span>{{ planting.farmer.name }}</span>
          </div>

          <!-- Location -->
          <div class="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPinIcon class="w-4 h-4" />
            <span>{{ planting.barangay }}, {{ planting.municipality }}</span>
          </div>

          <!-- Dates -->
          <div class="flex justify-between text-sm">
            <div class="flex items-center space-x-2">
              <CalendarIcon class="w-4 h-4 text-muted-foreground" />
              <div>
                <p class="text-muted-foreground">Planted</p>
                <p>{{ format(new Date(planting.planting_date), 'MMM d, yyyy') }}</p>
              </div>
            </div>
            <div v-if="planting.expected_harvest_date" class="flex items-center space-x-2">
              <CalendarIcon class="w-4 h-4 text-muted-foreground" />
              <div>
                <p class="text-muted-foreground">Expected Harvest</p>
                <p>{{ format(new Date(planting.expected_harvest_date), 'MMM d, yyyy') }}</p>
              </div>
            </div>
          </div>

          <!-- Area Information -->
          <div class="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p class="text-sm text-muted-foreground">Area Planted</p>
              <p class="font-medium">{{ planting.area_planted }} ha</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Remaining Area</p>
              <p class="font-medium">{{ planting.remaining_area }} ha</p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Load More -->
    <div v-if="hasNextPage" class="flex justify-center mt-6">
      <Button
        variant="outline"
        @click="fetchNextPage"
        :disabled="isFetchingNextPage"
        class="min-w-[200px]"
      >
        <template v-if="isFetchingNextPage">
          <Loader2Icon class="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </template>
        <template v-else>Load More</template>
      </Button>
    </div>
  </div>
</template>
