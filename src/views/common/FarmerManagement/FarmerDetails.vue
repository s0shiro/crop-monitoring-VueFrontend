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
import { PencilIcon, SaveIcon, XIcon, Trash2Icon, ArrowLeftIcon, UserIcon, MapPinIcon, Loader2 } from 'lucide-vue-next'
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
    const response = await axiosInstance.get(`/api/farmers/${farmerId}`)
    const data = response.data.data
    initializeFormData(data)
    return data
  }
})

// Fetch associations for dropdown
const { data: associations } = useQuery({
  queryKey: ['associations'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/associations')
    return response.data
  }
})

// Fetch technicians if user is admin
const { data: technicians } = useQuery({
  queryKey: ['technicians'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/users/technicians')
    return response.data
  },
  enabled: authStore.hasRole('admin')
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
  }
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
  }
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
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <Button @click="router.back()" variant="ghost" class="rounded-full">
          <ArrowLeftIcon class="w-4 h-4" />
        </Button>
        <h1 class="text-3xl font-extrabold tracking-tight">Farmer Details</h1>
      </div>
      <div class="flex items-center gap-2">
        <Button 
          @click="startEditing" 
          variant="outline"
          class="gap-2"
          v-if="!isEditing"
        >
          <PencilIcon class="w-4 h-4" />
          Edit Details
        </Button>
        <Button 
          @click="confirmDelete" 
          variant="destructive"
          :disabled="isDeleting"
          class="gap-2"
        >
          <Trash2Icon class="w-4 h-4" />
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingFarmer" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-2">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p class="text-muted-foreground">Loading farmer details...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="farmer" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Edit Mode -->
      <Card v-if="isEditing" class="lg:col-span-3">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <PencilIcon class="w-5 h-5 text-primary" />
            Edit Farmer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label for="edit-name" class="text-sm font-medium text-muted-foreground">Name</label>
                <Input
                  id="edit-name"
                  v-model="formData.name"
                  placeholder="Enter farmer name"
                  class="mt-1.5"
                />
              </div>
              <div>
                <label for="edit-gender" class="text-sm font-medium text-muted-foreground">Gender</label>
                <Select v-model="formData.gender" class="mt-1.5">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label for="edit-rsbsa" class="text-sm font-medium text-muted-foreground">RSBSA Number</label>
                <Input
                  id="edit-rsbsa"
                  v-model="formData.rsbsa"
                  placeholder="Enter RSBSA number"
                  class="mt-1.5"
                />
              </div>
              <div>
                <label for="edit-landsize" class="text-sm font-medium text-muted-foreground">Land Size (hectares)</label>
                <Input
                  id="edit-landsize"
                  v-model="formData.landsize"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter land size"
                  class="mt-1.5"
                />
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <label for="edit-barangay" class="text-sm font-medium text-muted-foreground">Barangay</label>
                <Input
                  id="edit-barangay"
                  v-model="formData.barangay"
                  placeholder="Enter barangay"
                  class="mt-1.5"
                />
              </div>
              <div>
                <label for="edit-municipality" class="text-sm font-medium text-muted-foreground">Municipality</label>
                <Input
                  id="edit-municipality"
                  v-model="formData.municipality"
                  placeholder="Enter municipality"
                  class="mt-1.5"
                />
              </div>
              <div>
                <label for="edit-association" class="text-sm font-medium text-muted-foreground">Association</label>
                <Select v-model="formData.association_id" class="mt-1.5">
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
              <div v-if="authStore.hasRole('admin')">
                <label for="edit-technician" class="text-sm font-medium text-muted-foreground">Assign Technician</label>
                <Select v-model="formData.technician_id" class="mt-1.5">
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
            <Button variant="ghost" @click="cancelEditing" class="gap-2">
              <XIcon class="w-4 h-4" />
              Cancel
            </Button>
            <Button
              @click="handleUpdate"
              :disabled="isUpdating"
              variant="default"
              class="gap-2"
            >
              <SaveIcon class="w-4 h-4" />
              {{ isUpdating ? 'Updating...' : 'Save Changes' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- View Mode -->
      <template v-else>
        <!-- Personal Information Card -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <UserIcon class="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Full Name</p>
              <p class="text-lg font-medium mt-1">{{ farmer.name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Gender</p>
              <p class="text-lg capitalize mt-1">{{ farmer.gender }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">RSBSA Number</p>
              <p class="text-lg mt-1">{{ farmer.rsbsa || 'Not available' }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Location Card -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <MapPinIcon class="w-5 h-5 text-primary" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Land Size</p>
              <p class="text-lg mt-1">
                {{ farmer.landsize ? `${farmer.landsize} hectares` : 'Not specified' }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Barangay</p>
              <p class="text-lg mt-1">{{ farmer.barangay }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Municipality</p>
              <p class="text-lg mt-1">{{ farmer.municipality }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Association & Technical Support -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-lg">
              <UsersIcon class="w-5 h-5 text-primary" />
              Association & Support
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Farmers Association</p>
              <p class="text-lg mt-1">{{ farmer.association?.name || 'Not assigned' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Technical Support</p>
              <p class="text-lg mt-1">{{ farmer.technician?.name || 'Not assigned' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Member Since</p>
              <p class="text-lg mt-1">{{ new Date(farmer.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) }}</p>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold">Delete Farmer</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            Are you sure you want to delete this farmer? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" class="hover:bg-muted/10" @click="showDeleteDialog = false">
            Cancel
          </Button>
          <Button
            variant="destructive"
            class="hover:bg-destructive/90"
            :disabled="isDeleting"
            @click="handleDelete"
          >
            <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>