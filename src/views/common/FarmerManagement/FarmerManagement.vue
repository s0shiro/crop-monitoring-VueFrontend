<script setup>
import { ref } from 'vue'
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
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import {
  MoreHorizontal,
  Users2,
  User,
  MapPin,
  Home,
  Building2,
  Ruler,
  FileText,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const showAddFarmerDialog = ref(false)
const name = ref('')
const gender = ref('')
const rsbsa = ref('')
const landsize = ref('')
const barangay = ref('')
const municipality = ref('')
const associationId = ref('')
const technicianId = ref('')
const formErrors = ref({})

const { toast } = useToast()
const authStore = useAuthStore()
const queryClient = useQueryClient()

// Fetch associations for the dropdown
const { data: associationsData, isLoading: isLoadingAssociations } = useQuery({
  queryKey: ['associations-dropdown'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/associations')
    return response.data.data // Access the data array from the new structure
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

// Fetch farmers with infinite scroll
const fetchFarmers = async ({ pageParam = 0 }) => {
  const response = await axiosInstance.get('/api/farmers', {
    params: { cursor: pageParam },
  })
  return response.data
}

const {
  data: farmersData,
  error: farmersError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading: isLoadingFarmers,
} = useInfiniteQuery({
  queryKey: ['farmers'],
  queryFn: fetchFarmers,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load farmers.',
    })
  },
})

// Create farmer mutation
const { mutate: createFarmerMutation, isPending: isCreatingFarmer } = useMutation({
  mutationFn: async (newFarmer) => {
    return await axiosInstance.post('/api/farmers', newFarmer)
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Farmer created successfully.',
    })
    resetForm()
    queryClient.invalidateQueries(['farmers'])
  },
  onError: (error) => {
    if (error.response?.data?.errors) {
      formErrors.value = error.response.data.errors
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create farmer.',
      })
    }
  },
})

const createFarmer = () => {
  const farmerData = {
    name: name.value,
    gender: gender.value,
    rsbsa: rsbsa.value,
    landsize: landsize.value ? parseFloat(landsize.value) : null,
    barangay: barangay.value,
    municipality: municipality.value,
    association_id: associationId.value || null,
  }

  // Add technician_id only if admin is creating the farmer
  if (authStore.hasRole('admin') && technicianId.value) {
    farmerData.technician_id = technicianId.value
  }

  createFarmerMutation(farmerData)
}

const resetForm = () => {
  name.value = ''
  gender.value = ''
  rsbsa.value = ''
  landsize.value = ''
  barangay.value = ''
  municipality.value = ''
  associationId.value = ''
  technicianId.value = ''
  formErrors.value = {}
  showAddFarmerDialog.value = false
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Users2 class="h-8 w-8 text-primary" />
        <h1 class="text-3xl font-extrabold text-primary">Farmer Management</h1>
      </div>
      <Button @click="showAddFarmerDialog = true" variant="default" class="gap-2">
        <User class="h-4 w-4" />
        Add Farmer
      </Button>
    </div>

    <Loading v-if="isLoadingFarmers">Loading farmers...</Loading>

    <div v-else-if="farmersError" class="text-center py-8 text-destructive">
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
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-for="page in farmersData.pages" :key="page.nextCursor">
          <Card
            v-for="farmer in page.data"
            :key="farmer.id"
            class="group flex flex-col p-6 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-primary/5"
          >
            <div class="flex justify-between w-full">
              <div class="flex items-start gap-3">
                <User class="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 class="text-xl font-bold text-primary">{{ farmer.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <FileText class="h-4 w-4 text-blue-500" />
                    <p class="text-sm text-muted-foreground">
                      RSBSA:
                      <span class="font-medium text-foreground">{{
                        farmer.rsbsa || 'Not available'
                      }}</span>
                    </p>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    class="p-2 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal class="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56">
                  <RouterLink :to="{ name: 'farmer-details', params: { id: farmer.id } }">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </RouterLink>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="flex items-center gap-2">
                <MapPin class="h-4 w-4 text-green-500" />
                <div class="text-sm">
                  <p class="text-muted-foreground">Barangay</p>
                  <p class="font-medium">{{ farmer.barangay }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Home class="h-4 w-4 text-orange-500" />
                <div class="text-sm">
                  <p class="text-muted-foreground">Municipality</p>
                  <p class="font-medium">{{ farmer.municipality }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 mt-4">
              <Building2 class="h-4 w-4 text-purple-500" />
              <p class="text-sm">
                <span class="text-muted-foreground">Association:</span>
                <span class="font-medium ml-1">{{
                  farmer.association?.name || 'Not assigned'
                }}</span>
              </p>
            </div>

            <div v-if="farmer.landsize" class="flex items-center gap-2 mt-2">
              <Ruler class="h-4 w-4 text-yellow-500" />
              <p class="text-sm">
                <span class="text-muted-foreground">Land Size:</span>
                <span class="font-medium ml-1">{{ farmer.landsize }} hectares</span>
              </p>
            </div>
          </Card>
        </template>
      </div>

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
              v-model="name"
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
            <Select v-model="gender">
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
              v-model="rsbsa"
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
              v-model="landsize"
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
              v-model="barangay"
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
              v-model="municipality"
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
            <Select v-model="associationId">
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
            <Select v-model="technicianId">
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
