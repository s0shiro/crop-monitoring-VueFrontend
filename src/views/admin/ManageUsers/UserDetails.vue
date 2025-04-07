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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
  name: '',
  email: '',
  password: '',
  role: '',
})

// State for editing direct permissions independently
const isEditingPermissions = ref(false)
const permissionsForm = ref({
  direct_permissions: [], // Direct permissions managed separately
})

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
        name: newDetails.user.name,
        email: newDetails.user.email,
        password: '',
        role: newDetails.roles[0],
      }
      permissionsForm.value.direct_permissions = newDetails.direct_permissions || []
    }
  },
  { immediate: true },
)

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
  updateUserMutation({
    name: detailsForm.value.name,
    email: detailsForm.value.email,
    password: detailsForm.value.password,
    role: detailsForm.value.role,
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
    <!-- Breadcrumb and Actions -->
    <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <RouterLink :to="{ name: 'dashboard' }">
              <BreadcrumbLink>Dashboard</BreadcrumbLink>
            </RouterLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <RouterLink :to="{ name: 'user-management' }">
              <BreadcrumbLink>Users</BreadcrumbLink>
            </RouterLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>User Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div class="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          class="hover:bg-muted/10"
          @click="router.push({ name: 'user-management' })"
        >
          <ChevronLeft class="h-4 w-4 mr-1" /> Back
        </Button>
        <Button v-if="!isEditMode" size="sm" class="hover:bg-primary/10" @click="isEditMode = true">
          <Pencil class="w-4 h-4 mr-1" /> Edit
        </Button>
        <template v-else>
          <Button
            size="sm"
            variant="default"
            class="hover:bg-primary/90"
            @click="handleDetailsSubmit"
            :disabled="isUpdatingDetails"
          >
            <Loader2 v-if="isUpdatingDetails" class="mr-2 h-4 w-4 animate-spin" />
            {{ isUpdatingDetails ? 'Saving...' : 'Save' }}
          </Button>
          <Button size="sm" variant="outline" class="hover:bg-muted/10" @click="isEditMode = false"
            >Cancel</Button
          >
        </template>
        <Button
          size="sm"
          variant="destructive"
          class="hover:bg-destructive/90"
          @click="showDeleteDialog = true"
        >
          <Trash2 class="w-4 h-4 mr-1" /> Delete
        </Button>
      </div>
    </div>

    <!-- User Details Section -->
    <div class="grid gap-8">
      <!-- Basic Information Card -->
      <Card class="shadow-lg">
        <CardHeader class="space-y-2">
          <CardTitle class="text-lg font-semibold">Basic Information</CardTitle>
          <CardDescription class="text-sm text-muted-foreground"
            >Manage user's profile information</CardDescription
          >
        </CardHeader>
        <CardContent>
          <div v-if="userDetails" class="grid gap-6 sm:grid-cols-2">
            <div class="space-y-2">
              <Label class="text-sm font-medium">Name</Label>
              <div v-if="!isEditMode" class="text-sm text-foreground">
                {{ userDetails.user.name }}
              </div>
              <Input
                v-else
                v-model="detailsForm.name"
                required
                class="border-muted focus:ring-primary"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">Email</Label>
              <div v-if="!isEditMode" class="text-sm text-foreground">
                {{ userDetails.user.email }}
              </div>
              <Input
                v-else
                type="email"
                v-model="detailsForm.email"
                required
                class="border-muted focus:ring-primary"
              />
            </div>
            <div v-if="isEditMode" class="space-y-2">
              <Label class="text-sm font-medium">Password</Label>
              <Input
                type="password"
                v-model="detailsForm.password"
                placeholder="Leave blank to keep current password"
                class="border-muted focus:ring-primary"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium">Role</Label>
              <div
                v-if="!isEditMode"
                class="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
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
          </div>
          <div v-else class="text-sm text-muted-foreground">Loading user details...</div>
        </CardContent>
      </Card>

      <!-- Permissions Card -->
      <Card class="shadow-lg">
        <CardHeader class="flex flex-col gap-2">
          <div>
            <CardTitle class="text-lg font-semibold">Permissions</CardTitle>
            <CardDescription class="text-sm text-muted-foreground"
              >Manage user's access and permissions</CardDescription
            >
          </div>
          <div class="self-end">
            <Button
              size="sm"
              variant="outline"
              v-if="!isEditingPermissions"
              @click="handleEditPermissions"
            >
              Edit Permissions
            </Button>
            <template v-else>
              <Button
                size="sm"
                variant="default"
                @click="handlePermissionsSubmit"
                :disabled="isUpdatingPermissions"
              >
                <Loader2 v-if="isUpdatingPermissions" class="mr-2 h-4 w-4 animate-spin" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="ml-2"
                @click="isEditingPermissions = false"
              >
                Cancel
              </Button>
            </template>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="isEditingPermissions" class="grid gap-4 sm:grid-cols-2">
            <label
              v-for="perm in availablePermissions"
              :key="perm"
              class="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                :value="perm"
                v-model="permissionsForm.direct_permissions"
                class="h-4 w-4 rounded border-muted text-primary focus:ring-primary"
              />
              <span class="text-sm text-foreground">{{ perm }}</span>
            </label>
          </div>
          <div v-else>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="permission in allPermissions"
                :key="permission"
                class="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary-foreground border border-secondary/20"
              >
                {{ permission }}
              </div>
              <div v-if="allPermissions.length === 0" class="text-sm text-muted-foreground">
                No permissions assigned
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold">Delete User</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" class="hover:bg-muted/10" @click="showDeleteDialog = false"
            >Cancel</Button
          >
          <Button
            variant="destructive"
            class="hover:bg-destructive/90"
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
