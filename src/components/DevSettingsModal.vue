<script setup>
import { ref, watch, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axios'

const props = defineProps({
  open: Boolean,
})

const emit = defineEmits(['close'])
const { toast } = useToast()
const queryClient = useQueryClient()
const activeTab = ref('farmers')

// Form states for crop tab
const selectedCategoryForCrop = ref('')
const cropCount = ref(1)

// Form states for variety tab
const selectedCategoryForVariety = ref('')
const selectedCropForVariety = ref('')
const varietyCount = ref(1)

// Form states for planting tab
const selectedCategoryForPlanting = ref('')
const selectedCropForPlanting = ref('')
const selectedVarietyForPlanting = ref('')
const plantingCount = ref(1)

const remarksOptions = [
  'newly planted/seedling',
  'vegetative',
  'reproductive',
  'maturing',
]

const hvcClassificationOptions = [
  'lowland vegetable',
  'upland vegetable',
  'legumes',
  'spice',
  'rootcrop',
  'fruit',
]

const riceClassificationOptions = [
  'farmer saved seeds',
  'hybrid',
  'registered',
  'certified',
  'good quality',
]

const waterSupplyOptions = [
  'irrigated',
  'rainfed',
]

const landTypeOptions = [
  'lowland',
  'upland',
]

// Form states for other tabs
const farmerCount = ref(1)
const associationCount = ref(1)
const selectedAssociation = ref('')

// Fetch categories query
const { data: categories, isFetching: isLoadingCategories } = useQuery({
  queryKey: ['categories'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/categories')
    return response.data
  },
})

// Fetch associations for farmer creation
const { data: associations } = useQuery({
  queryKey: ['associations'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/associations')
    return response.data.data
  },
})

// Fetch crops when category is selected
const cropsQuery = computed(() => ['crops', selectedCategoryForCrop.value])
const { data: crops, isFetching: isLoadingCrops } = useQuery({
  queryKey: cropsQuery,
  queryFn: async () => {
    if (!selectedCategoryForCrop.value) return []
    const response = await axiosInstance.get('/api/crops/by-category', {
      params: { category_id: selectedCategoryForCrop.value },
    })
    return response.data.data || []
  },
  enabled: computed(() => !!selectedCategoryForCrop.value),
})

// Crops query for varieties tab
const cropsQueryForVariety = computed(() => ['crops', selectedCategoryForVariety.value])
const { data: cropsForVariety, isFetching: isLoadingCropsForVariety } = useQuery({
  queryKey: cropsQueryForVariety,
  queryFn: async () => {
    if (!selectedCategoryForVariety.value) return []
    const response = await axiosInstance.get('/api/crops/by-category', {
      params: { category_id: selectedCategoryForVariety.value },
    })
    return response.data.data || []
  },
  enabled: computed(() => !!selectedCategoryForVariety.value),
})

// Crops query for planting tab
const cropsQueryForPlanting = computed(() => ['crops', selectedCategoryForPlanting.value])
const { data: cropsForPlanting, isFetching: isLoadingCropsForPlanting } = useQuery({
  queryKey: cropsQueryForPlanting,
  queryFn: async () => {
    if (!selectedCategoryForPlanting.value) return []
    const response = await axiosInstance.get('/api/crops/by-category', {
      params: { category_id: selectedCategoryForPlanting.value },
    })
    return response.data.data || []
  },
  enabled: computed(() => !!selectedCategoryForPlanting.value),
})

// Fetch varieties when crop is selected
const varietiesQuery = computed(() => ['varieties', selectedCropForVariety.value])
const { data: varieties, isFetching: isLoadingVarieties } = useQuery({
  queryKey: varietiesQuery,
  queryFn: async () => {
    if (!selectedCropForVariety.value) return []
    const response = await axiosInstance.get(`/api/crops/${selectedCropForVariety.value}/varieties`)
    return response.data.data || []
  },
  enabled: computed(() => !!selectedCropForVariety.value),
})

// Varieties query for planting tab
const varietiesQueryForPlanting = computed(() => ['varieties', selectedCropForPlanting.value])
const { data: varietiesForPlanting, isFetching: isLoadingVarietiesForPlanting } = useQuery({
  queryKey: varietiesQueryForPlanting,
  queryFn: async () => {
    if (!selectedCropForPlanting.value) return []
    const response = await axiosInstance.get(
      `/api/crops/${selectedCropForPlanting.value}/varieties`,
    )
    return response.data.data || []
  },
  enabled: computed(() => !!selectedCropForPlanting.value),
})

// Create association mutation
const { mutate: createDevAssociation, isPending: isCreatingAssociation } = useMutation({
  mutationFn: async () => {
    const randomNum = Math.floor(Math.random() * 10000)
    const response = await axiosInstance.post('/api/associations', {
      name: `Test Association ${randomNum}`,
      description: `Test description for association ${randomNum}`,
    })
    return response.data
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['associations'])
    toast({
      title: 'Success',
      description: 'Test association created successfully',
    })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create test association',
    })
  },
})

