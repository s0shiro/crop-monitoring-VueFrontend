<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
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
import { ArrowLeftIcon } from 'lucide-vue-next'
import axiosInstance from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

const router = useRouter()
const { toast } = useToast()
const queryClient = useQueryClient()

// Form errors
const formErrors = ref({})

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
  status: 'standing',
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

// Lifecycle hooks
onMounted(() => {
  // Initialize form data with default values
  formData.value = {
    farmer_id: '',
    category_id: '',
    crop_id: '',
    variety_id: '',
    planting_date: '',
    area_planted: '',
    quantity: '',
    expenses: '',
    remarks: '',
    status: 'standing',
    latitude: '',
    longitude: '',
    municipality: '',
    barangay: '',
    hvc_classification: '',
    rice_classification: '',
    water_supply: '',
    land_type: '',
  }
})

onBeforeUnmount(() => {
  // Clear form data and refs before unmounting
  formData.value = null
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

// Get selected category name
const selectedCategory = computed(() => {
  if (!categories?.value || !formData.value?.category_id) return null
  return categories.value.find((c) => c.id === formData.value?.category_id)?.name
})

// Fetch crops when category is selected
const { data: crops, isFetching: isLoadingCrops } = useQuery({
  queryKey: ['crops', formData.value?.category_id],
  queryFn: async () => {
    if (!formData.value?.category_id) return []
    const response = await axiosInstance.get('/api/crops/by-category', {
      params: { category_id: formData.value.category_id },
    })
    return response.data.data
  },
  enabled: computed(() => !!formData.value?.category_id),
  staleTime: 0, // Always fetch fresh data
  cacheTime: 0, // Don't cache the results
  refetchOnWindowFocus: false,
})

// Fetch varieties when crop is selected
const { data: varieties } = useQuery({
  queryKey: ['varieties', formData.value?.crop_id],
  queryFn: async () => {
    const response = await axiosInstance.get(`/api/crops/${formData.value?.crop_id}/varieties`)
    return response.data.data
  },
  enabled: computed(() => !!formData.value?.crop_id),
})

// Watch category_id changes to invalidate crops query
watch(
  () => formData.value.category_id,
  () => {
    // Reset dependent fields when category changes
    formData.value.crop_id = ''
    formData.value.variety_id = ''
    // Invalidate crops query for the new category
    queryClient.invalidateQueries(['crops', formData.value.category_id])
  },
)

// Status options
const statusOptions = [
  { value: 'standing', label: 'Standing' },
  { value: 'harvest', label: 'Ready for Harvest' },
  { value: 'harvested', label: 'Harvested' },
]

// Create planting mutation
const { mutate: createPlanting, isPending: isCreating } = useMutation({
  mutationFn: async (plantingData) => {
    const response = await axiosInstance.post('/api/crop-plantings', plantingData)
    return response.data
  },
  onSuccess: () => {
    formErrors.value = {}
    toast({
      title: 'Success',
      description: 'Crop planting record created successfully.',
    })
    router.push({ name: 'crop-planting-management' })
  },
  onError: (error) => {
    if (error.response?.data?.errors) {
      formErrors.value = error.response.data.errors
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create crop planting record.',
      })
    }
  },
})

// Form submission handler
const handleSubmit = () => {
  // Convert numeric strings to numbers
  const submitData = {
    ...formData.value,
    area_planted: parseFloat(formData.value.area_planted),
    quantity: parseFloat(formData.value.quantity),
    expenses: formData.value.expenses ? parseFloat(formData.value.expenses) : null,
    latitude: parseFloat(formData.value.latitude),
    longitude: parseFloat(formData.value.longitude),
  }

  createPlanting(submitData)
}

