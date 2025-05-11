<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
import { ArrowLeftIcon, XIcon, SaveIcon, MapPinIcon, RefreshCwIcon } from 'lucide-vue-next'
import axiosInstance from '@/lib/axios'
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/vue-query'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { useUtilsStore } from '@/stores/utils'

// Fix Leaflet's default icon path issues
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })
}

const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const queryClient = useQueryClient()
const utils = useUtilsStore()

const plantingId = route.params.id

// Form errors and data
const formErrors = ref({})
const markerLatLng = ref(null)

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

// Farmer search state
const farmerSearch = ref('')
const farmerSearchInput = ref('')

// Debounced search
const setFarmerSearch = utils.debounce(
  (val) => {
    farmerSearch.value = val
  },
  400,
  'farmer-search',
)

// Data fetching and state management
const { data: planting, isLoading: isLoadingPlanting } = useQuery({
  queryKey: ['planting', plantingId],
  queryFn: async () => {
    const response = await axiosInstance.get(`/api/crop-plantings/${plantingId}`)
    return response.data.data
  },
})

// Watch planting data changes to initialize form
watch(
  () => planting.value,
  (newPlanting) => {
    if (newPlanting) {
      formData.value = {
        farmer_id: newPlanting.farmer_id,
        category_id: newPlanting.category_id,
        crop_id: newPlanting.crop_id,
        variety_id: newPlanting.variety_id,
        planting_date: newPlanting.planting_date,
        area_planted: newPlanting.area_planted.toString(),
        quantity: newPlanting.quantity.toString(),
        expenses: newPlanting.expenses?.toString() || '',
        remarks: newPlanting.remarks || '',
        status: newPlanting.status,
        latitude: newPlanting.latitude?.toString() || '',
        longitude: newPlanting.longitude?.toString() || '',
        municipality: newPlanting.municipality || '',
        barangay: newPlanting.barangay || '',
        hvc_classification: newPlanting.hvc_detail?.classification || '',
        rice_classification: newPlanting.rice_detail?.classification || '',
        water_supply: newPlanting.rice_detail?.water_supply || '',
        land_type: newPlanting.rice_detail?.land_type || '',
      }

      // Update marker position if coordinates exist
      if (newPlanting.latitude && newPlanting.longitude) {
        markerLatLng.value = [parseFloat(newPlanting.latitude), parseFloat(newPlanting.longitude)]
      }
    }
  },
  { immediate: true },
)

// Update infinite query to use search
const {
  data: farmersData,
  fetchNextPage: fetchNextFarmers,
  hasNextPage: hasMoreFarmers,
  isFetchingNextPage: isLoadingMoreFarmers,
  refetch: refetchFarmers,
} = useInfiniteQuery({
  queryKey: computed(() => ['farmers-infinite', farmerSearch.value]),
  queryFn: async ({ pageParam = 0 }) => {
    const response = await axiosInstance.get('/api/farmers', {
      params: { cursor: pageParam, search: farmerSearch.value },
    })
    return response.data
  },
  getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
})

// Computed property to flatten farmers pages into a single array
const allFarmers = computed(() => {
  if (!farmersData.value) return []
  return farmersData.value.pages.flatMap((page) => page.data)
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

// Watch category_id changes to reset dependent fields
watch(
  () => formData.value.category_id,
  () => {
    // Only reset crop and variety IDs when category changes
    formData.value.crop_id = ''
    formData.value.variety_id = ''
    // Reset category-specific fields
    formData.value.hvc_classification = ''
    formData.value.rice_classification = ''
    formData.value.water_supply = ''
    formData.value.land_type = ''
    // Invalidate crops query for the new category
    queryClient.invalidateQueries(['crops', formData.value.category_id])
  },
)

// Status options
const statusOptions = [
  { value: 'standing', label: 'Standing' },
  { value: 'harvest', label: 'Ready for Harvest' },
  { value: 'partially harvested', label: 'Partially Harvested' },
  { value: 'harvested', label: 'Harvested' },
]

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
    router.push({ name: 'crop-planting-details', params: { id: plantingId } })
  },
  onError: (error) => {
    if (error.response?.data?.errors) {
      formErrors.value = error.response.data.errors
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update crop planting record.',
      })
    }
  },
})

// Form submission handler
const handleSubmit = () => {
  const submitData = {
    ...formData.value,
    area_planted: parseFloat(formData.value.area_planted),
    quantity: parseFloat(formData.value.quantity),
    expenses: formData.value.expenses ? parseFloat(formData.value.expenses) : null,
    latitude: parseFloat(formData.value.latitude),
    longitude: parseFloat(formData.value.longitude),
  }

  updatePlanting(submitData)
}