// Create farmer mutation
const { mutate: createDevFarmer, isPending: isCreatingFarmer } = useMutation({
  mutationFn: async () => {
    const randomNum = Math.floor(Math.random() * 10000)
    const response = await axiosInstance.post('/api/farmers', {
      name: `Test Farmer ${randomNum}`,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      rsbsa: `RSBSA-${randomNum}`,
      landsize: (Math.random() * 10).toFixed(2),
      association_id: selectedAssociation.value || null,
      municipality: 'Test Municipality',
      barangay: 'Test Barangay',
      technician_id: 2, // Make sure this matches an existing technician ID
    })
    return response.data
  },
  onSuccess: () => {
    // queryClient.invalidateQueries(['farmers'])
    toast({
      title: 'Success',
      description: 'Test farmer created successfully',
    })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create test farmer',
    })
  },
})

// Create crop mutation
const { mutate: createDevCrop, isPending: isCreatingCrop } = useMutation({
  mutationFn: async () => {
    if (!selectedCategoryForCrop.value) {
      throw new Error('Please select a category first')
    }

    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    const categoryName = categories.value.find((c) => c.id === selectedCategoryForCrop.value)?.name

    const response = await axiosInstance.post('/api/crops', {
      name: `${categoryName} Test ${randomNum}`,
      category_id: selectedCategoryForCrop.value,
    })
    return { ...response.data, categoryName }
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries(['crops'])
    toast({
      title: 'Success',
      description: `Test crop created successfully under ${data.categoryName} category`,
    })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create test crop',
    })
  },
})

// Create variety mutation
const { mutate: createDevVariety, isPending: isCreatingVariety } = useMutation({
  mutationFn: async () => {
    if (!selectedCropForVariety.value) {
      throw new Error('Please select a crop first')
    }
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    const maturityDays = Math.floor(Math.random() * 60) + 30 // Random between 30-90 days
    const categoryName = categories.value.find(
      (c) => c.id === selectedCategoryForVariety.value,
    )?.name
    const cropName = cropsForVariety.value?.find((c) => c.id === selectedCropForVariety.value)?.name

    const response = await axiosInstance.post(
      `/api/crops/${selectedCropForVariety.value}/varieties`,
      {
        name: `${cropName} Variety ${randomNum}`,
        maturity_days: maturityDays,
      },
    )
    return { ...response.data, categoryName, cropName, maturityDays }
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries(['varieties'])
    toast({
      title: 'Success',
      description: `Test variety created successfully under ${data.categoryName} > ${data.cropName} (${data.maturityDays} days)`,
    })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create test variety',
    })
  },
})

