<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserManagement } from '@/composables/useUserManagement'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Eye, MoreHorizontal, Plus, Loader2 } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
const router = useRouter()

// State from composable
const {
  users,
  isLoadingUsers,
  createUser,
  isCreating,
} = useUserManagement()

// Dialog state
const showCreateDialog = ref(false)
const selectedUser = ref(null)

// Form state
const formData = ref({
  name: '',
  email: '',
  password: '',
  role: ''
})

// Watch for dialog changes to reset form
watch(showCreateDialog, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

// Form handlers
async function handleCreateUser(e) {
  e.preventDefault()
  try {
    const result = await createUser(formData.value)
    showCreateDialog.value = false
    resetForm()
    toast({
      title: 'Success',
      description: result.message || 'User created successfully',
    })
  } catch (error) {
    const errorData = error.response?.data
    toast({
      variant: 'destructive',
      title: 'Failed to create user!',
      description: errorData?.errors ? Object.values(errorData.errors).flat().join(', ') : errorData?.message || 'Failed to create user',
    })
  }
}

function viewUserDetails(user) {
  router.push({ name: 'user-details', params: { id: user.id } })
}

function resetForm() {
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: ''
  }
  selectedUser.value = null
}
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">User Management</h1>
    <Dialog>
      <DialogTrigger as-child>
        <Button>
          <Plus class="w-4 h-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
        <DialogHeader class="p-6 pb-0">
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Add a new user to the system.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleCreateUser" class="grid gap-4 py-4 overflow-y-auto px-6">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="formData.name" required />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="formData.email" required />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" v-model="formData.password" required />
          </div>
          <div class="space-y-2">
            <Label for="role">Role</Label>
            <Select v-model="formData.role" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="coordinator">Coordinator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter class="p-6 pt-0">
            <Button type="submit" :disabled="isCreating">
              <Loader2 v-if="isCreating" class="mr-2 h-4 w-4 animate-spin" />
              {{ isCreating ? 'Creating...' : 'Create' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>

  <!-- Users Table -->
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead class="w-[50px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="isLoadingUsers">
          <TableCell colspan="5" class="text-center py-4">Loading...</TableCell>
        </TableRow>
        <TableRow v-else-if="!users?.length">
          <TableCell colspan="5" class="text-center py-4">No users found</TableCell>
        </TableRow>
        <TableRow v-for="user in users" :key="user.id">
          <TableCell>{{ user.name }}</TableCell>
          <TableCell>{{ user.email }}</TableCell>
          <TableCell>{{ (user.roles ?? []).join(', ') }}</TableCell>
          <TableCell>{{ new Date(user.created_at).toLocaleDateString() }}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" class="h-8 w-8 p-0">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="viewUserDetails(user)">
                  <Eye class="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
