<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/vue-query'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const cropName = ref('')
const categoryId = ref('')
const selectedCategoryId = ref('')
const showAddCropDialog = ref(false)

const showAddVarietyDialog = ref(false)
const varietyName = ref('')
const maturityDays = ref('')
const selectedCropId = ref(null)

const { toast } = useToast()

const queryClient = useQueryClient()

const {
  data: categories,
  isLoading: isLoadingCategories,
  error: categoriesError,
} = useQuery({
  queryKey: ['categories'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/categories')
    return response.data
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load categories.',
    })
  },
})

const fetchCrops = async ({ pageParam = 0 }) => {
  const response = await axiosInstance.get(`/api/crops/by-category`, {
    params: { category_id: selectedCategoryId.value, cursor: pageParam },
  })
  return response.data
}

const {
  data: cropsData,
  error: cropsError,
  fetchNextPage,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  isPending: isLoadingCrops,
} = useInfiniteQuery({
  queryKey: ['crops', selectedCategoryId],
  queryFn: fetchCrops,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  enabled: computed(() => !!selectedCategoryId.value),
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load crops.',
    })
  },
})

const { mutate: createCropMutation, isPending: isCreatingCrop } = useMutation({
  mutationFn: async (newCrop) => {
    return await axiosInstance.post('/api/crops', newCrop)
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Crop created successfully.',
    })
    cropName.value = ''
    categoryId.value = ''
    queryClient.invalidateQueries(['crops'])
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create crop.',
    })
  },
})

const createCrop = () => {
  createCropMutation({
    name: cropName.value,
    category_id: categoryId.value,
  })
}

const { mutate: addVarietyMutation, isPending: isAddingVariety } = useMutation({
  mutationFn: async (newVariety) => {
    return await axiosInstance.post(`/api/crops/${selectedCropId.value}/varieties`, newVariety)
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Variety added successfully.',
    })
    varietyName.value = ''
    maturityDays.value = ''
    showAddVarietyDialog.value = false
    queryClient.invalidateQueries(['crops'])
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to add variety.',
    })
  },
})

const addVariety = () => {
  addVarietyMutation({
    name: varietyName.value,
    maturity_days: maturityDays.value,
  })
}

const openAddVarietyDialog = (cropId) => {
  selectedCropId.value = cropId
  showAddVarietyDialog.value = true
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-extrabold text-primary">Crop Management</h1>
      <Button @click="showAddCropDialog = true" variant="default"> Add Crop </Button>
    </div>

    <Tabs default-value="">
      <TabsList>
        <template v-if="isLoadingCategories">
          <div class="flex space-x-4">
            <div v-for="n in 3" :key="n" class="h-8 w-20 bg-muted animate-pulse rounded"></div>
          </div>
        </template>
        <template v-else>
          <TabsTrigger
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
            @click="selectedCategoryId = category.id"
            class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary focus:text-primary"
          >
            {{ category.name }}
          </TabsTrigger>
        </template>
      </TabsList>
    </Tabs>

    <div v-if="!selectedCategoryId" class="text-center text-muted-foreground py-4 italic">
      Please select a category.
    </div>
    <div v-else-if="isLoadingCrops" class="text-center text-muted-foreground py-4 italic">
      Loading crops...
    </div>
    <div v-else-if="cropsError" class="text-center text-destructive py-4 italic">
      Failed to load crops.
    </div>
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-for="page in cropsData.pages" :key="page.id">
          <Card
            v-for="crop in page.data"
            :key="crop.id"
            class="flex flex-col items-start p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between w-full">
              <h2 class="text-xl font-bold text-primary">{{ crop.name }}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" class="p-2">
                    <MoreHorizontal class="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56">
                  <DropdownMenuItem @click="() => openAddVarietyDialog(crop.id)">
                    Add Variety
                  </DropdownMenuItem>
                  <RouterLink :to="{ name: 'crop-varieties', params: { cropId: crop.id } }">
                    <DropdownMenuItem> View Varieties </DropdownMenuItem>
                  </RouterLink>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p class="text-sm text-muted-foreground">{{ crop.varieties_count }} varieties</p>
            <p class="text-xs text-muted-foreground mt-2">
              Added on
              {{
                new Date(crop.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}
            </p>
          </Card>
        </template>
      </div>
      <div class="text-center mt-6">
        <Button v-if="hasNextPage && !isFetchingNextPage" @click="fetchNextPage" variant="default">
          Load More
        </Button>
        <div v-else-if="isFetchingNextPage" class="text-muted-foreground italic">Loading...</div>
      </div>
    </div>

    <!-- Add Crop Dialog -->
    <Dialog :open="showAddCropDialog" @update:open="showAddCropDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold text-primary">Add Crop</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <label for="crop-name" class="block text-sm font-medium text-muted-foreground"
              >Crop Name</label
            >
            <Input
              id="crop-name"
              v-model="cropName"
              placeholder="Enter crop name"
              class="border-muted focus:ring-primary rounded-lg"
            />
          </div>
          <div>
            <label for="category" class="block text-sm font-medium text-muted-foreground"
              >Category</label
            >
            <Select v-model="categoryId">
              <SelectTrigger class="w-full border-muted focus:ring-primary rounded-lg">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showAddCropDialog = false" class="rounded-lg"
            >Cancel</Button
          >
          <Button
            @click="createCrop"
            :disabled="isCreatingCrop"
            class="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-md"
          >
            <template v-if="isCreatingCrop">Creating...</template>
            <template v-else>Create Crop</template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Add Variety Dialog -->
    <Dialog :open="showAddVarietyDialog" @update:open="showAddVarietyDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold text-primary">Add Variety</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <label for="variety-name" class="block text-sm font-medium text-muted-foreground"
              >Variety Name</label
            >
            <Input
              id="variety-name"
              v-model="varietyName"
              placeholder="Enter variety name"
              class="border-muted focus:ring-primary rounded-lg"
            />
          </div>
          <div>
            <label for="maturity-days" class="block text-sm font-medium text-muted-foreground"
              >Maturity Days</label
            >
            <Input
              id="maturity-days"
              v-model="maturityDays"
              placeholder="Enter maturity days"
              type="number"
              class="border-muted focus:ring-primary rounded-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showAddVarietyDialog = false" class="rounded-lg"
            >Cancel</Button
          >
          <Button
            @click="addVariety"
            :disabled="isAddingVariety"
            class="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-md"
          >
            <template v-if="isAddingVariety">Adding...</template>
            <template v-else>Add Variety</template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