// Map-related data and methods
const zoom = ref(13)
const center = computed(() => {
  if (formData.value?.latitude && formData.value?.longitude) {
    return [parseFloat(formData.value.latitude), parseFloat(formData.value.longitude)]
  }
  return [13.4417, 121.9032] // Default center (Marinduque)
})

const handleMapClick = async (event) => {
  const { lat, lng } = event.latlng
  formData.value.latitude = lat.toString()
  formData.value.longitude = lng.toString()
  markerLatLng.value = [lat, lng]
  await fetchLocationDetails(lat, lng)
}

const getCurrentLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        formData.value.latitude = position.coords.latitude.toString()
        formData.value.longitude = position.coords.longitude.toString()
        markerLatLng.value = [position.coords.latitude, position.coords.longitude]
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

const fetchLocationDetails = async (lat, lng) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
      },
    })

    const address = response.data.address
    formData.value.municipality = address.city || address.town || address.village || ''
    formData.value.barangay = address.suburb || address.neighbourhood || ''
  } catch (error) {
    console.error('Failed to fetch location details:', error)
  }
}

const resetMap = () => {
  if (planting.value) {
    formData.value.latitude = planting.value.latitude.toString()
    formData.value.longitude = planting.value.longitude.toString()
    formData.value.municipality = planting.value.municipality
    formData.value.barangay = planting.value.barangay
    markerLatLng.value = [parseFloat(planting.value.latitude), parseFloat(planting.value.longitude)]
  }
}

const handleMarkerDrag = async (event) => {
  const { lat, lng } = event.target.getLatLng()
  formData.value.latitude = lat.toString()
  formData.value.longitude = lng.toString()
  await fetchLocationDetails(lat, lng)
}

// Handle farmer select scroll for infinite loading
const handleFarmerSelectScroll = (e) => {
  const target = e.target
  if (
    target.scrollHeight - target.scrollTop <= target.clientHeight + 50 &&
    hasMoreFarmers.value &&
    !isLoadingMoreFarmers.value
  ) {
    fetchNextFarmers()
  }
}

onMounted(() => {
  fixLeafletIcon()
})
</script>