// Create planting mutation
const { mutate: createDevPlanting, isPending: isCreatingPlanting } = useMutation({
  mutationFn: async () => {
    // First get a random farmer
    const farmersResponse = await axiosInstance.get('/api/farmers')
    const farmers = farmersResponse.data.data

    if (!farmers.length) {
      throw new Error('No farmers available. Create some farmers first.')
    }

    const randomFarmer = farmers[Math.floor(Math.random() * farmers.length)]
    const plantingDate = new Date()

    // Find the selected variety to get its maturity days
    const selectedVarietyData = varietiesForPlanting.value?.find(
      (v) => v.id === selectedVarietyForPlanting.value,
    )
    if (!selectedVarietyData) {
      throw new Error('Selected variety not found')
    }

    const expectedHarvestDate = new Date(plantingDate)
    expectedHarvestDate.setDate(
      expectedHarvestDate.getDate() + parseInt(selectedVarietyData.maturity_days),
    )

    // Get the category name to determine if it's rice or HVC
    const selectedCategory = categories.value?.find(
      (c) => c.id === selectedCategoryForPlanting.value,
    )
    if (!selectedCategory) {
      throw new Error('Selected category not found')
    }

    // Base planting data
    const plantingData = {
      farmer_id: randomFarmer.id,
      category_id: selectedCategoryForPlanting.value,
      crop_id: selectedCropForPlanting.value,
      variety_id: selectedVarietyForPlanting.value,
      planting_date: plantingDate.toISOString().split('T')[0],
      area_planted: (Math.random() * 5 + 0.5).toFixed(2),
      quantity: Math.floor(Math.random() * 1000) + 100,
      expenses: Math.floor(Math.random() * 10000) + 1000,
      remarks: remarksOptions[Math.floor(Math.random() * remarksOptions.length)],
      status: 'standing',
      municipality: randomFarmer.municipality,
      barangay: randomFarmer.barangay,
      technician_id: randomFarmer.technician_id,
      latitude: (13.4417 + (Math.random() - 0.5) * 0.1).toFixed(6),
      longitude: (121.9032 + (Math.random() - 0.5) * 0.1).toFixed(6),
    }

    // Add category-specific details based on the category name
    if (selectedCategory.name === 'Rice') {
      // Rice specific details
      plantingData.rice_classification = riceClassificationOptions[Math.floor(Math.random() * riceClassificationOptions.length)]
      plantingData.water_supply = waterSupplyOptions[Math.floor(Math.random() * waterSupplyOptions.length)]
      plantingData.land_type = landTypeOptions[Math.floor(Math.random() * landTypeOptions.length)]
    } else if (selectedCategory.name === 'High Value') {
      // HVC specific details
      plantingData.hvc_classification = hvcClassificationOptions[Math.floor(Math.random() * hvcClassificationOptions.length)]
    }

    const response = await axiosInstance.post('/api/crop-plantings', plantingData)
    return response.data
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['crop-plantings'])
    toast({
      title: 'Success',
      description: 'Test planting created successfully',
    })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create test planting',
    })
  },
})

// Add delay helper function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Handler functions
const handleCreateAssociations = async () => {
  try {
    for (let i = 0; i < associationCount.value; i++) {
      await createDevAssociation()
      // Add 500ms delay between requests if there are many items
      if (associationCount.value > 10) {
        await delay(500)
      }
    }
    toast({
      title: 'Success',
      description: `Created ${associationCount.value} associations successfully`,
    })
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to create all associations',
    })
  }
}

const handleCreateFarmers = async () => {
  try {
    for (let i = 0; i < farmerCount.value; i++) {
      await createDevFarmer()
      // Add 500ms delay between requests if there are many items
      if (farmerCount.value > 10) {
        await delay(500)
      }
    }
    toast({
      title: 'Success',
      description: `Created ${farmerCount.value} farmers successfully`,
    })
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to create all farmers',
    })
  }
}

const handleCreateCrops = async () => {
  if (!selectedCategoryForCrop.value) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Please select a category first',
    })
    return
  }

  try {
    for (let i = 0; i < cropCount.value; i++) {
      await createDevCrop()
      // Add 500ms delay between requests if there are many items
      if (cropCount.value > 10) {
        await delay(500)
      }
    }
    toast({
      title: 'Success',
      description: `Created ${cropCount.value} crops successfully`,
    })
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to create all crops',
    })
  }
}

