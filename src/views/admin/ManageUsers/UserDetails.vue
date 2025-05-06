<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import axiosInstance from '@/lib/axios'
import { useRoute, useRouter } from 'vue-router'
import { useUserManagement } from '@/composables/useUserManagement'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ChevronLeft, Loader2, Trash2, Pencil } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const route = useRoute()
const router = useRouter()
const { getUserDetails, deleteUser, updateUser, updateUserPermissions } = useUserManagement()
const { toast } = useToast()
const queryClient = useQueryClient()

const showDeleteDialog = ref(false)
const isDeleting = ref(false)

// State for editing basic details (separated from permission editing)
const isEditMode = ref(false)
const detailsForm = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  role: '',
  coordinator_id: null,
})

// State for editing direct permissions independently
const isEditingPermissions = ref(false)
const permissionsForm = ref({
  direct_permissions: [], // Direct permissions managed separately
})

// State for coordinators
const coordinators = ref([])
const isLoadingCoordinators = ref(false)

// Use TanStack Query for fetching permissions dynamically
const {
  data: availablePermissions,
  isLoading: isLoadingPermissions,
  error: permissionsError,
} = useQuery({
  queryKey: ['permissions'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/permissions')
    return response.data
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load permissions',
    })
  },
})

// Use TanStack Query for fetching user details
const {
  data: userDetails,
  isLoading,
  error,
} = useQuery({
  queryKey: ['user', route.params.id],
  queryFn: () => getUserDetails(route.params.id),
  onError: (err) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: err.response?.data?.message || 'Failed to load user details',
    })
    router.push({ name: 'user-management' })
  },
})

// Populate the forms when user details are loaded
watch(
  () => userDetails.value,
  (newDetails) => {
    if (newDetails) {
      detailsForm.value = {
        username: newDetails.user.username,
        name: newDetails.user.name,
        email: newDetails.user.email,
        password: '',
        role: newDetails.roles[0],
        coordinator_id: newDetails.user.coordinator?.id || null,
      }
      permissionsForm.value.direct_permissions = newDetails.direct_permissions || []
    }
  },
  { immediate: true },
)

// Watch for role changes to fetch coordinators
watch(computed(() => detailsForm.value.role === 'technician'), async (show) => {
  if (show) {
    await fetchCoordinators()
  } else {
    detailsForm.value.coordinator_id = null
  }
})

// Mutation for updating basic user details
const { mutate: updateUserMutation, isPending: isUpdatingDetails } = useMutation({
  mutationFn: async (userData) => {
    return await updateUser({
      id: route.params.id,
      ...userData,
    })
  },
  onSuccess: (result) => {
    queryClient.invalidateQueries({ queryKey: ['user', route.params.id] })
    toast({
      title: 'Success',
      description: result.message || 'User details updated successfully',
    })
    isEditMode.value = false
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to update user details',
    })
  },
})

// Mutation for updating direct permissions
const { mutate: updateUserPermissionsMutation, isPending: isUpdatingPermissions } = useMutation({
  mutationFn: async (permissions) => {
    return await updateUserPermissions({
      id: route.params.id,
      permissions,
    })
  },
  onSuccess: (result) => {
    queryClient.invalidateQueries({ queryKey: ['user', route.params.id] })
    toast({
      title: 'Success',
      description: result.message || 'Permissions updated successfully',
    })
    isEditingPermissions.value = false
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to update permissions',
    })
  },
})

// Add a new function to update permissionsForm when entering editing mode
function handleEditPermissions() {
  // Merge existing direct_permissions with inherited ones,
  // so that all permissions user already has are checked.
  if (userDetails.value) {
    permissionsForm.value.direct_permissions = Array.from(
      new Set([...permissionsForm.value.direct_permissions, ...userDetails.value.permissions]),
    )
  }
  isEditingPermissions.value = true
}

// Fetch coordinators
async function fetchCoordinators() {
  try {
    isLoadingCoordinators.value = true
    const response = await axiosInstance.get('/api/coordinators')
    coordinators.value = response.data
  } catch (error) {
    console.error('Failed to fetch coordinators:', error)
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to load coordinators',
    })
  } finally {
    isLoadingCoordinators.value = false
  }
}

