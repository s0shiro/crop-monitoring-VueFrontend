<script setup>
import { ref } from 'vue'
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
  UserIcon,
  MapPinIcon,
  Loader2,
  UsersIcon,
  HomeIcon,
  ClipboardIcon,
  RulerIcon,
  CalendarIcon,
  BuildingIcon,
  ShieldIcon,
  AlertTriangleIcon,
  LeafIcon,
  Eye,
} from 'lucide-vue-next'
import axiosInstance from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
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
const authStore = useAuthStore()
const queryClient = useQueryClient()

const farmerId = route.params.id
const isEditing = ref(false)
const isDeleting = ref(false)
const showDeleteDialog = ref(false)

// Form data
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

// Initialize form data when farmer data is available
const initializeFormData = (farmerData) => {
  if (farmerData) {
    formData.value = {
      name: farmerData.name || '',
      gender: farmerData.gender || '',
      rsbsa: farmerData.rsbsa || '',
      landsize: farmerData.landsize ? farmerData.landsize.toString() : '',
      barangay: farmerData.barangay || '',
      municipality: farmerData.municipality || '',
      association_id: farmerData.association_id || '',
      technician_id: farmerData.technician_id || '',
    }
  }
}

const startEditing = () => {
  initializeFormData(farmer.value)
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  initializeFormData(farmer.value)
}

// Fetch farmer details
const { data: farmer, isLoading: isLoadingFarmer } = useQuery({
  queryKey: ['farmer', farmerId],
  queryFn: async () => {
    try {
      const response = await axiosInstance.get(`/api/farmers/${farmerId}`)
      const data = response.data.data
      initializeFormData(data)
      return data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.status === 404 ? 'Farmer not found' : 'Failed to load farmer details',
      })
      router.push({ name: 'farmer-management' })
      throw error
    }
  },
})

// Fetch associations for dropdown
const { data: associations } = useQuery({
  queryKey: ['associations'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/associations')
    return response.data
  },
})

// Fetch technicians if user is admin
const { data: technicians } = useQuery({
  queryKey: ['technicians'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/users/technicians')
    return response.data
  },
  enabled: authStore.hasRole('admin'),
})

// Update farmer mutation
const { mutate: updateFarmer, isPending: isUpdating } = useMutation({
  mutationFn: async (updateData) => {
    const response = await axiosInstance.put(`/api/farmers/${farmerId}`, updateData)
    return response.data
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Farmer updated successfully.',
    })
    isEditing.value = false
    queryClient.invalidateQueries({ queryKey: ['farmer', farmerId] })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to update farmer.',
    })
  },
})

// Delete farmer mutation
const { mutate: deleteFarmer } = useMutation({
  mutationFn: async () => {
    return await axiosInstance.delete(`/api/farmers/${farmerId}`)
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Farmer deleted successfully.',
    })
    router.push({ name: 'farmer-management' })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to update farmer.',
    })
  },
})