const handleCreateVarieties = async () => {
  if (!selectedCropForVariety.value) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Please select a crop first',
    })
    return
  }

  try {
    for (let i = 0; i < varietyCount.value; i++) {
      await createDevVariety()
      // Add 500ms delay between requests if there are many items
      if (varietyCount.value > 10) {
        await delay(500)
      }
    }
    toast({
      title: 'Success',
      description: `Created ${varietyCount.value} varieties successfully`,
    })
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to create all varieties',
    })
  }
}

const handleCreatePlantings = async () => {
  if (
    !selectedCategoryForPlanting.value ||
    !selectedCropForPlanting.value ||
    !selectedVarietyForPlanting.value
  ) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Please select category, crop and variety',
    })
    return
  }

  try {
    for (let i = 0; i < plantingCount.value; i++) {
      await createDevPlanting()
      // Add 500ms delay between requests if there are many items
      if (plantingCount.value > 10) {
        await delay(500)
      }
    }
    toast({
      title: 'Success',
      description: `Created ${plantingCount.value} plantings successfully`,
    })
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to create all plantings',
    })
  }
}

// Watch category_id changes to reset dependent fields
watch(selectedCategoryForCrop, (newCategoryId) => {
  selectedCropForVariety.value = ''
  selectedVarietyForPlanting.value = ''
  // Invalidate and refetch crops query for the new category
  if (newCategoryId) {
    queryClient.invalidateQueries({ queryKey: cropsQuery.value })
  }
})