async function handleDeleteUser() {
  if (!userDetails.value) return

  isDeleting.value = true
  try {
    const result = await deleteUser(route.params.id)
    toast({
      title: 'Success',
      description: result.message || 'User deleted successfully',
    })
    router.push({ name: 'user-management' })
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete user',
    })
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
  }
}

function handleDetailsSubmit() {
  const userData = {
    username: detailsForm.value.username,
    name: detailsForm.value.name,
    email: detailsForm.value.email,
    password: detailsForm.value.password,
    role: detailsForm.value.role,
  }

  // Add coordinator_id if role is technician
  if (detailsForm.value.role === 'technician') {
    userData.coordinator_id = detailsForm.value.coordinator_id
  }

  updateUserMutation({
    id: route.params.id,
    userData,
  })
}

function handlePermissionsSubmit() {
  updateUserPermissionsMutation(permissionsForm.value.direct_permissions)
}

// Add computed property to merge permissions
const allPermissions = computed(() => {
  if (!userDetails.value) return []
  return Array.from(
    new Set([
      ...permissionsForm.value.direct_permissions,
      ...(userDetails.value.permissions || []),
    ]),
  )
})
</script>

<template>
  <div class="space-y-8">
    <!-- Actions -->
    <div
      class="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-border/50"
    >
      <div class="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          class="hover:bg-muted/10 transition-colors"
          @click="router.push({ name: 'user-management' })"
        >
          <ChevronLeft class="h-4 w-4 mr-1" /> Back
        </Button>
        <Button
          v-if="!isEditMode"
          size="sm"
          class="hover:bg-primary/90 transition-colors"
          @click="isEditMode = true"
        >
          <Pencil class="w-4 h-4 mr-1" /> Edit
        </Button>
        <template v-else>
          <Button
            size="sm"
            variant="default"
            class="hover:bg-primary/90 transition-colors"
            @click="handleDetailsSubmit"
            :disabled="isUpdatingDetails"
          >
            <Loader2 v-if="isUpdatingDetails" class="mr-2 h-4 w-4 animate-spin" />
            {{ isUpdatingDetails ? 'Saving...' : 'Save' }}
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="hover:bg-muted/10 transition-colors"
            @click="isEditMode = false"
          >
            Cancel
          </Button>
        </template>
        <Button
          size="sm"
          variant="destructive"
          class="hover:bg-destructive/90 transition-colors"
          @click="showDeleteDialog = true"
        >
          <Trash2 class="w-4 h-4 mr-1" /> Delete
        </Button>
      </div>
    </div>

    <!-- User Details Section -->
    <div class="grid gap-8">
      <!-- Basic Information Card -->
      <Card class="shadow-lg border border-border/50 backdrop-blur-sm">
        <CardHeader class="space-y-2 border-b border-border/50 bg-muted/5">
          <CardTitle class="text-xl font-semibold text-foreground/90">Basic Information</CardTitle>
          <CardDescription class="text-sm text-muted-foreground">
            Manage user's profile information
          </CardDescription>
        </CardHeader>
        <CardContent class="pt-6">
          <div v-if="userDetails" class="grid gap-8 sm:grid-cols-2">
            <div class="space-y-3">
              <Label class="text-sm font-medium text-foreground/80">Username</Label>
              <div
                v-if="!isEditMode"
                class="text-sm text-foreground p-2 rounded-md bg-muted/5 border border-border/50"
              >
                {{ userDetails.user.username }}
              </div>
              <Input
                v-else
                v-model="detailsForm.username"
                required
                class="border-muted focus:ring-primary transition-shadow"
              />
            </div>
            <div class="space-y-3">
              <Label class="text-sm font-medium text-foreground/80">Name</Label>
              <div
                v-if="!isEditMode"
                class="text-sm text-foreground p-2 rounded-md bg-muted/5 border border-border/50"
              >
                {{ userDetails.user.name }}
              </div>
              <Input
                v-else
                v-model="detailsForm.name"
                required
                class="border-muted focus:ring-primary transition-shadow"
              />
            </div>
            <div class="space-y-3">
              <Label class="text-sm font-medium text-foreground/80">Email</Label>
              <div
                v-if="!isEditMode"
                class="text-sm text-foreground p-2 rounded-md bg-muted/5 border border-border/50"
              >
                {{ userDetails.user.email }}
              </div>
              <Input
                v-else
                type="email"
                v-model="detailsForm.email"
                required
                class="border-muted focus:ring-primary transition-shadow"
              />
            </div>
            <div v-if="isEditMode" class="space-y-3">
              <Label class="text-sm font-medium text-foreground/80">Password</Label>
              <Input
                type="password"
                v-model="detailsForm.password"
                placeholder="Leave blank to keep current password"
                class="border-muted focus:ring-primary transition-shadow"
              />
            </div>
            <div class="space-y-3">
              <Label class="text-sm font-medium text-foreground/80">Role</Label>
              <div
                v-if="!isEditMode"
                class="inline-flex items-center rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary border border-primary/20"
              >
                {{ userDetails.roles[0] }}
              </div>
              <Select v-else v-model="detailsForm.role">
                <SelectTrigger class="w-full border-muted focus:ring-primary">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="isEditMode && detailsForm.role === 'technician'" class="space-y-3">
              <Label class="text-sm font-medium text-foreground/80">Coordinator</Label>
              <Select v-model="detailsForm.coordinator_id">
                <SelectTrigger class="w-full border-muted focus:ring-primary">
                  <SelectValue placeholder="Select a coordinator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="coordinator in coordinators"
                    :key="coordinator.id"
                    :value="coordinator.id"
                  >
                    {{ coordinator.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <div v-if="isLoadingCoordinators" class="text-sm text-muted-foreground flex items-center">
                <Loader2 class="w-5 h-5 animate-spin mr-2" />
                Loading coordinators...
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-muted-foreground flex items-center justify-center py-8">
            <Loader2 class="w-5 h-5 animate-spin mr-2" />
            Loading user details...
          </div>
        </CardContent>
      </Card>

      <!-- Permissions Card -->
      <Card class="shadow-lg border border-border/50 backdrop-blur-sm">
        <CardHeader class="flex flex-col gap-2 border-b border-border/50 bg-muted/5">
          <div>
            <CardTitle class="text-xl font-semibold text-foreground/90">Permissions</CardTitle>
            <CardDescription class="text-sm text-muted-foreground">
              Manage user's access and permissions
            </CardDescription>
          </div>
          <div class="self-end">
            <Button
              size="sm"
              variant="outline"
              v-if="!isEditingPermissions"
              @click="handleEditPermissions"
              class="transition-colors"
            >
              <Pencil class="w-4 h-4 mr-1" />
              Edit Permissions
            </Button>
            <template v-else>
              <Button
                size="sm"
                variant="default"
                @click="handlePermissionsSubmit"
                :disabled="isUpdatingPermissions"
                class="transition-colors"
              >
                <Loader2 v-if="isUpdatingPermissions" class="mr-2 h-4 w-4 animate-spin" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="ml-2 transition-colors"
                @click="isEditingPermissions = false"
              >
                Cancel
              </Button>
            </template>
          </div>
        </CardHeader>
        <CardContent class="pt-6">
          <div v-if="isEditingPermissions" class="grid gap-4 sm:grid-cols-2">
            <label
              v-for="perm in availablePermissions"
              :key="perm"
              class="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/5 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                :value="perm"
                v-model="permissionsForm.direct_permissions"
                class="h-4 w-4 rounded border-muted text-primary focus:ring-primary transition-colors"
              />
              <span class="text-sm text-foreground">{{ perm }}</span>
            </label>
          </div>
          <div v-else class="min-h-[100px]">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="permission in allPermissions"
                :key="permission"
                class="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary-foreground border border-secondary/20 transition-colors hover:bg-secondary/15"
              >
                {{ permission }}
              </div>
              <div
                v-if="allPermissions.length === 0"
                class="text-sm text-muted-foreground flex items-center justify-center w-full py-8"
              >
                No permissions assigned
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold text-foreground/90">Delete User</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            class="hover:bg-muted/10 transition-colors"
            @click="showDeleteDialog = false"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            class="hover:bg-destructive/90 transition-colors"
            :disabled="isDeleting"
            @click="handleDeleteUser"
          >
            <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
