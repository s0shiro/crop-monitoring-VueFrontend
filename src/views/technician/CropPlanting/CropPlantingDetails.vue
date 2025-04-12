<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  PencilIcon,
  SaveIcon,
  XIcon,
  Trash2Icon,
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  Wheat,
  UsersIcon,
  Loader2Icon,
} from 'lucide-vue-next'
import { format } from 'date-fns'
import axiosInstance from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const queryClient = useQueryClient()

const plantingId = route.params.id
const isEditing = ref(false)
const showDeleteDialog = ref(false)

// Form data
const formData = ref({
  farmer_id: '',
  category_id: '',
  crop_id: '',
  variety_id: '',
  planting_date: '',
  area_planted: '',
  quantity: '',
  expenses: '',
  remarks: '',
  status: '',
  latitude: '',
  longitude: '',
  municipality: '',
  barangay: '',
  // Category-specific fields
  hvc_classification: '',
  rice_classification: '',
  water_supply: '',
  land_type: '',
})

// Initialize form data when planting data is available
const initializeFormData = (plantingData) => {
  if (plantingData) {
    formData.value = {
      farmer_id: plantingData.farmer_id,
      category_id: plantingData.category_id,
      crop_id: plantingData.crop_id,
      variety_id: plantingData.variety_id,
      planting_date: plantingData.planting_date,
      area_planted: plantingData.area_planted.toString(),
      quantity: plantingData.quantity.toString(),
      expenses: plantingData.expenses?.toString() || '',
      remarks: plantingData.remarks,
      status: plantingData.status,
      latitude: plantingData.latitude.toString(),
      longitude: plantingData.longitude.toString(),
      municipality: plantingData.municipality,
      barangay: plantingData.barangay,
      // Category-specific fields
      hvc_classification: plantingData.hvc_detail?.classification || '',
      rice_classification: plantingData.rice_detail?.classification || '',
      water_supply: plantingData.rice_detail?.water_supply || '',
      land_type: plantingData.rice_detail?.land_type || '',
    }
  }
}

const startEditing = () => {
  initializeFormData(planting.value)
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  initializeFormData(planting.value)
}

// Fetch planting details
const { data: planting, isLoading: isLoadingPlanting } = useQuery({
  queryKey: ['planting', plantingId],
  queryFn: async () => {
    const response = await axiosInstance.get(`/api/crop-plantings/${plantingId}`)
    const data = response.data.data
    initializeFormData(data)
    return data
  },
})

// Fetch farmers for dropdown
const { data: farmers } = useQuery({
  queryKey: ['farmers'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/farmers')
    return response.data.data
  },
})

// Fetch categories for dropdown
const { data: categories } = useQuery({
  queryKey: ['categories'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/categories')
    return response.data
  },
})

// Fetch crops when category is selected
const { data: crops } = useQuery({
  queryKey: ['crops', formData.value.category_id],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/crops/by-category', {
      params: { category_id: formData.value.category_id },
    })
    return response.data.data
  },
  enabled: computed(() => !!formData.value.category_id),
})

// Fetch varieties when crop is selected
const { data: varieties } = useQuery({
  queryKey: ['varieties', formData.value.crop_id],
  queryFn: async () => {
    const response = await axiosInstance.get(`/api/crops/${formData.value.crop_id}/varieties`)
    return response.data.data
  },
  enabled: computed(() => !!formData.value.crop_id),
})

// Update planting mutation
const { mutate: updatePlanting, isPending: isUpdating } = useMutation({
  mutationFn: async (updateData) => {
    const response = await axiosInstance.put(`/api/crop-plantings/${plantingId}`, updateData)
    return response.data
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Crop planting record updated successfully.',
    })
    isEditing.value = false
    queryClient.invalidateQueries({ queryKey: ['planting', plantingId] })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to update crop planting record.',
    })
  },
})

// Delete planting mutation
const { mutate: deletePlanting, isPending: isDeleting } = useMutation({
  mutationFn: async () => {
    return await axiosInstance.delete(`/api/crop-plantings/${plantingId}`)
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Crop planting record deleted successfully.',
    })
    router.push({ name: 'crop-planting-management' })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete crop planting record.',
    })
  },
})

