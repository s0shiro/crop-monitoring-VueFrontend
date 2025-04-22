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
import { Loader2, Users2, Building2, Sprout, Leaf, Flower2 } from 'lucide-vue-next'

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

const remarksOptions = ['newly planted/seedling', 'vegetative', 'reproductive', 'maturing']

const firstNames = [
  'Juan',
  'Maria',
  'Pedro',
  'Rosa',
  'Miguel',
  'Ana',
  'Jose',
  'Carmen',
  'Francisco',
  'Elena',
  'Antonio',
  'Lucia',
  'Manuel',
  'Sofia',
  'Ricardo',
  'Isabel',
  'Eduardo',
  'Teresa',
  'Carlos',
  'Beatriz',
]

const lastNames = [
  'Santos',
  'Reyes',
  'Cruz',
  'Garcia',
  'Torres',
  'Ramos',
  'Flores',
  'Mendoza',
  'Dela Cruz',
  'Gonzales',
  'Bautista',
  'Rodriguez',
  'Fernandez',
  'Lopez',
  'Perez',
  'Martinez',
  'Rivera',
  'Aquino',
  'Castro',
  'Morales',
]

const barangaysPerMunicipality = {
  Boac: [
    'Agot',
    'Agumaymayan',
    'Amoingon',
    'Apitong',
    'Balagasan',
    'Balaring',
    'Balimbing',
    'Bamban',
    'Bangbangalon',
    'Bantay',
  ],
  Buenavista: [
    'Bagacay',
    'Bagtingon',
    'Bicas-bicas',
    'Caigangan',
    'Daykitin',
    'Libas',
    'Malbog',
    'Sihi',
    'Timbo',
    'Yook',
  ],
  Gasan: [
    'Antipolo',
    'Bachao Ilaya',
    'Bachao Ibaba',
    'Bahi',
    'Bangbang',
    'Banot',
    'Banuyo',
    'Bognuyan',
    'Cabugao',
    'Dawis',
  ],
  Mogpog: [
    'Anapog-Sibucao',
    'Argao',
    'Balanacan',
    'Banto',
    'Bintakay',
    'Butansapa',
    'Candahon',
    'Danao',
    'Guisian',
    'Hinadharan',
  ],
  'Santa Cruz': [
    'Alobo',
    'Angas',
    'Aturan',
    'Baguidbirin',
    'Baliis',
    'Balogo',
    'Bangcuangan',
    'Banogbog',
    'Biga',
    'Botilao',
  ],
  Torrijos: [
    'Bayakbakin',
    'Bolo',
    'Bonliw',
    'Buangan',
    'Cabuyo',
    'Cagpo',
    'Dampulan',
    'Malibago',
    'Mataas na Bayan',
    'Nangka',
  ],
}

const municipalities = ['Boac', 'Buenavista', 'Gasan', 'Mogpog', 'Santa Cruz', 'Torrijos']

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

const waterSupplyOptions = ['irrigated', 'rainfed']

