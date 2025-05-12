<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'
import { useQuery } from '@tanstack/vue-query'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { Users2, User, Building2, FileText, ArrowUpDown, Search } from 'lucide-vue-next'
import { useFarmerManagement } from '@/composables/useFarmerManagement'
import { useUtilsStore } from '@/stores/utils'
import FarmerViewToggle from '@/components/FarmerViewToggle.vue'
import FarmerCardList from '@/components/FarmerCardList.vue'
import { useWindowSize } from '@vueuse/core'

const showAddFarmerDialog = ref(false)
const formErrors = ref({})
const searchQuery = ref('')
const associationFilter = ref('all')
const sortBy = ref('created_at')
const sortDirection = ref('desc')
const formData = ref({
  name: '',
  gender: '',
  rsbsa: '',
  landsize: '',
  barangay: '',
  municipality: '',
  association_id: '',
  technician_id: '',
})

const isGridView = ref(true)
const { width } = useWindowSize()
const isSmallScreen = computed(() => width.value < 640)

const { toast } = useToast()
const authStore = useAuthStore()
const utilsStore = useUtilsStore()

// Fetch associations for the dropdown
const { data: associationsData, isLoading: isLoadingAssociations } = useQuery({
  queryKey: ['associations-dropdown'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/associations')
    return response.data.data // Access the data array from the new structure
  },
})

// Fetch associations for filtering
const { data: associations } = useQuery({
  queryKey: ['associations-dropdown'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/associations')
    return response.data.data
  },
})

// Fetch technicians if user is admin
const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
  queryKey: ['technicians'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/users/technicians')
    return response.data
  },
  enabled: authStore.hasRole('admin'),
})

// State from composable with search params
const {
  farmersData,
  isLoadingFarmers,
  fetchError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  createFarmer: createFarmerMutation,
  isCreatingFarmer,
  refreshFarmers,
} = useFarmerManagement({
  search: searchQuery,
  association: associationFilter,
  sortBy: sortBy,
  sortDirection: sortDirection,
})

// Filter and sort handlers
function applyFilters() {
  refreshFarmers()
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  refreshFarmers()
}

// Use debounce from store
const debounceSearch = utilsStore.debounce(
  () => {
    refreshFarmers()
  },
  300,
  'farmerSearch',
)

const createFarmer = async () => {
  try {
    const farmerData = {
      ...formData.value,
      landsize: formData.value.landsize ? parseFloat(formData.value.landsize) : null,
      association_id: formData.value.association_id || null,
    }

    // Add technician_id only if admin is creating the farmer
    if (authStore.hasRole('admin') && formData.value.technician_id) {
      farmerData.technician_id = formData.value.technician_id
    }

    const result = await createFarmerMutation(farmerData)
    resetForm()
    toast({
      title: 'Success',
      description: result.message || 'Farmer created successfully',
    })
  } catch (error) {
    const errorData = error.response?.data
    toast({
      variant: 'destructive',
      title: 'Failed to create farmer!',
      description: errorData?.errors
        ? Object.values(errorData.errors).flat().join(', ')
        : errorData?.message || 'Failed to create farmer',
    })
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    gender: '',
    rsbsa: '',
    landsize: '',
    barangay: '',
    municipality: '',
    association_id: '',
    technician_id: '',
  }
  formErrors.value = {}
  showAddFarmerDialog.value = false
}
</script>

