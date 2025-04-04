<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserManagement } from '@/composables/useUserManagement'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const route = useRoute()
const router = useRouter()
const { getUserDetails, deleteUser, updateUser } = useUserManagement()
const { toast } = useToast()

const queryClient = useQueryClient()

const showDeleteDialog = ref(false)
const isDeleting = ref(false)
const isEditMode = ref(false)
const editForm = ref({
  name: '',
  email: '',
  password: '',
  role: ''
})

// Use TanStack Query for fetching user details
const { data: userDetails, isLoading, error } = useQuery({
  queryKey: ['user', route.params.id],
  queryFn: () => getUserDetails(route.params.id),
  onError: (err) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: err.response?.data?.message || 'Failed to load user details',
    })
    router.push({ name: 'user-management' })
  }
})

// Watch userDetails to populate editForm when data is loaded
watch(() => userDetails.value, (newDetails) => {
  if (newDetails) {
    editForm.value = {
      name: newDetails.user.name,
      email: newDetails.user.email,
      password: '',
      role: newDetails.roles[0]
    }
  }
}, { immediate: true })

// Update mutation
const { mutate: updateUserMutation, isPending: isUpdating } = useMutation({
  mutationFn: async (userData) => {
    return await updateUser({
      id: route.params.id,
      ...userData
    })
  },
  onSuccess: (result) => {
    queryClient.invalidateQueries({ queryKey: ['user', route.params.id] })
    toast({
      title: 'Success',
      description: result.message || 'User updated successfully',
    })
    isEditMode.value = false
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to update user',
    })
  }
})

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

function handleSubmit() {
  updateUserMutation(editForm.value)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Breadcrumb and Actions -->
    <div class="flex justify-between items-center">
      <!-- Breadcrumb Navigation -->
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

      <!-- Action Buttons -->
      <div class="flex gap-2" v-if="userDetails">
        <Button v-if="!isEditMode" @click="isEditMode = true">
          <Pencil class="w-4 h-4 mr-2" />
          Edit User
        </Button>
        <template v-else>
          <Button variant="default" @click="handleSubmit" :disabled="isUpdating">
            <Loader2 v-if="isUpdating" class="mr-2 h-4 w-4 animate-spin" />
            {{ isUpdating ? 'Saving...' : 'Save Changes' }}
          </Button>
          <Button variant="outline" @click="isEditMode = false">
            Cancel
          </Button>
        </template>
        <Button variant="destructive" @click="showDeleteDialog = true">
          <Trash2 class="w-4 h-4 mr-2" />
          Delete User
        </Button>
      </div>
    </div>

    <!-- Back Button -->
    <Button
      variant="ghost"
      class="gap-2"
      @click="router.push({ name: 'user-management' })"
    >
      <ChevronLeft class="h-4 w-4" />
      Back to Users
    </Button>

    <!-- Error State -->
    <div v-if="error" class="rounded-md bg-destructive/15 p-4 text-destructive">
      Failed to load user details
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="flex justify-center">
      <Loader2 class="h-6 w-6 animate-spin" />
    </div>

    <!-- User Details Content -->
    <div v-else-if="userDetails" class="grid gap-6">
      <!-- Basic Information -->
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>User's profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <dl class="grid gap-4">
            <div>
              <dt class="font-medium text-muted-foreground">Name</dt>
              <dd v-if="!isEditMode">{{ userDetails.user.name }}</dd>
              <Input v-else v-model="editForm.name" required />
            </div>
            <div>
              <dt class="font-medium text-muted-foreground">Email</dt>
              <dd v-if="!isEditMode">{{ userDetails.user.email }}</dd>
              <Input v-else type="email" v-model="editForm.email" required />
            </div>
            <div v-if="isEditMode">
              <dt class="font-medium text-muted-foreground">Password</dt>
              <Input 
                type="password" 
                v-model="editForm.password"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div>
              <dt class="font-medium text-muted-foreground">Role</dt>
              <dd v-if="!isEditMode" class="bg-primary/10 text-primary inline-block px-3 py-1 rounded-md">
                {{ userDetails.roles[0] }}
              </dd>
              <Select v-else v-model="editForm.role">
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <dt class="font-medium text-muted-foreground">Created At</dt>
              <dd>{{ new Date(userDetails.user.created_at).toLocaleString() }}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <!-- Permissions -->
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>User's available permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="permission in userDetails.permissions"
              :key="permission"
              class="bg-secondary/20 px-3 py-1 rounded-md text-sm font-medium"
            >
              {{ permission }}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" @click="showDeleteDialog = false">
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
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