// Get current location
const getCurrentLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        formData.value.latitude = position.coords.latitude.toString()
        formData.value.longitude = position.coords.longitude.toString()
      },
      (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to get current location. Please enter coordinates manually.',
        })
      },
    )
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex items-center gap-4">
      <Button @click="router.back()" variant="ghost" class="rounded-full">
        <ArrowLeftIcon class="w-4 h-4" />
      </Button>
      <h1 class="text-3xl font-extrabold tracking-tight">New Crop Planting</h1>
    </div>

    <!-- Form -->
    <Card>
      <CardHeader>
        <CardTitle>Planting Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Farmer</label>
                <Select
                  v-model="formData.farmer_id"
                  :class="{ 'border-destructive': formErrors.farmer_id }"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="farmer in farmers" :key="farmer.id" :value="farmer.id">
                      {{ farmer.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="formErrors.farmer_id" class="text-sm text-destructive mt-1">
                  {{ formErrors.farmer_id[0] }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Category</label>
                <Select
                  v-model="formData.category_id"
                  :class="{ 'border-destructive': formErrors.category_id }"
                >
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
                <p v-if="formErrors.category_id" class="text-sm text-destructive mt-1">
                  {{ formErrors.category_id[0] }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Crop</label>
                <Select
                  v-model="formData.crop_id"
                  :disabled="!formData.category_id || isLoadingCrops"
                  :class="{ 'border-destructive': formErrors.crop_id }"
                >
                  <SelectTrigger>
                    <SelectValue
                      :placeholder="isLoadingCrops ? 'Loading crops...' : 'Select crop'"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <div
                      v-if="isLoadingCrops"
                      class="p-2 text-sm text-muted-foreground text-center"
                    >
                      Loading crops...
                    </div>
                    <SelectItem v-else v-for="crop in crops" :key="crop.id" :value="crop.id">
                      {{ crop.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="formErrors.crop_id" class="text-sm text-destructive mt-1">
                  {{ formErrors.crop_id[0] }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Variety</label>
                <Select
                  v-model="formData.variety_id"
                  :disabled="!formData.crop_id"
                  :class="{ 'border-destructive': formErrors.variety_id }"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variety" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="variety in varieties" :key="variety.id" :value="variety.id">
                      {{ variety.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="formErrors.variety_id" class="text-sm text-destructive mt-1">
                  {{ formErrors.variety_id[0] }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Status</label>
                <Select
                  v-model="formData.status"
                  :class="{ 'border-destructive': formErrors.status }"
                >
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
                <p v-if="formErrors.status" class="text-sm text-destructive mt-1">
                  {{ formErrors.status[0] }}
                </p>
              </div>
            </div>

            <!-- Details -->
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Planting Date</label>
                <Input
                  v-model="formData.planting_date"
                  type="date"
                  :class="{ 'border-destructive': formErrors.planting_date }"
                />
                <p v-if="formErrors.planting_date" class="text-sm text-destructive mt-1">
                  {{ formErrors.planting_date[0] }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Area Planted (ha)</label>
                <Input
                  v-model="formData.area_planted"
                  type="number"
                  step="0.01"
                  min="0"
                  :class="{ 'border-destructive': formErrors.area_planted }"
                />
                <p v-if="formErrors.area_planted" class="text-sm text-destructive mt-1">
                  {{ formErrors.area_planted[0] }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Quantity</label>
                <Input
                  v-model="formData.quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  :class="{ 'border-destructive': formErrors.quantity }"
                />
                <p v-if="formErrors.quantity" class="text-sm text-destructive mt-1">
                  {{ formErrors.quantity[0] }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Expenses</label>
                <Input
                  v-model="formData.expenses"
                  type="number"
                  step="0.01"
                  min="0"
                  :class="{ 'border-destructive': formErrors.expenses }"
                />
                <p v-if="formErrors.expenses" class="text-sm text-destructive mt-1">
                  {{ formErrors.expenses[0] }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-muted-foreground">Remarks</label>
                <Input
                  v-model="formData.remarks"
                  :class="{ 'border-destructive': formErrors.remarks }"
                />
                <p v-if="formErrors.remarks" class="text-sm text-destructive mt-1">
                  {{ formErrors.remarks[0] }}
                </p>
              </div>
            </div>
          </div>

          <!-- Location Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Location Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="flex items-end gap-4">
                  <div class="flex-1">
                    <label class="text-sm font-medium text-muted-foreground">Latitude</label>
                    <Input
                      v-model="formData.latitude"
                      type="number"
                      step="0.000001"
                      :class="{ 'border-destructive': formErrors.latitude }"
                    />
                    <p v-if="formErrors.latitude" class="text-sm text-destructive mt-1">
                      {{ formErrors.latitude[0] }}
                    </p>
                  </div>
                  <div class="flex-1">
                    <label class="text-sm font-medium text-muted-foreground">Longitude</label>
                    <Input
                      v-model="formData.longitude"
                      type="number"
                      step="0.000001"
                      :class="{ 'border-destructive': formErrors.longitude }"
                    />
                    <p v-if="formErrors.longitude" class="text-sm text-destructive mt-1">
                      {{ formErrors.longitude[0] }}
                    </p>
                  </div>
                  <Button type="button" variant="outline" @click="getCurrentLocation">
                    Get Current
                  </Button>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Municipality</label>
                  <Input
                    v-model="formData.municipality"
                    :class="{ 'border-destructive': formErrors.municipality }"
                  />
                  <p v-if="formErrors.municipality" class="text-sm text-destructive mt-1">
                    {{ formErrors.municipality[0] }}
                  </p>
                </div>

                <div>
                  <label class="text-sm font-medium text-muted-foreground">Barangay</label>
                  <Input
                    v-model="formData.barangay"
                    :class="{ 'border-destructive': formErrors.barangay }"
                  />
                  <p v-if="formErrors.barangay" class="text-sm text-destructive mt-1">
                    {{ formErrors.barangay[0] }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Specific Details -->
          <div v-if="selectedCategory === 'High Value'" class="space-y-4">
            <h3 class="text-lg font-semibold">HVC Details</h3>
            <div>
              <label class="text-sm font-medium text-muted-foreground">HVC Classification</label>
              <Input
                v-model="formData.hvc_classification"
                :class="{ 'border-destructive': formErrors.hvc_classification }"
              />
              <p v-if="formErrors.hvc_classification" class="text-sm text-destructive mt-1">
                {{ formErrors.hvc_classification[0] }}
              </p>
            </div>
          </div>

          <div v-if="selectedCategory === 'Rice'" class="space-y-4">
            <h3 class="text-lg font-semibold">Rice Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="text-sm font-medium text-muted-foreground">Rice Classification</label>
                <Input
                  v-model="formData.rice_classification"
                  :class="{ 'border-destructive': formErrors.rice_classification }"
                />
                <p v-if="formErrors.rice_classification" class="text-sm text-destructive mt-1">
                  {{ formErrors.rice_classification[0] }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Water Supply</label>
                <Input
                  v-model="formData.water_supply"
                  :class="{ 'border-destructive': formErrors.water_supply }"
                />
                <p v-if="formErrors.water_supply" class="text-sm text-destructive mt-1">
                  {{ formErrors.water_supply[0] }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-muted-foreground">Land Type</label>
                <Input
                  v-model="formData.land_type"
                  :class="{ 'border-destructive': formErrors.land_type }"
                />
                <p v-if="formErrors.land_type" class="text-sm text-destructive mt-1">
                  {{ formErrors.land_type[0] }}
                </p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <Button type="submit" :disabled="isCreating" class="gap-2">
              {{ isCreating ? 'Creating...' : 'Create Planting' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