const handleUpdate = () => {
  const updateData = {
    ...formData.value,
    landsize: formData.value.landsize ? parseFloat(formData.value.landsize) : null,
  }
  updateFarmer(updateData)
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const handleDelete = () => {
  isDeleting.value = true
  deleteFarmer()
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4"
    >
      <div class="flex items-center gap-4">
        <Button
          @click="router.back()"
          variant="ghost"
          class="rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeftIcon class="w-4 h-4" />
        </Button>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-primary">Farmer Details</h1>
          <p class="text-sm text-muted-foreground mt-1" v-if="farmer">
            Member since
            {{
              new Date(farmer.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button
          @click="startEditing"
          variant="outline"
          class="gap-2 hover:border-primary/50 transition-colors"
          v-if="!isEditing"
        >
          <PencilIcon class="w-4 h-4" />
          Edit Details
        </Button>
        <Button
          @click="confirmDelete"
          variant="destructive"
          :disabled="isDeleting"
          class="gap-2 hover:bg-destructive/90 transition-colors"
        >
          <Trash2Icon class="w-4 h-4" />
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingFarmer" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-2">
        <div
          class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        ></div>
        <p class="text-muted-foreground">Loading farmer details...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="farmer" class="space-y-6">
      <!-- Edit Mode -->
      <Card v-if="isEditing" class="transition-all duration-300 ease-in-out">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <PencilIcon class="w-5 h-5 text-primary" />
            Edit Farmer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="relative group">
                <label
                  for="edit-name"
                  class="text-sm font-medium text-muted-foreground group-focus-within:text-primary transition-colors"
                  >Name</label
                >
                <div class="relative">
                  <UserIcon
                    class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  />
                  <Input
                    id="edit-name"
                    v-model="formData.name"
                    placeholder="Enter farmer name"
                    class="mt-1.5 pl-10"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="edit-gender" class="text-sm font-medium text-muted-foreground"
                  >Gender</label
                >
                <Select v-model="formData.gender">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="relative group">
                <label
                  for="edit-rsbsa"
                  class="text-sm font-medium text-muted-foreground group-focus-within:text-primary transition-colors"
                  >RSBSA Number</label
                >
                <div class="relative">
                  <ClipboardIcon
                    class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  />
                  <Input
                    id="edit-rsbsa"
                    v-model="formData.rsbsa"
                    placeholder="Enter RSBSA number"
                    class="mt-1.5 pl-10"
                  />
                </div>
              </div>

              <div class="relative group">
                <label
                  for="edit-landsize"
                  class="text-sm font-medium text-muted-foreground group-focus-within:text-primary transition-colors"
                  >Land Size (hectares)</label
                >
                <div class="relative">
                  <RulerIcon
                    class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  />
                  <Input
                    id="edit-landsize"
                    v-model="formData.landsize"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter land size"
                    class="mt-1.5 pl-10"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="relative group">
                <label
                  for="edit-barangay"
                  class="text-sm font-medium text-muted-foreground group-focus-within:text-primary transition-colors"
                  >Barangay</label
                >
                <div class="relative">
                  <MapPinIcon
                    class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  />
                  <Input
                    id="edit-barangay"
                    v-model="formData.barangay"
                    placeholder="Enter barangay"
                    class="mt-1.5 pl-10"
                  />
                </div>
              </div>

              <div class="relative group">
                <label
                  for="edit-municipality"
                  class="text-sm font-medium text-muted-foreground group-focus-within:text-primary transition-colors"
                  >Municipality</label
                >
                <div class="relative">
                  <HomeIcon
                    class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  />
                  <Input
                    id="edit-municipality"
                    v-model="formData.municipality"
                    placeholder="Enter municipality"
                    class="mt-1.5 pl-10"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="edit-association" class="text-sm font-medium text-muted-foreground"
                  >Association</label
                >
                <Select v-model="formData.association_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select association" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="assoc in associations" :key="assoc.id" :value="assoc.id">
                      {{ assoc.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div v-if="authStore.hasRole('admin')" class="space-y-1.5">
                <label for="edit-technician" class="text-sm font-medium text-muted-foreground"
                  >Assign Technician</label
                >
                <Select v-model="formData.technician_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="tech in technicians" :key="tech.id" :value="tech.id">
                      {{ tech.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-8">
            <Button
              variant="ghost"
              @click="cancelEditing"
              class="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <XIcon class="w-4 h-4" />
              Cancel
            </Button>
            <Button
              @click="handleUpdate"
              :disabled="isUpdating"
              variant="default"
              class="gap-2 bg-primary hover:bg-primary/90 transition-colors"
            >
              <SaveIcon class="w-4 h-4" />
              {{ isUpdating ? 'Updating...' : 'Save Changes' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- View Mode - Bento Grid Layout -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Name Card - Span 2 columns -->
        <Card
          class="md:col-span-2 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-full bg-primary/10">
                <UserIcon class="w-6 h-6 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Full Name</p>
                <h3 class="text-2xl font-bold text-primary mt-1">{{ farmer.name }}</h3>
                <p class="text-sm text-muted-foreground mt-2">
                  Member since
                  {{
                    new Date(farmer.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- RSBSA Card -->
        <Card
          class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col h-full">
              <div class="p-2 rounded-full bg-blue-500/10 w-fit">
                <ClipboardIcon class="w-5 h-5 text-blue-500" />
              </div>
              <p class="text-sm font-medium text-muted-foreground mt-4">RSBSA Number</p>
              <p class="text-lg font-semibold mt-1">{{ farmer.rsbsa || 'Not available' }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Gender Card -->
        <Card
          class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col h-full">
              <div class="p-2 rounded-full bg-green-500/10 w-fit">
                <ShieldIcon class="w-5 h-5 text-green-500" />
              </div>
              <p class="text-sm font-medium text-muted-foreground mt-4">Gender</p>
              <p class="text-lg font-semibold capitalize mt-1">{{ farmer.gender }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Location Card - Span 2 columns -->
        <Card
          class="md:col-span-2 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col">
              <div class="p-2 rounded-full bg-orange-500/10 w-fit">
                <MapPinIcon class="w-5 h-5 text-orange-500" />
              </div>
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Barangay</p>
                  <p class="text-lg font-semibold mt-1">{{ farmer.barangay }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Municipality</p>
                  <p class="text-lg font-semibold mt-1">{{ farmer.municipality }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Land Size Card -->
        <Card
          class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-yellow-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col h-full">
              <div class="p-2 rounded-full bg-yellow-500/10 w-fit">
                <RulerIcon class="w-5 h-5 text-yellow-500" />
              </div>
              <p class="text-sm font-medium text-muted-foreground mt-4">Land Size</p>
              <p class="text-lg font-semibold mt-1">
                {{ farmer.landsize ? `${farmer.landsize} hectares` : 'Not specified' }}
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Association Card -->
        <Card
          class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col h-full">
              <div class="p-2 rounded-full bg-purple-500/10 w-fit">
                <BuildingIcon class="w-5 h-5 text-purple-500" />
              </div>
              <p class="text-sm font-medium text-muted-foreground mt-4">Farmers Association</p>
              <p class="text-lg font-semibold mt-1">
                {{ farmer.association?.name || 'Not assigned' }}
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Technical Support Card - Span full width -->
        <Card
          class="md:col-span-2 lg:col-span-4 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-indigo-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex items-start gap-4">
              <div class="p-2 rounded-full bg-indigo-500/10">
                <UsersIcon class="w-5 h-5 text-indigo-500" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Technical Support</p>
                    <p class="text-lg font-semibold mt-1">
                      {{ farmer.technician?.name || 'Not assigned' }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p class="text-sm mt-1">
                      {{
                        new Date(farmer.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Crop Plantings Section -->
        <Card
          class="md:col-span-2 lg:col-span-4 mt-6 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/20 border-border/50 hover:border-primary/20"
        >
          <CardHeader class="border-b">
            <CardTitle class="flex items-center gap-2">
              <CalendarIcon class="w-5 h-5 text-primary" />
              Crop Plantings History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-6">
              <!-- No Plantings State -->
              <div v-if="!farmer.crop_plantings?.length" class="text-center py-12">
                <div class="bg-muted/10 rounded-full p-4 w-fit mx-auto">
                  <CalendarIcon class="w-12 h-12 text-muted-foreground/30" />
                </div>
                <p class="text-muted-foreground mt-4">No crop plantings recorded yet.</p>
              </div>

              <!-- Plantings List -->
              <div v-else class="space-y-8 mt-4">
                <div v-for="planting in farmer.crop_plantings" :key="planting.id" class="relative">
                  <!-- Timeline Connector -->
                  <div
                    class="absolute left-6 top-14 bottom-0 w-0.5 bg-border -z-10"
                    v-if="!$last"
                  ></div>

                  <div class="group relative flex gap-6">
                    <!-- Timeline Dot -->
                    <div class="relative">
                      <div
                        :class="{
                          'w-12 h-12 rounded-full border-2 flex items-center justify-center': true,
                          'border-yellow-500 bg-yellow-50': planting.status === 'standing',
                          'border-green-500 bg-green-50': planting.status === 'harvested',
                          'border-blue-500 bg-blue-50': planting.status === 'partially harvested',
                          'border-primary bg-primary/5': planting.status === 'harvest',
                        }"
                      >
                        <span
                          :class="{
                            'text-sm font-medium': true,
                            'text-yellow-700': planting.status === 'standing',
                            'text-green-700': planting.status === 'harvested',
                            'text-blue-700': planting.status === 'partially harvested',
                            'text-primary': planting.status === 'harvest',
                          }"
                        >
                          {{
                            new Date(planting.planting_date).toLocaleDateString('en-US', {
                              month: 'short',
                            })
                          }}
                        </span>
                        <span
                          :class="{
                            'text-xs font-medium block -mt-1': true,
                            'text-yellow-600': planting.status === 'standing',
                            'text-green-600': planting.status === 'harvested',
                            'text-blue-600': planting.status === 'partially harvested',
                            'text-primary/80': planting.status === 'harvest',
                          }"
                        >
                          {{
                            new Date(planting.planting_date).toLocaleDateString('en-US', {
                              day: '2-digit',
                            })
                          }}
                        </span>
                      </div>
                    </div>

                    <!-- Content Card -->
                    <div
                      class="flex-1 bg-card rounded-lg border shadow-sm group-hover:shadow-md transition-all duration-200"
                    >
                      <!-- Header -->
                      <div
                        class="p-4 flex flex-wrap items-start justify-between gap-4 border-b bg-muted/5"
                      >
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <h3 class="text-lg font-semibold text-primary">
                              {{ planting.category?.name }} - {{ planting.crop?.name }}
                            </h3>
                            <span class="text-sm text-muted-foreground">
                              ({{ planting.variety?.name }})
                            </span>
                          </div>
                          <p class="text-sm text-muted-foreground">
                            Maturity: {{ planting.variety?.maturity_days }} days
                          </p>
                        </div>

                        <div class="flex items-center gap-2">
                          <RouterLink :to="{ name: 'crop-planting-details', params: { id: planting.id }}">
                            <Button variant="outline" class="gap-2 hover:bg-primary/5">
                              <Eye class="w-4 h-4" />
                              View Details
                            </Button>
                          </RouterLink>

                          <div
                            :class="{
                              'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5': true,
                              'bg-yellow-100 text-yellow-800': planting.status === 'standing',
                              'bg-green-100 text-green-800': planting.status === 'harvested',
                              'bg-blue-100 text-blue-800': planting.status === 'partially harvested',
                              'bg-primary/10 text-primary': planting.status === 'harvest',
                            }"
                          >
                            <span class="relative flex h-2 w-2">
                              <span
                                :class="{
                                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75': true,
                                  'bg-yellow-400': planting.status === 'standing',
                                  'bg-green-400': planting.status === 'harvested',
                                  'bg-blue-400': planting.status === 'partially harvested',
                                  'bg-primary': planting.status === 'harvest',
                                }"
                              ></span>
                              <span
                                :class="{
                                  'relative inline-flex rounded-full h-2 w-2': true,
                                  'bg-yellow-500': planting.status === 'standing',
                                  'bg-green-500': planting.status === 'harvested',
                                  'bg-blue-500': planting.status === 'partially harvested',
                                  'bg-primary': planting.status === 'harvest',
                                }"
                              ></span>
                            </span>
                            {{ planting.status }}
                          </div>
                        </div>
                      </div>

                      <!-- Content -->
                      <div class="p-4 space-y-4">
                        <!-- Progress Bar -->
                        <div class="space-y-2">
                          <div class="flex justify-between text-sm">
                            <span class="text-muted-foreground">Harvest Progress</span>
                            <span class="font-medium">
                              {{
                                ((planting.harvested_area / planting.area_planted) * 100).toFixed(
                                  1,
                                )
                              }}%
                            </span>
                          </div>
                          <div class="h-2 rounded-full bg-muted/20 overflow-hidden">
                            <div
                              :style="{
                                width: `${(planting.harvested_area / planting.area_planted) * 100}%`,
                              }"
                              :class="{
                                'h-full rounded-full transition-all': true,
                                'bg-yellow-500': planting.status === 'standing',
                                'bg-green-500': planting.status === 'harvested',
                                'bg-blue-500': planting.status === 'partially harvested',
                                'bg-primary': planting.status === 'harvest',
                              }"
                            ></div>
                          </div>
                        </div>

                        <!-- Area Stats -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/5">
                          <div>
                            <p class="text-sm text-muted-foreground">Area Planted</p>
                            <p class="font-medium mt-0.5">{{ planting.area_planted }} ha</p>
                          </div>
                          <div>
                            <p class="text-sm text-muted-foreground">Area Harvested</p>
                            <p class="font-medium mt-0.5">{{ planting.harvested_area }} ha</p>
                          </div>
                          <div>
                            <p class="text-sm text-muted-foreground">Damaged Area</p>
                            <div class="flex items-baseline gap-1">
                              <p class="font-medium mt-0.5">{{ planting.damaged_area }} ha</p>
                              <span
                                class="text-xs text-destructive"
                                v-if="planting.damaged_area > 0"
                              >
                                ({{
                                  ((planting.damaged_area / planting.area_planted) * 100).toFixed(
                                    1,
                                  )
                                }}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Timeline -->
                        <div class="relative">
                          <div class="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10"></div>
                          <div class="flex justify-between">
                            <!-- Planting Date -->
                            <div class="text-center bg-background px-2">
                              <p class="text-xs text-muted-foreground">Planted</p>
                              <p class="font-medium mt-1">
                                {{ new Date(planting.planting_date).toLocaleDateString() }}
                              </p>
                            </div>
                            <!-- Expected Harvest -->
                            <div class="text-center bg-background px-2">
                              <p class="text-xs text-muted-foreground">Expected Harvest</p>
                              <p class="font-medium mt-1">
                                {{ new Date(planting.expected_harvest_date).toLocaleDateString() }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Monitoring Summary -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          <!-- Inspections -->
                          <div class="space-y-3">
                            <p class="text-sm font-medium flex items-center gap-2">
                              <ClipboardIcon class="w-4 h-4 text-muted-foreground" />
                              Latest Inspections
                            </p>
                            <div v-if="planting.inspections?.length" class="space-y-2">
                              <div
                                v-for="inspection in planting.inspections.slice(0, 2)"
                                :key="inspection.id"
                                class="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/5"
                              >
                                <span class="text-muted-foreground">
                                  {{ new Date(inspection.inspection_date).toLocaleDateString() }}
                                </span>
                                <span class="text-destructive font-medium flex items-center gap-1">
                                  <AlertTriangleIcon class="w-3.5 h-3.5" />
                                  {{ inspection.damaged_area }} ha
                                </span>
                                <span class="text-muted-foreground">damaged</span>
                              </div>
                            </div>
                            <p v-else class="text-sm text-muted-foreground italic">
                              No inspections recorded
                            </p>
                          </div>

                          <!-- Harvests -->
                          <div class="space-y-3">
                            <p class="text-sm font-medium flex items-center gap-2">
                              <LeafIcon class="w-4 h-4 text-muted-foreground" />
                              Harvest Reports
                            </p>
                            <div v-if="planting.harvest_reports?.length" class="space-y-2">
                              <div
                                v-for="harvest in planting.harvest_reports.slice(0, 2)"
                                :key="harvest.id"
                                class="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/5"
                              >
                                <span class="text-muted-foreground">
                                  {{ new Date(harvest.harvest_date).toLocaleDateString() }}
                                </span>
                                <span class="text-green-600 font-medium">
                                  {{ harvest.total_yield }} kg
                                </span>
                                <span class="text-muted-foreground">from</span>
                                <span class="font-medium">{{ harvest.area_harvested }} ha</span>
                              </div>
                            </div>
                            <p v-else class="text-sm text-muted-foreground italic">
                              No harvests recorded
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-lg font-semibold text-destructive">
            <Trash2Icon class="w-5 h-5" />
            Delete Farmer
          </DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground mt-2">
            Are you sure you want to delete this farmer? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-4">
          <Button
            variant="ghost"
            class="hover:bg-muted/10 transition-colors"
            @click="showDeleteDialog = false"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            class="hover:bg-destructive/90 transition-colors gap-2"
            :disabled="isDeleting"
            @click="handleDelete"
          >
            <Loader2 v-if="isDeleting" class="h-4 w-4 animate-spin" />
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