const landTypeOptions = ['lowland', 'upland']

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
    const randomMunicipality = municipalities[Math.floor(Math.random() * municipalities.length)]
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const municipalityBarangays = barangaysPerMunicipality[randomMunicipality]
    const randomBarangay =
      municipalityBarangays[Math.floor(Math.random() * municipalityBarangays.length)]

    const response = await axiosInstance.post('/api/farmers', {
      name: `${randomFirstName} ${randomLastName}`,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      rsbsa: `RSBSA-${randomNum}`,
      landsize: (Math.random() * 10).toFixed(2),
      association_id: selectedAssociation.value || null,
      municipality: randomMunicipality,
      barangay: randomBarangay,
      technician_id: 2,
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
    const randomMunicipality = municipalities[Math.floor(Math.random() * municipalities.length)]

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
      municipality: randomMunicipality,
      barangay: randomFarmer.barangay,
      technician_id: randomFarmer.technician_id,
      latitude: (13.4417 + (Math.random() - 0.5) * 0.1).toFixed(6),
      longitude: (121.9032 + (Math.random() - 0.5) * 0.1).toFixed(6),
    }

    // Add category-specific details based on the category name
    if (selectedCategory.name === 'Rice') {
      // Rice specific details
      plantingData.rice_classification =
        riceClassificationOptions[Math.floor(Math.random() * riceClassificationOptions.length)]
      plantingData.water_supply =
        waterSupplyOptions[Math.floor(Math.random() * waterSupplyOptions.length)]
      plantingData.land_type = landTypeOptions[Math.floor(Math.random() * landTypeOptions.length)]
    } else if (selectedCategory.name === 'High Value') {
      // HVC specific details
      plantingData.hvc_classification =
        hvcClassificationOptions[Math.floor(Math.random() * hvcClassificationOptions.length)]
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
    <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader class="space-y-3 pb-6 border-b">
        <DialogTitle class="text-2xl font-semibold">Developer Settings</DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          Quick actions for development and testing purposes. Use these tools to generate test data
          for the application.
        </DialogDescription>
      </DialogHeader>

      <Tabs v-model="activeTab" class="w-full mt-6">
        <TabsList class="grid w-full grid-cols-5 gap-2 p-1 bg-muted/20 rounded-lg">
          <TabsTrigger value="farmers" class="flex items-center gap-2 px-3 py-2">
            <Users2 class="h-4 w-4" />
            <span class="hidden sm:inline">Farmers</span>
          </TabsTrigger>
          <TabsTrigger value="associations" class="flex items-center gap-2 px-3 py-2">
            <Building2 class="h-4 w-4" />
            <span class="hidden sm:inline">Associations</span>
          </TabsTrigger>
          <TabsTrigger value="crops" class="flex items-center gap-2 px-3 py-2">
            <Sprout class="h-4 w-4" />
            <span class="hidden sm:inline">Crops</span>
          </TabsTrigger>
          <TabsTrigger value="varieties" class="flex items-center gap-2 px-3 py-2">
            <Leaf class="h-4 w-4" />
            <span class="hidden sm:inline">Varieties</span>
          </TabsTrigger>
          <TabsTrigger value="plantings" class="flex items-center gap-2 px-3 py-2">
            <Flower2 class="h-4 w-4" />
            <span class="hidden sm:inline">Plantings</span>
          </TabsTrigger>
        </TabsList>

        <!-- Associations Tab -->
        <TabsContent value="associations" class="space-y-6 py-6">
          <div class="space-y-6">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">Create Test Associations</h3>
              <p class="text-sm text-muted-foreground">
                Generate test associations to group farmers together. Each association will be
                created with random test data.
              </p>
            </div>
            <div class="space-y-4 bg-muted/10 rounded-lg p-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Number of Associations</label>
                <div class="flex items-center gap-4">
                  <Input
                    type="number"
                    v-model="associationCount"
                    min="1"
                    max="50"
                    class="max-w-[120px]"
                  />
                  <Button
                    @click="handleCreateAssociations"
                    :disabled="isCreatingAssociation"
                    class="min-w-[140px]"
                    variant="default"
                  >
                    <Loader2 v-if="isCreatingAssociation" class="mr-2 h-4 w-4 animate-spin" />
                    {{ isCreatingAssociation ? 'Creating...' : 'Create Associations' }}
                  </Button>
                </div>
                <p class="text-xs text-muted-foreground">
                  Maximum of 50 associations can be created at once.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- Farmers Tab -->
        <TabsContent value="farmers" class="space-y-6 py-6">
          <div class="space-y-6">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">Create Test Farmers</h3>
              <p class="text-sm text-muted-foreground">
                Generate test farmer records with random data. Each farmer can optionally be
                assigned to an association.
              </p>
            </div>
            <div class="space-y-4 bg-muted/10 rounded-lg p-4">
              <div class="grid gap-6 sm:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Number of Farmers</label>
                  <Input type="number" v-model="farmerCount" min="1" max="50" />
                  <p class="text-xs text-muted-foreground">
                    Maximum of 50 farmers can be created at once.
                  </p>
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
                  <p class="text-xs text-muted-foreground">
                    Farmers will be assigned to the selected association.
                  </p>
                </div>
              </div>
              <Button
                @click="handleCreateFarmers"
                :disabled="isCreatingFarmer"
                class="min-w-[140px] mt-4"
                variant="default"
              >
                <Loader2 v-if="isCreatingFarmer" class="mr-2 h-4 w-4 animate-spin" />
                {{ isCreatingFarmer ? 'Creating...' : 'Create Farmers' }}
              </Button>
            </div>
          </div>
        </TabsContent>

        <!-- Crops Tab -->
        <TabsContent value="crops" class="space-y-6 py-6">
          <div class="space-y-6">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">Create Test Crops</h3>
              <p class="text-sm text-muted-foreground">
                Generate test crops under a specific category. Each crop will be created with random
                test data.
              </p>
            </div>
            <div class="space-y-4 bg-muted/10 rounded-lg p-4">
              <div class="grid gap-6 sm:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Category</label>
                  <Select v-model="selectedCategoryForCrop">
                    <SelectTrigger>
                      <SelectValue
                        :placeholder="
                          isLoadingCategories ? 'Loading categories...' : 'Select category'
                        "
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        v-if="isLoadingCategories"
                        class="p-2 text-sm text-muted-foreground text-center"
                      >
                        <Loader2 class="h-4 w-4 animate-spin mx-auto mb-2" />
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
                  <p class="text-xs text-muted-foreground">
                    Maximum of 50 crops can be created at once.
                  </p>
                </div>
              </div>
              <Button
                @click="handleCreateCrops"
                :disabled="isCreatingCrop || !selectedCategoryForCrop"
                class="min-w-[140px] mt-4"
                variant="default"
              >
                <Loader2 v-if="isCreatingCrop" class="mr-2 h-4 w-4 animate-spin" />
                {{ isCreatingCrop ? 'Creating...' : 'Create Crops' }}
              </Button>
            </div>
          </div>
        </TabsContent>

        <!-- Varieties Tab -->
        <TabsContent value="varieties" class="space-y-6 py-6">
          <div class="space-y-6">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">Create Test Varieties</h3>
              <p class="text-sm text-muted-foreground">
                Generate test varieties for a specific crop. Each variety will be created with
                random maturity days.
              </p>
            </div>
            <div class="space-y-4 bg-muted/10 rounded-lg p-4">
              <div class="grid gap-6">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Category</label>
                  <Select v-model="selectedCategoryForVariety">
                    <SelectTrigger>
                      <SelectValue
                        :placeholder="
                          isLoadingCategories ? 'Loading categories...' : 'Select category'
                        "
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        v-if="isLoadingCategories"
                        class="p-2 text-sm text-muted-foreground text-center"
                      >
                        <Loader2 class="h-4 w-4 animate-spin mx-auto mb-2" />
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
                        <Loader2 class="h-4 w-4 animate-spin mx-auto mb-2" />
                        Loading crops...
                      </div>
                      <SelectItem
                        v-else
                        v-for="crop in cropsForVariety"
                        :key="crop.id"
                        :value="crop.id"
                      >
                        {{ crop.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium">Number of Varieties</label>
                  <Input type="number" v-model="varietyCount" min="1" max="50" />
                  <p class="text-xs text-muted-foreground">
                    Maximum of 50 varieties can be created at once.
                  </p>
                </div>
              </div>
              <Button
                @click="handleCreateVarieties"
                :disabled="
                  isCreatingVariety || !selectedCategoryForVariety || !selectedCropForVariety
                "
                class="min-w-[140px] mt-4"
                variant="default"
              >
                <Loader2 v-if="isCreatingVariety" class="mr-2 h-4 w-4 animate-spin" />
                {{ isCreatingVariety ? 'Creating...' : 'Create Varieties' }}
              </Button>
            </div>
          </div>
        </TabsContent>

        <!-- Plantings Tab -->
        <TabsContent value="plantings" class="space-y-6 py-6">
          <div class="space-y-6">
            <div class="space-y-2">
              <h3 class="text-lg font-semibold">Create Test Plantings</h3>
              <p class="text-sm text-muted-foreground">
                Generate test planting records with random data including area planted, expenses,
                and location coordinates.
              </p>
            </div>
            <div class="space-y-4 bg-muted/10 rounded-lg p-4">
              <div class="grid gap-6">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Category</label>
                  <Select v-model="selectedCategoryForPlanting">
                    <SelectTrigger>
                      <SelectValue
                        :placeholder="
                          isLoadingCategories ? 'Loading categories...' : 'Select category'
                        "
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        v-if="isLoadingCategories"
                        class="p-2 text-sm text-muted-foreground text-center"
                      >
                        <Loader2 class="h-4 w-4 animate-spin mx-auto mb-2" />
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
                        :placeholder="
                          isLoadingCropsForPlanting ? 'Loading crops...' : 'Select crop'
                        "
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <div
                        v-if="isLoadingCropsForPlanting"
                        class="p-2 text-sm text-muted-foreground text-center"
                      >
                        <Loader2 class="h-4 w-4 animate-spin mx-auto mb-2" />
                        Loading crops...
                      </div>
                      <SelectItem
                        v-else
                        v-for="crop in cropsForPlanting"
                        :key="crop.id"
                        :value="crop.id"
                      >
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
                        <Loader2 class="h-4 w-4 animate-spin mx-auto mb-2" />
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
                  <p class="text-xs text-muted-foreground">
                    Maximum of 50 plantings can be created at once.
                  </p>
                </div>
              </div>

              <Button
                @click="handleCreatePlantings"
                :disabled="
                  isCreatingPlanting ||
                  !selectedCategoryForPlanting ||
                  !selectedCropForPlanting ||
                  !selectedVarietyForPlanting
                "
                class="min-w-[140px] mt-4"
                variant="default"
              >
                <Loader2 v-if="isCreatingPlanting" class="mr-2 h-4 w-4 animate-spin" />
                {{ isCreatingPlanting ? 'Creating...' : 'Create Plantings' }}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.Dialog-overlay {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

:deep(.dialog-content) {
  max-height: 90vh;
  overflow-y: auto;
}

/* Improved scrollbar styling */
:deep(.dialog-content::-webkit-scrollbar) {
  width: 8px;
}

:deep(.dialog-content::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.dialog-content::-webkit-scrollbar-thumb) {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

:deep(.dialog-content::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