const handleUpdate = () => {
  const updateData = {
    ...formData.value,
    area_planted: parseFloat(formData.value.area_planted),
    quantity: parseFloat(formData.value.quantity),
    expenses: formData.value.expenses ? parseFloat(formData.value.expenses) : null,
    latitude: parseFloat(formData.value.latitude),
    longitude: parseFloat(formData.value.longitude),
  }
  updatePlanting(updateData)
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const handleDelete = () => {
  deletePlanting()
}

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

// Available status options
const statusOptions = [
  { value: 'standing', label: 'Standing' },
  { value: 'harvest', label: 'Ready for Harvest' },
  { value: 'partially harvested', label: 'Partially Harvested' },
  { value: 'harvested', label: 'Harvested' },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <Button @click="router.back()" variant="ghost" class="rounded-full">
          <ArrowLeftIcon class="w-4 h-4" />
        </Button>
        <h1 class="text-3xl font-extrabold tracking-tight">Crop Planting Details</h1>
      </div>
      <div class="flex items-center gap-2">
        <Button @click="startEditing" variant="outline" class="gap-2" v-if="!isEditing">
          <PencilIcon class="w-4 h-4" />
          Edit Details
        </Button>
        <Button @click="confirmDelete" variant="destructive" :disabled="isDeleting" class="gap-2">
          <Trash2Icon class="w-4 h-4" />
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingPlanting" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-2">
        <Loader2Icon class="w-8 h-8 animate-spin text-primary" />
        <p class="text-muted-foreground">Loading planting details...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="planting" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Edit Mode -->
      <Card v-if="isEditing" class="lg:col-span-3">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <PencilIcon class="w-5 h-5 text-primary" />
            Edit Planting Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Farmer</label>
                <Select v-model="formData.farmer_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="farmer in farmers" :key="farmer.id" :value="farmer.id">
                      {{ farmer.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Category</label>
                <Select v-model="formData.category_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="category in categories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Crop</label>
                <Select v-model="formData.crop_id" :disabled="!formData.category_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="crop in crops" :key="crop.id" :value="crop.id">
                      {{ crop.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Variety</label>
                <Select v-model="formData.variety_id" :disabled="!formData.crop_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select variety" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="variety in varieties" :key="variety.id" :value="variety.id">
                      {{ variety.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Status</label>
                <Select v-model="formData.status">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="status in statusOptions"
                      :key="status.value"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Details and Location -->
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Planting Date</label>
                <Input v-model="formData.planting_date" type="date" />
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Area Planted (ha)</label>
                <Input v-model="formData.area_planted" type="number" step="0.01" min="0" />
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Quantity</label>
                <Input v-model="formData.quantity" type="number" step="0.01" min="0" />
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Expenses</label>
                <Input v-model="formData.expenses" type="number" step="0.01" min="0" />
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Remarks</label>
                <Input v-model="formData.remarks" />
              </div>
            </div>

            <!-- Location Information -->
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Latitude</label>
                <Input v-model="formData.latitude" type="number" step="0.000001" />
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Longitude</label>
                <Input v-model="formData.longitude" type="number" step="0.000001" />
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Municipality</label>
                <Input v-model="formData.municipality" />
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Barangay</label>
                <Input v-model="formData.barangay" />
              </div>
            </div>

            <!-- Category Specific Details -->
            <div v-if="planting.category.name === 'High Value'" class="space-y-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">HVC Classification</label>
                <Input v-model="formData.hvc_classification" />
              </div>
            </div>

            <div v-if="planting.category.name === 'Rice'" class="space-y-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Rice Classification</label>
                <Input v-model="formData.rice_classification" />
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Water Supply</label>
                <Input v-model="formData.water_supply" />
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Land Type</label>
                <Input v-model="formData.land_type" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-8">
            <Button variant="ghost" @click="cancelEditing" class="gap-2">
              <XIcon class="w-4 h-4" />
              Cancel
            </Button>
            <Button @click="handleUpdate" :disabled="isUpdating" variant="default" class="gap-2">
              <SaveIcon class="w-4 h-4" />
              {{ isUpdating ? 'Updating...' : 'Save Changes' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- View Mode -->
      <template v-else>
        <!-- Basic Information -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <Wheat class="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Status</p>
              <div
                :class="[
                  getStatusColor(planting.status),
                  'px-2 py-1 rounded-full text-white text-sm font-medium inline-block mt-1',
                ]"
              >
                {{ planting.status }}
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Farmer</p>
              <p class="text-lg font-medium mt-1">{{ planting.farmer.name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Crop</p>
              <p class="text-lg mt-1">{{ planting.crop.name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Variety</p>
              <p class="text-lg mt-1">{{ planting.variety.name }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Location Details -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <MapPinIcon class="w-5 h-5 text-primary" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Coordinates</p>
              <p class="text-lg mt-1">{{ planting.latitude }}, {{ planting.longitude }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Barangay</p>
              <p class="text-lg mt-1">{{ planting.barangay }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Municipality</p>
              <p class="text-lg mt-1">{{ planting.municipality }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Planting Details -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <CalendarIcon class="w-5 h-5 text-primary" />
              Planting Details
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Planting Date</p>
              <p class="text-lg mt-1">
                {{ format(new Date(planting.planting_date), 'MMMM d, yyyy') }}
              </p>
            </div>
            <div v-if="planting.expected_harvest_date">
              <p class="text-sm font-medium text-muted-foreground">Expected Harvest Date</p>
              <p class="text-lg mt-1">
                {{ format(new Date(planting.expected_harvest_date), 'MMMM d, yyyy') }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Area Planted</p>
              <p class="text-lg mt-1">{{ planting.area_planted }} hectares</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Quantity</p>
              <p class="text-lg mt-1">{{ planting.quantity }}</p>
            </div>
            <div v-if="planting.expenses">
              <p class="text-sm font-medium text-muted-foreground">Expenses</p>
              <p class="text-lg mt-1">₱{{ planting.expenses.toLocaleString() }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Category Specific Details -->
        <Card v-if="planting.hvc_detail || planting.rice_detail" class="lg:col-span-3">
          <CardHeader>
            <CardTitle class="text-lg">Additional Details</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <template v-if="planting.hvc_detail">
              <div>
                <p class="text-sm font-medium text-muted-foreground">HVC Classification</p>
                <p class="text-lg mt-1">{{ planting.hvc_detail.classification }}</p>
              </div>
            </template>
            <template v-if="planting.rice_detail">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Rice Classification</p>
                  <p class="text-lg mt-1">{{ planting.rice_detail.classification }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Water Supply</p>
                  <p class="text-lg mt-1">{{ planting.rice_detail.water_supply }}</p>
                </div>
                <div v-if="planting.rice_detail.land_type">
                  <p class="text-sm font-medium text-muted-foreground">Land Type</p>
                  <p class="text-lg mt-1">{{ planting.rice_detail.land_type }}</p>
                </div>
              </div>
            </template>
          </CardContent>
        </Card>
      </template>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold">Delete Crop Planting</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            Are you sure you want to delete this crop planting record? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" @click="showDeleteDialog = false"> Cancel </Button>
          <Button variant="destructive" :disabled="isDeleting" @click="handleDelete">
            <Loader2Icon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
