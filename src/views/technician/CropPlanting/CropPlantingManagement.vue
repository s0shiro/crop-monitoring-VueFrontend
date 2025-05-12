<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useUserAuth } from '@/composables/useUserAuth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import { CalendarIcon, MapPinIcon, Wheat, UsersIcon, Loader2Icon } from 'lucide-vue-next'
import { format } from 'date-fns'
import { useCropPlantingManagement } from '@/composables/useCropPlantingManagement'
import { useUtilsStore } from '@/stores/utils'

const router = useRouter()
const { toast } = useToast()
const { hasPermission } = useUserAuth()
const utilsStore = useUtilsStore()

// Filter states
const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedCategory = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

// Search debounce
const debouncedSearch = utilsStore.debounce(
  () => {
    refreshPlantings()
  },
  300,
  'cropPlantingSearch',
)

// Available statuses for filter
const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'standing', label: 'Standing' },
  { value: 'harvest', label: 'Ready for Harvest' },
  { value: 'partially harvested', label: 'Partially Harvested' },
  { value: 'harvested', label: 'Harvested' },
]

// Use the composable with reactive parameters
const {
  plantingsData,
  isLoadingPlantings,
  fetchError: plantingsError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refreshPlantings,
  categories,
} = useCropPlantingManagement({
  search: searchQuery,
  status: selectedStatus,
  category: selectedCategory,
  dateFrom,
  dateTo,
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
  debouncedSearch()
}

// Clean up debounce on component unmount
onUnmounted(() => {
  utilsStore.clearDebounce('cropPlantingSearch')
})

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
  <div class="space-y-10">
    <!-- Header Section -->
    <div
      class="flex items-center justify-between bg-gradient-to-r from-primary/10 to-card/80 rounded-xl p-6 shadow-sm mb-2"
    >
      <h1 class="text-3xl font-extrabold text-primary flex items-center gap-2">
        <Wheat class="w-8 h-8 text-primary" />
        Crop Plantings
      </h1>
      <Button
        v-if="hasPermission('manage_crop_planting')"
        @click="addNewPlanting"
        variant="default"
        class="flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
      >
        <span class="font-semibold">Add New Planting</span>
        <Wheat class="w-5 h-5" />
      </Button>
    </div>

    <!-- Status Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card
        v-for="status in statuses.slice(1)"
        :key="status.value"
        class="p-6 bg-card border border-border shadow-lg hover:shadow-xl transition-all cursor-pointer group rounded-2xl relative overflow-hidden"
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
            <p
              class="text-3xl font-extrabold mt-1 text-primary group-hover:text-accent transition-colors"
            >
              {{ statusCounts[status.value.replace(' ', '_')] || 0 }}
            </p>
          </div>
          <div
            :class="[
              getStatusColor(status.value),
              'w-4 h-4 rounded-full border-2 border-card shadow',
            ]"
          ></div>
        </div>
        <div class="absolute right-4 top-4 opacity-10 text-6xl pointer-events-none select-none">
          <Wheat v-if="status.value === 'harvest'" class="w-12 h-12" />
          <UsersIcon v-else-if="status.value === 'standing'" class="w-12 h-12" />
          <CalendarIcon v-else-if="status.value === 'partially harvested'" class="w-12 h-12" />
          <MapPinIcon v-else class="w-12 h-12" />
        </div>
      </Card>
    </div>

    <!-- Filters Section -->
    <div class="bg-muted/40 dark:bg-muted/60 rounded-xl p-6 shadow-inner mb-2">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Input
            v-model="searchQuery"
            placeholder="Search plantings..."
            type="search"
            class="rounded-lg shadow-sm focus:ring-primary/40 bg-card text-foreground border border-border"
            @input="handleFilterChange"
          />
        </div>
        <div>
          <Select v-model="selectedStatus" @update:modelValue="handleFilterChange">
            <SelectTrigger
              class="rounded-lg shadow-sm bg-card text-foreground border border-border"
            >
              <SelectValue placeholder="Filter by status" />
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
            <SelectTrigger
              class="rounded-lg shadow-sm bg-card text-foreground border border-border"
            >
              <SelectValue placeholder="Filter by category" />
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
            class="rounded-lg shadow-sm bg-card text-foreground border border-border"
            @change="handleFilterChange"
          />
        </div>
        <div>
          <Input
            v-model="dateTo"
            type="date"
            placeholder="To Date"
            class="rounded-lg shadow-sm bg-card text-foreground border border-border"
            @change="handleFilterChange"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingPlantings" class="flex justify-center py-16">
      <Loader2Icon class="w-12 h-12 animate-spin text-primary" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="plantingsError"
      class="text-center text-destructive py-16 text-lg font-semibold"
    >
      Failed to load crop plantings.
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!plantingsData?.pages[0]?.data?.length"
      class="text-center text-muted-foreground py-16 flex flex-col items-center gap-4"
    >
      <Wheat class="w-12 h-12 opacity-30" />
      <span class="text-xl font-medium">No crop plantings found.</span>
    </div>

    <!-- Plantings List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card
        v-for="planting in plantingsData?.pages.flatMap((page) => page.data)"
        :key="planting.id"
        class="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-muted/30 border border-border hover:border-primary/30 rounded-2xl cursor-pointer relative overflow-hidden"
        @click="viewPlantingDetails(planting.id)"
      >
        <div class="p-7 space-y-5">
          <!-- Header with Status -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <Wheat class="w-6 h-6 text-primary/80" />
              <h3 class="text-lg font-bold text-primary/90 group-hover:text-primary">
                {{ planting.crop.name }}
              </h3>
            </div>
            <span
              :class="[
                getStatusColor(planting.status),
                'px-3 py-1 rounded-full text-white text-xs font-semibold shadow',
                'uppercase tracking-wide',
              ]"
            >
              {{ planting.status }}
            </span>
          </div>

          <!-- Farmer Info -->
          <div class="flex items-center space-x-2 text-sm text-muted-foreground">
            <UsersIcon class="w-4 h-4" />
            <span class="font-medium">{{ planting.farmer.name }}</span>
          </div>

          <!-- Location -->
          <div class="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPinIcon class="w-4 h-4" />
            <span>{{ planting.barangay }}, {{ planting.municipality }}</span>
          </div>

          <!-- Dates -->
          <div class="flex justify-between text-sm gap-4">
            <div class="flex items-center space-x-2">
              <CalendarIcon class="w-4 h-4 text-muted-foreground" />
              <div>
                <p class="text-muted-foreground">Planted</p>
                <p class="font-semibold">
                  {{ format(new Date(planting.planting_date), 'MMM d, yyyy') }}
                </p>
              </div>
            </div>
            <div v-if="planting.expected_harvest_date" class="flex items-center space-x-2">
              <CalendarIcon class="w-4 h-4 text-muted-foreground" />
              <div>
                <p class="text-muted-foreground">Expected Harvest</p>
                <p class="font-semibold">
                  {{ format(new Date(planting.expected_harvest_date), 'MMM d, yyyy') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Area Information -->
          <div class="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
            <div>
              <p class="text-xs text-muted-foreground">Area Planted</p>
              <p class="font-semibold text-base">{{ planting.area_planted }} ha</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Remaining Area</p>
              <p class="font-semibold text-base">{{ planting.remaining_area }} ha</p>
            </div>
          </div>
        </div>
        <div class="absolute right-4 bottom-4 opacity-10 text-7xl pointer-events-none select-none">
          <Wheat class="w-16 h-16" />
        </div>
      </Card>
    </div>

    <!-- Load More -->
    <div v-if="hasNextPage" class="flex justify-center mt-10">
      <Button
        variant="outline"
        @click="fetchNextPage"
        :disabled="isFetchingNextPage"
        class="min-w-[200px] shadow-md hover:scale-105 transition-transform"
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
