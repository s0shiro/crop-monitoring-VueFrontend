<script setup>
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import {
  UserIcon,
  Users2Icon,
  ClipboardIcon,
  MapPinIcon,
  HomeIcon,
  BuildingIcon,
  RulerIcon,
  UserCogIcon,
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  farmer: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isOpen', 'farmerUpdated'])

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

const formErrors = ref({})
const isUpdating = ref(false)
const authStore = useAuthStore()
const { toast } = useToast()

const queryClient = useQueryClient()

// Fetch associations for the dropdown
const { data: associations } = useQuery({
  queryKey: ['associations-dropdown'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/associations')
    return response.data.data
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

// Watch for farmer prop changes to update form data
watch(
  () => props.farmer,
  (newFarmer) => {
    if (newFarmer) {
      formData.value = {
        name: newFarmer.name,
        gender: newFarmer.gender,
        rsbsa: newFarmer.rsbsa || '',
        landsize: newFarmer.landsize?.toString() || '',
        barangay: newFarmer.barangay,
        municipality: newFarmer.municipality,
        association_id: newFarmer.association_id?.toString() || '',
        technician_id: newFarmer.technician_id?.toString() || '',
      }
    }
  },
  { immediate: true },
)

// Update farmer mutation
const { mutate: updateFarmer } = useMutation({
  mutationFn: async (data) => {
    return await axiosInstance.put(`/api/farmers/${props.farmer.id}`, data)
  },
  onSuccess: (response) => {
    // Invalidate relevant queries
    queryClient.invalidateQueries(['farmer', props.farmer.id])
    queryClient.invalidateQueries(['farmers']) // For the list view

    toast({
      title: 'Success',
      description: 'Farmer information updated successfully.',
    })
    emit('farmerUpdated', response.data.data)
    closeModal()
  },
  onError: (error) => {
    const errorData = error.response?.data
    if (errorData?.errors) {
      formErrors.value = errorData.errors
    }
    toast({
      variant: 'destructive',
      title: 'Error',
      description: errorData?.message || 'Failed to update farmer information.',
    })
  },
  onSettled: () => {
    isUpdating.value = false
  },
})

const handleSubmit = () => {
  isUpdating.value = true
  formErrors.value = {}

  const updateData = {
    ...formData.value,
    landsize: formData.value.landsize ? parseFloat(formData.value.landsize) : null,
    association_id: formData.value.association_id || null,
  }

  // Add technician_id only if admin is updating the farmer
  if (authStore.hasRole('admin') && formData.value.technician_id) {
    updateData.technician_id = formData.value.technician_id
  }

  updateFarmer(updateData)
}

const closeModal = () => {
  emit('update:isOpen', false)
  formErrors.value = {}
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="closeModal">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader class="space-y-3">
        <DialogTitle class="text-2xl font-bold flex items-center gap-2">
          <UserIcon class="h-6 w-6 text-primary" />
          Edit Farmer Information
        </DialogTitle>
        <DialogDescription class="text-muted-foreground">
          Update the farmer's details using the form below. Required fields are marked with an
          asterisk (*).
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6 mt-4">
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Name Field -->
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium flex items-center gap-2">
              <UserIcon class="h-4 w-4 text-muted-foreground" />
              Name <span class="text-destructive">*</span>
            </label>
            <Input
              id="name"
              v-model="formData.name"
              :class="{ 'border-destructive': formErrors.name }"
              placeholder="Enter farmer's name"
            />
            <p v-if="formErrors.name" class="text-xs text-destructive flex items-center gap-1">
              {{ formErrors.name[0] }}
            </p>
          </div>

          <!-- Gender Field -->
          <div class="space-y-2">
            <label class="text-sm font-medium flex items-center gap-2">
              <Users2Icon class="h-4 w-4 text-muted-foreground" />
              Gender <span class="text-destructive">*</span>
            </label>
            <Select v-model="formData.gender">
              <SelectTrigger :class="{ 'border-destructive': formErrors.gender }">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="formErrors.gender" class="text-xs text-destructive flex items-center gap-1">
              {{ formErrors.gender[0] }}
            </p>
          </div>

          <!-- RSBSA Field -->
          <div class="space-y-2">
            <label for="rsbsa" class="text-sm font-medium flex items-center gap-2">
              <ClipboardIcon class="h-4 w-4 text-muted-foreground" />
              RSBSA Number
            </label>
            <Input
              id="rsbsa"
              v-model="formData.rsbsa"
              :class="{ 'border-destructive': formErrors.rsbsa }"
              placeholder="Enter RSBSA number"
            />
            <p v-if="formErrors.rsbsa" class="text-xs text-destructive flex items-center gap-1">
              {{ formErrors.rsbsa[0] }}
            </p>
          </div>

          <!-- Land Size Field -->
          <div class="space-y-2">
            <label for="landsize" class="text-sm font-medium flex items-center gap-2">
              <RulerIcon class="h-4 w-4 text-muted-foreground" />
              Land Size (hectares)
            </label>
            <Input
              id="landsize"
              v-model="formData.landsize"
              type="number"
              step="0.01"
              :class="{ 'border-destructive': formErrors.landsize }"
              placeholder="Enter land size"
            />
            <p v-if="formErrors.landsize" class="text-xs text-destructive flex items-center gap-1">
              {{ formErrors.landsize[0] }}
            </p>
          </div>

          <!-- Barangay Field -->
          <div class="space-y-2">
            <label for="barangay" class="text-sm font-medium flex items-center gap-2">
              <HomeIcon class="h-4 w-4 text-muted-foreground" />
              Barangay <span class="text-destructive">*</span>
            </label>
            <Input
              id="barangay"
              v-model="formData.barangay"
              :class="{ 'border-destructive': formErrors.barangay }"
              placeholder="Enter barangay"
            />
            <p v-if="formErrors.barangay" class="text-xs text-destructive flex items-center gap-1">
              {{ formErrors.barangay[0] }}
            </p>
          </div>

          <!-- Municipality Field -->
          <div class="space-y-2">
            <label for="municipality" class="text-sm font-medium flex items-center gap-2">
              <BuildingIcon class="h-4 w-4 text-muted-foreground" />
              Municipality <span class="text-destructive">*</span>
            </label>
            <Input
              id="municipality"
              v-model="formData.municipality"
              :class="{ 'border-destructive': formErrors.municipality }"
              placeholder="Enter municipality"
            />
            <p
              v-if="formErrors.municipality"
              class="text-xs text-destructive flex items-center gap-1"
            >
              {{ formErrors.municipality[0] }}
            </p>
          </div>

          <!-- Association Field -->
          <div class="space-y-2">
            <label class="text-sm font-medium flex items-center gap-2">
              <Users2Icon class="h-4 w-4 text-muted-foreground" />
              Association
            </label>
            <Select v-model="formData.association_id">
              <SelectTrigger :class="{ 'border-destructive': formErrors.association_id }">
                <SelectValue placeholder="Select association" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">None</SelectItem>
                <SelectItem
                  v-for="association in associations"
                  :key="association.id"
                  :value="association.id.toString()"
                >
                  {{ association.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="formErrors.association_id"
              class="text-xs text-destructive flex items-center gap-1"
            >
              {{ formErrors.association_id[0] }}
            </p>
          </div>

          <!-- Technician Field (Admin Only) -->
          <div v-if="authStore.hasRole('admin')" class="space-y-2">
            <label class="text-sm font-medium flex items-center gap-2">
              <UserCogIcon class="h-4 w-4 text-muted-foreground" />
              Assigned Technician <span class="text-destructive">*</span>
            </label>
            <Select v-model="formData.technician_id">
              <SelectTrigger :class="{ 'border-destructive': formErrors.technician_id }">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="technician in technicians"
                  :key="technician.id"
                  :value="technician.id.toString()"
                >
                  {{ technician.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="formErrors.technician_id"
              class="text-xs text-destructive flex items-center gap-1"
            >
              {{ formErrors.technician_id[0] }}
            </p>
          </div>
        </div>

        <DialogFooter class="mt-6 gap-2">
          <Button
            variant="outline"
            type="button"
            @click="closeModal"
            class="hover:bg-muted transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="isUpdating"
            class="gap-2 hover:bg-primary/90 transition-colors"
          >
            <span v-if="isUpdating" class="animate-spin">
              <svg class="h-4 w-4" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            {{ isUpdating ? 'Updating...' : 'Update Farmer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