// Watch crop_id changes to reset and invalidate variety queries
watch(selectedCropForVariety, (newCropId) => {
  selectedVarietyForPlanting.value = ''
  // Invalidate and refetch varieties query for the new crop
  if (newCropId) {
    queryClient.invalidateQueries({ queryKey: varietiesQuery.value })
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('close')">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Developer Settings</DialogTitle>
        <DialogDescription>Quick actions for development and testing purposes</DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-5">
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="associations">Associations</TabsTrigger>
          <TabsTrigger value="crops">Crops</TabsTrigger>
          <TabsTrigger value="varieties">Varieties</TabsTrigger>
          <TabsTrigger value="plantings">Plantings</TabsTrigger>
        </TabsList>

        <!-- Associations Tab -->
        <TabsContent value="associations" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Number of Associations</label>
            <Input type="number" v-model="associationCount" min="1" max="50" />
          </div>
          <Button
            @click="handleCreateAssociations"
            class="w-full"
            :disabled="isCreatingAssociation"
          >
            {{ isCreatingAssociation ? 'Creating...' : 'Create Test Associations' }}
          </Button>
        </TabsContent>

        <!-- Farmers Tab -->
        <TabsContent value="farmers" class="space-y-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Number of Farmers</label>
              <Input type="number" v-model="farmerCount" min="1" max="50" />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Association (Optional)</label>
              <Select v-model="selectedAssociation">
                <SelectTrigger>
                  <SelectValue placeholder="Select association" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="association in associations"
                    :key="association.id"
                    :value="association.id"
                  >
                    {{ association.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button @click="handleCreateFarmers" class="w-full" :disabled="isCreatingFarmer">
            {{ isCreatingFarmer ? 'Creating...' : 'Create Test Farmers' }}
          </Button>
        </TabsContent>

        <!-- Crops Tab -->
        <TabsContent value="crops" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Category</label>
            <Select v-model="selectedCategoryForCrop">
              <SelectTrigger>
                <SelectValue
                  :placeholder="isLoadingCategories ? 'Loading categories...' : 'Select category'"
                />
              </SelectTrigger>
              <SelectContent>
                <div
                  v-if="isLoadingCategories"
                  class="p-2 text-sm text-muted-foreground text-center"
                >
                  Loading categories...
                </div>
                <SelectItem
                  v-else
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Number of Crops</label>
            <Input type="number" v-model="cropCount" min="1" max="50" />
          </div>
          <Button @click="handleCreateCrops" class="w-full" :disabled="isCreatingCrop">
            {{ isCreatingCrop ? 'Creating...' : 'Create Test Crops' }}
          </Button>
        </TabsContent>

        <!-- Varieties Tab -->
        <TabsContent value="varieties" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Category</label>
            <Select v-model="selectedCategoryForVariety">
              <SelectTrigger>
                <SelectValue
                  :placeholder="isLoadingCategories ? 'Loading categories...' : 'Select category'"
                />
              </SelectTrigger>
              <SelectContent>
                <div
                  v-if="isLoadingCategories"
                  class="p-2 text-sm text-muted-foreground text-center"
                >
                  Loading categories...
                </div>
                <SelectItem
                  v-else
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Crop</label>
            <Select
              v-model="selectedCropForVariety"
              :disabled="!selectedCategoryForVariety || isLoadingCropsForVariety"
            >
              <SelectTrigger>
                <SelectValue
                  :placeholder="isLoadingCropsForVariety ? 'Loading crops...' : 'Select crop'"
                />
              </SelectTrigger>
              <SelectContent>
                <div
                  v-if="isLoadingCropsForVariety"
                  class="p-2 text-sm text-muted-foreground text-center"
                >
                  Loading crops...
                </div>
                <SelectItem v-else v-for="crop in cropsForVariety" :key="crop.id" :value="crop.id">
                  {{ crop.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Number of Varieties</label>
            <Input type="number" v-model="varietyCount" min="1" max="50" />
          </div>
          <Button @click="handleCreateVarieties" class="w-full" :disabled="isCreatingVariety">
            {{ isCreatingVariety ? 'Creating...' : 'Create Test Varieties' }}
          </Button>
        </TabsContent>

        <!-- Plantings Tab -->
        <TabsContent value="plantings" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Category</label>
            <Select v-model="selectedCategoryForPlanting">
              <SelectTrigger>
                <SelectValue
                  :placeholder="isLoadingCategories ? 'Loading categories...' : 'Select category'"
                />
              </SelectTrigger>
              <SelectContent>
                <div
                  v-if="isLoadingCategories"
                  class="p-2 text-sm text-muted-foreground text-center"
                >
                  Loading categories...
                </div>
                <SelectItem
                  v-else
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Crop</label>
            <Select
              v-model="selectedCropForPlanting"
              :disabled="!selectedCategoryForPlanting || isLoadingCropsForPlanting"
            >
              <SelectTrigger>
                <SelectValue
                  :placeholder="isLoadingCropsForPlanting ? 'Loading crops...' : 'Select crop'"
                />
              </SelectTrigger>
              <SelectContent>
                <div
                  v-if="isLoadingCropsForPlanting"
                  class="p-2 text-sm text-muted-foreground text-center"
                >
                  Loading crops...
                </div>
                <SelectItem v-else v-for="crop in cropsForPlanting" :key="crop.id" :value="crop.id">
                  {{ crop.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Variety</label>
            <Select
              v-model="selectedVarietyForPlanting"
              :disabled="!selectedCropForPlanting || isLoadingVarietiesForPlanting"
            >
              <SelectTrigger>
                <SelectValue
                  :placeholder="
                    isLoadingVarietiesForPlanting ? 'Loading varieties...' : 'Select variety'
                  "
                />
              </SelectTrigger>
              <SelectContent>
                <div
                  v-if="isLoadingVarietiesForPlanting"
                  class="p-2 text-sm text-muted-foreground text-center"
                >
                  Loading varieties...
                </div>
                <SelectItem
                  v-else
                  v-for="variety in varietiesForPlanting"
                  :key="variety.id"
                  :value="variety.id"
                >
                  {{ variety.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Number of Plantings</label>
            <Input type="number" v-model="plantingCount" min="1" max="50" />
          </div>

          <Button @click="handleCreatePlantings" class="w-full" :disabled="isCreatingPlanting">
            {{ isCreatingPlanting ? 'Creating...' : 'Create Test Plantings' }}
          </Button>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