<template>
  <!-- Sticky Header -->
  <div class="flex items-center">
    <div class="flex items-center gap-4 flex-1">
      <Button @click="router.back()" variant="ghost" size="icon" class="rounded-full">
        <ArrowLeftIcon class="h-5 w-5" />
      </Button>
      <h1 class="text-xl font-semibold">Edit Crop Planting</h1>
    </div>
  </div>

  <div class="">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information Section -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Wheat class="w-5 h-5 text-primary" />
            Basic Information
          </CardTitle>
          <p class="text-sm text-muted-foreground">
            Update the farmer and crop details for this planting
          </p>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Farmer and Crop Selection -->
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-medium text-muted-foreground">Farmer</label>
                <Select
                  v-model="formData.farmer_id"
                  :class="{ 'border-destructive': formErrors.farmer_id }"
                  @scroll="handleFarmerSelectScroll"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    <div class="px-2 py-2">
                      <Input
                        :model-value="farmerSearchInput"
                        @update:model-value="
                          (val) => {
                            farmerSearchInput = val
                            setFarmerSearch(val)
                          }
                        "
                        placeholder="Search farmer by name..."
                        class="w-full mb-2"
                        @keydown.stop
                      />
                    </div>
                    <div
                      v-if="farmerSearchInput && (isLoadingMoreFarmers || !farmersData)"
                      class="p-2 text-sm text-muted-foreground text-center"
                    >
                      Searching...
                    </div>
                    <template
                      v-if="
                        allFarmers.length > 0 &&
                        !(farmerSearchInput && (isLoadingMoreFarmers || !farmersData))
                      "
                    >
                      <SelectItem v-for="farmer in allFarmers" :key="farmer.id" :value="farmer.id">
                        {{ farmer.name }}
                      </SelectItem>
                    </template>
                    <div
                      v-if="
                        hasMoreFarmers &&
                        !(farmerSearchInput && (isLoadingMoreFarmers || !farmersData))
                      "
                      class="py-2 px-2 text-sm text-center text-muted-foreground"
                    >
                      <span v-if="isLoadingMoreFarmers">Loading more farmers...</span>
                      <button
                        v-else
                        @click="fetchNextFarmers()"
                        class="text-primary hover:underline focus:outline-none"
                      >
                        Load more farmers
                      </button>
                    </div>
                  </SelectContent>
                </Select>
                <p v-if="formErrors.farmer_id" class="text-sm text-destructive mt-1">
                  {{ formErrors.farmer_id[0] }}
                </p>
              </div>

              <div class="space-y-2">
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

              <div class="space-y-2">
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

              <div class="space-y-2">
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

              <div class="space-y-2">
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

            <!-- Details and Location -->
            <div class="space-y-6">
              <div class="space-y-2">
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

              <div class="space-y-2">
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

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
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

                <div class="space-y-2">
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
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-muted-foreground">Remarks</label>
                <Input
                  v-model="formData.remarks"
                  placeholder="Optional notes about this planting"
                  :class="{ 'border-destructive': formErrors.remarks }"
                />
                <p v-if="formErrors.remarks" class="text-sm text-destructive mt-1">
                  {{ formErrors.remarks[0] }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Category Specific Details - Conditional Rendering -->
      <Card v-if="selectedCategory === 'High Value' || selectedCategory === 'Rice'">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <LayersIcon class="w-5 h-5 text-primary" />
            {{ selectedCategory }} Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="selectedCategory === 'High Value'" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">HVC Classification</label>
              <Input
                v-model="formData.hvc_classification"
                placeholder="Enter HVC classification"
                :class="{ 'border-destructive': formErrors.hvc_classification }"
              />
              <p v-if="formErrors.hvc_classification" class="text-sm text-destructive mt-1">
                {{ formErrors.hvc_classification[0] }}
              </p>
            </div>
          </div>

          <div v-if="selectedCategory === 'Rice'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Rice Classification</label>
              <Input
                v-model="formData.rice_classification"
                placeholder="Enter rice classification"
                :class="{ 'border-destructive': formErrors.rice_classification }"
              />
              <p v-if="formErrors.rice_classification" class="text-sm text-destructive mt-1">
                {{ formErrors.rice_classification[0] }}
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Water Supply</label>
              <Input
                v-model="formData.water_supply"
                placeholder="Enter water supply"
                :class="{ 'border-destructive': formErrors.water_supply }"
              />
              <p v-if="formErrors.water_supply" class="text-sm text-destructive mt-1">
                {{ formErrors.water_supply[0] }}
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted-foreground">Land Type</label>
              <Input
                v-model="formData.land_type"
                placeholder="Enter land type"
                :class="{ 'border-destructive': formErrors.land_type }"
              />
              <p v-if="formErrors.land_type" class="text-sm text-destructive mt-1">
                {{ formErrors.land_type[0] }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Location Section -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <MapPinIcon class="w-5 h-5 text-primary" />
            Location Details
          </CardTitle>
          <p class="text-sm text-muted-foreground">
            Click on the map or use current location to set coordinates
          </p>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Coordinates and Address -->
            <div class="space-y-6">
              <div class="flex items-end gap-4">
                <div class="flex-1 space-y-2">
                  <label class="text-sm font-medium text-muted-foreground">Latitude</label>
                  <Input
                    v-model="formData.latitude"
                    type="text"
                    readonly
                    :class="{ 'border-destructive': formErrors.latitude }"
                  />
                </div>
                <div class="flex-1 space-y-2">
                  <label class="text-sm font-medium text-muted-foreground">Longitude</label>
                  <Input
                    v-model="formData.longitude"
                    type="text"
                    readonly
                    :class="{ 'border-destructive': formErrors.longitude }"
                  />
                </div>
              </div>

              <div class="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  @click="getCurrentLocation"
                  class="flex-1 gap-2"
                >
                  <MapPinIcon class="h-4 w-4" />
                  Use Current Location
                </Button>
                <Button type="button" variant="outline" @click="resetMap" class="flex-1 gap-2">
                  <RefreshCwIcon class="h-4 w-4" />
                  Reset Location
                </Button>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-muted-foreground">Municipality</label>
                  <Input
                    v-model="formData.municipality"
                    readonly
                    :class="{ 'border-destructive': formErrors.municipality }"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-muted-foreground">Barangay</label>
                  <Input
                    v-model="formData.barangay"
                    placeholder="Enter barangay"
                    :class="{ 'border-destructive': formErrors.barangay }"
                  />
                  <p class="text-xs text-muted-foreground">You can edit the barangay if needed</p>
                </div>
              </div>
            </div>

            <!-- Map -->
            <div class="relative min-h-[400px] rounded-lg border overflow-hidden">
              <l-map
                ref="map"
                v-model:zoom="zoom"
                :center="center"
                @click="handleMapClick"
                class="h-[400px] w-full z-0"
              >
                <l-tile-layer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  layer-type="base"
                  name="OpenStreetMap"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                <l-marker
                  v-if="markerLatLng"
                  :lat-lng="markerLatLng"
                  :draggable="true"
                  @dragend="handleMarkerDrag"
                />
              </l-map>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Submit Button -->
      <div class="flex justify-end pb-8">
        <Button type="submit" :disabled="isUpdating" class="gap-2 w-full md:w-auto">
          <SaveIcon class="h-4 w-4" />
          {{ isUpdating ? 'Saving Changes...' : 'Save Changes' }}
        </Button>
      </div>
    </form>
  </div>
</template>