<template>
  <div class="space-y-8">
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3"
    >
      <div class="flex items-center gap-3">
        <Users2 class="h-8 w-8 text-primary shrink-0" />
        <h1 class="text-2xl sm:text-3xl font-extrabold text-primary break-words">
          Farmer Management
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <Button
          @click="showAddFarmerDialog = true"
          variant="default"
          class="gap-2 whitespace-nowrap"
        >
          <User class="h-4 w-4" />
          Add Farmer
        </Button>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="w-full">
        <div class="relative">
          <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            @input="debounceSearch"
            placeholder="Search farmers..."
            class="w-full pl-9 border-muted focus:ring-primary rounded-lg"
          />
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-2/3 lg:justify-end">
        <Select v-model="associationFilter" @update:modelValue="applyFilters">
          <SelectTrigger class="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by association" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Associations</SelectItem>
            <SelectItem
              v-for="association in associations"
              :key="association.id"
              :value="association.id.toString()"
            >
              {{ association.name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="sortBy" @update:modelValue="applyFilters">
          <SelectTrigger class="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="barangay">Barangay</SelectItem>
            <SelectItem value="municipality">Municipality</SelectItem>
          </SelectContent>
        </Select>

        <div
          class="flex gap-2 w-full sm:w-auto"
          :class="isSmallScreen ? 'justify-end mt-2 sm:mt-0' : ''"
        >
          <Button
            variant="outline"
            class="w-10 p-0"
            @click="toggleSortDirection"
            :title="sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
          >
            <ArrowUpDown class="h-4 w-4" :class="{ 'rotate-180': sortDirection === 'desc' }" />
          </Button>
          <FarmerViewToggle :isGrid="isGridView" @toggle="isGridView = !isGridView" />
        </div>
      </div>
    </div>

    <Loading v-if="isLoadingFarmers">Loading farmers...</Loading>

    <div v-else-if="fetchError" class="text-center py-8 text-destructive">
      Failed to load farmers. Please try again later.
    </div>

    <div v-else>
      <div
        v-if="
          !farmersData?.pages ||
          farmersData.pages.length === 0 ||
          farmersData.pages.every((page) => page.data.length === 0)
        "
        class="text-center text-muted-foreground py-8"
      >
        No farmers available.
      </div>
      <FarmerCardList :isGrid="isSmallScreen ? true : isGridView" :farmersData="farmersData">
        <template #default="{ farmer, isGrid }">
          <Card
            :key="farmer.id"
            :class="[
              'group flex transition-all duration-300 rounded-lg border border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20',
              isGrid ? 'flex-col p-6 hover:shadow-lg' : 'flex-row items-center p-4',
            ]"
          >
            <div :class="isGrid ? 'flex justify-between w-full' : 'flex items-center gap-6 w-full'">
              <div
                :class="isGrid ? 'flex items-start gap-3' : 'flex items-center gap-4 min-w-[220px]'"
              >
                <RouterLink
                  :to="{ name: 'farmer-details', params: { id: farmer.id } }"
                  class="flex items-center gap-2 cursor-pointer group"
                  style="text-decoration: none"
                >
                  <User
                    class="h-5 w-5 text-primary mt-1 group-hover:text-blue-600 transition-colors"
                  />
                  <div>
                    <h3 class="text-xl font-bold text-primary group-hover:underline">
                      {{ farmer.name }}
                    </h3>
                    <div class="flex items-center gap-2 mt-1">
                      <FileText class="h-4 w-4 text-blue-500" />
                      <p class="text-sm text-muted-foreground">
                        RSBSA:
                        <span class="font-medium text-foreground">
                          {{ farmer.rsbsa || 'Not available' }}
                        </span>
                      </p>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-4">
              <Building2 class="h-4 w-4 text-purple-500" />
              <p class="text-sm">
                <span class="text-muted-foreground">Association:</span>
                <span class="font-medium ml-1">
                  {{ farmer.association?.name || 'Not assigned' }}
                </span>
              </p>
            </div>
          </Card>
        </template>
      </FarmerCardList>

      <div class="text-center mt-6">
        <Button
          v-if="hasNextPage && !isFetchingNextPage"
          @click="fetchNextPage"
          variant="default"
          class="gap-2"
        >
          <span>Load More</span>
          <Users2 class="h-4 w-4" />
        </Button>
        <div v-else-if="isFetchingNextPage" class="text-muted-foreground italic">
          Loading more...
        </div>
      </div>
    </div>

    <!-- Add Farmer Dialog -->
    <Dialog :open="showAddFarmerDialog" @update:open="showAddFarmerDialog = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-lg font-semibold text-primary">
            <User class="h-5 w-5" />
            Add Farmer
          </DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4 md:grid-cols-2">
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-muted-foreground">Name</label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Enter farmer name"
              :class="[
                'border-muted focus:ring-primary rounded-lg',
                formErrors.name ? 'border-destructive' : '',
              ]"
            />
            <p v-if="formErrors.name" class="text-xs text-destructive">{{ formErrors.name[0] }}</p>
          </div>
          <div class="space-y-2">
            <label for="gender" class="block text-sm font-medium text-muted-foreground"
              >Gender</label
            >
            <Select v-model="formData.gender">
              <SelectTrigger
                :class="[
                  'w-full border-muted focus:ring-primary rounded-lg',
                  formErrors.gender ? 'border-destructive' : '',
                ]"
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="formErrors.gender" class="text-xs text-destructive">
              {{ formErrors.gender[0] }}
            </p>
          </div>
          <div class="space-y-2">
            <label for="rsbsa" class="block text-sm font-medium text-muted-foreground">RSBSA</label>
            <Input
              id="rsbsa"
              v-model="formData.rsbsa"
              placeholder="Enter RSBSA number"
              :class="[
                'border-muted focus:ring-primary rounded-lg',
                formErrors.rsbsa ? 'border-destructive' : '',
              ]"
            />
            <p v-if="formErrors.rsbsa" class="text-xs text-destructive">
              {{ formErrors.rsbsa[0] }}
            </p>
          </div>
          <div class="space-y-2">
            <label for="landsize" class="block text-sm font-medium text-muted-foreground"
              >Land Size (hectares)</label
            >
            <Input
              id="landsize"
              v-model="formData.landsize"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter land size"
              :class="[
                'border-muted focus:ring-primary rounded-lg',
                formErrors.landsize ? 'border-destructive' : '',
              ]"
            />
            <p v-if="formErrors.landsize" class="text-xs text-destructive">
              {{ formErrors.landsize[0] }}
            </p>
          </div>
          <div class="space-y-2">
            <label for="barangay" class="block text-sm font-medium text-muted-foreground"
              >Barangay</label
            >
            <Input
              id="barangay"
              v-model="formData.barangay"
              placeholder="Enter barangay"
              :class="[
                'border-muted focus:ring-primary rounded-lg',
                formErrors.barangay ? 'border-destructive' : '',
              ]"
            />
            <p v-if="formErrors.barangay" class="text-xs text-destructive">
              {{ formErrors.barangay[0] }}
            </p>
          </div>
          <div class="space-y-2">
            <label for="municipality" class="block text-sm font-medium text-muted-foreground"
              >Municipality</label
            >
            <Input
              id="municipality"
              v-model="formData.municipality"
              placeholder="Enter municipality"
              :class="[
                'border-muted focus:ring-primary rounded-lg',
                formErrors.municipality ? 'border-destructive' : '',
              ]"
            />
            <p v-if="formErrors.municipality" class="text-xs text-destructive">
              {{ formErrors.municipality[0] }}
            </p>
          </div>
          <div class="space-y-2">
            <label for="association" class="block text-sm font-medium text-muted-foreground"
              >Association</label
            >
            <Select v-model="formData.association_id">
              <SelectTrigger
                :class="[
                  'w-full border-muted focus:ring-primary rounded-lg',
                  formErrors.association_id ? 'border-destructive' : '',
                ]"
              >
                <SelectValue placeholder="Select association" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="assoc in associationsData" :key="assoc.id" :value="assoc.id">
                  {{ assoc.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="formErrors.association_id" class="text-xs text-destructive">
              {{ formErrors.association_id[0] }}
            </p>
          </div>
          <div v-if="authStore.hasRole('admin')" class="space-y-2">
            <label for="technician" class="block text-sm font-medium text-muted-foreground"
              >Assign Technician</label
            >
            <Select v-model="formData.technician_id">
              <SelectTrigger
                :class="[
                  'w-full border-muted focus:ring-primary rounded-lg',
                  formErrors.technician_id ? 'border-destructive' : '',
                ]"
              >
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="tech in technicians" :key="tech.id" :value="tech.id">
                  {{ tech.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="formErrors.technician_id" class="text-xs text-destructive">
              {{ formErrors.technician_id[0] }}
            </p>
          </div>
        </div>
        <DialogFooter class="mt-6">
          <Button variant="ghost" @click="resetForm" class="rounded-lg">Cancel</Button>
          <Button
            @click="createFarmer"
            :disabled="isCreatingFarmer"
            class="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-md"
          >
            <template v-if="isCreatingFarmer">Creating...</template>
            <template v-else>Create Farmer</template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
