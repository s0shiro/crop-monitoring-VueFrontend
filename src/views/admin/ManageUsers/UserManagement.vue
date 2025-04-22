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
import {
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Loader2,
  X,
  User,
  Mail,
  Shield,
  Users,
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
const router = useRouter()

// State from composable
const { users, isLoadingUsers, createUser, isCreating } = useUserManagement()

// Dialog state
const showCreateDialog = ref(false)
const selectedUser = ref(null)

// Form state
const formData = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  role: '',
})

// Add new refs for password visibility and form validation
const showPassword = ref(false)
const formRef = ref(null)

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
      description: errorData?.errors
        ? Object.values(errorData.errors).flat().join(', ')
        : errorData?.message || 'Failed to create user',
    })
  }
}

function viewUserDetails(user) {
  router.push({ name: 'user-details', params: { id: user.id } })
}

function resetForm() {
  formData.value = {
    username: '',
    name: '',
    email: '',
    password: '',
    role: '',
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
      <DialogContent
        class="sm:max-w-[600px] p-0 overflow-hidden duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]"
      >
        <div class="p-6 pb-0">
          <DialogHeader>
            <DialogTitle class="text-xl font-semibold">Create New User</DialogTitle>
            <DialogDescription class="text-muted-foreground mt-1.5">
              Add a new user to the system with their role and permissions.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form ref="formRef" @submit.prevent="handleCreateUser" class="p-6 pt-4">
          <div class="grid md:grid-cols-2 gap-4">
            <!-- Username field -->
            <div class="space-y-2">
              <Label for="username" class="text-sm font-medium">Username</Label>
              <div class="relative">
                <User class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  v-model="formData.username"
                  class="pl-9 ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <!-- Name field -->
            <div class="space-y-2">
              <Label for="name" class="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                v-model="formData.name"
                class="ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter full name"
                required
              />
            </div>

            <!-- Email field -->
            <div class="space-y-2">
              <Label for="email" class="text-sm font-medium">Email</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  v-model="formData.email"
                  class="pl-9 ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>

            <!-- Password field -->
            <div class="space-y-2">
              <Label for="password" class="text-sm font-medium">Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="formData.password"
                  class="pr-9 ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Role field -->
            <div class="space-y-2 md:col-span-2">
              <Label for="role" class="text-sm font-medium">Role</Label>
              <Select v-model="formData.role" required>
                <SelectTrigger
                  class="ring-offset-background transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technician">
                    <div class="flex items-center">
                      <Users class="h-4 w-4 mr-2 text-muted-foreground" />
                      Technician
                    </div>
                  </SelectItem>
                  <SelectItem value="coordinator">
                    <div class="flex items-center">
                      <Shield class="h-4 w-4 mr-2 text-muted-foreground" />
                      Coordinator
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter class="mt-6 gap-2">
            <DialogTrigger as-child>
              <Button type="button" variant="outline" class="transition-colors"> Cancel </Button>
            </DialogTrigger>
            <Button
              type="submit"
              :disabled="isCreating"
              class="transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Loader2 v-if="isCreating" class="mr-2 h-4 w-4 animate-spin" />
              {{ isCreating ? 'Creating...' : 'Create User' }}
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
          <TableHead>Username</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead class="w-[50px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="isLoadingUsers">
          <TableCell colspan="6" class="text-center py-4">Loading...</TableCell>
        </TableRow>
        <TableRow v-else-if="!users?.length">
          <TableCell colspan="6" class="text-center py-4">No users found</TableCell>
        </TableRow>
        <TableRow v-for="user in users" :key="user.id">
          <TableCell>{{ user.username }}</TableCell>
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
