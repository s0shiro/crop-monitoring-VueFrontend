<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-full bg-primary/10">
          <Users class="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-primary">User Management</h1>
          <p class="text-sm text-muted-foreground mt-1">Manage system users and their roles</p>
        </div>
      </div>
      <Button
        @click="showCreateDialog = true"
        class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus class="w-4 h-4" />
        Add User
      </Button>
    </div>

    <!-- Search and Filter Section -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search users..."
            class="pl-9 w-full"
            @input="debounceSearch"
          />
        </div>
      </div>
      <div class="flex gap-4">
        <Select v-model="filterRole" @update:modelValue="applyFilters">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="technician">Technician</SelectItem>
            <SelectItem value="coordinator">Coordinator</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="sortBy" @update:modelValue="applyFilters">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="created_at">Date Created</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          class="w-10 p-0"
          @click="toggleSortDirection"
          :title="sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
        >
          <ArrowUpDown class="h-4 w-4" :class="{ 'rotate-180': sortDirection === 'desc' }" />
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <Loading v-if="isLoadingUsers">Loading users...</Loading>

    <!-- Error State -->
    <div v-else-if="fetchError" class="text-center py-8 text-destructive">
      Failed to load users. Please try again later.
    </div>

    <!-- Empty State -->
    <div
      v-else-if="
        !usersData?.pages ||
        usersData.pages.length === 0 ||
        usersData.pages.every((page) => page.data.length === 0)
      "
      class="min-h-[400px] flex flex-col items-center justify-center text-center"
    >
      <div class="p-4 rounded-full bg-muted">
        <Users class="h-8 w-8 text-muted-foreground" />
      </div>
      <p class="mt-4 text-lg font-medium text-muted-foreground">No users found</p>
    </div>

    <!-- Users Grid -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-for="page in usersData.pages" :key="page.nextCursor">
          <Card
            v-for="user in page.data"
            :key="user.id"
            class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/20"
          >
            <CardContent class="p-6">
              <div class="flex justify-between items-start">
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-full bg-primary/10">
                    <User class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-foreground">{{ user.name }}</h3>
                    <p class="text-sm text-muted-foreground">@{{ user.username }}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      class="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewUserDetails(user)" class="cursor-pointer">
                      <Eye class="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div class="mt-4 space-y-3">
                <div class="flex items-center gap-2">
                  <Mail class="w-4 h-4 text-blue-500" />
                  <p class="text-sm">{{ user.email }}</p>
                </div>

                <div class="flex items-center gap-2">
                  <Shield class="w-4 h-4 text-green-500" />
                  <div class="flex gap-2">
                    <span
                      v-for="role in user.roles"
                      :key="role"
                      :class="{
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold': true,
                        'bg-blue-500/10 text-blue-500': role === 'technician',
                        'bg-green-500/10 text-green-500': role === 'coordinator',
                        'bg-purple-500/10 text-purple-500': role === 'admin',
                      }"
                    >
                      {{ role }}
                    </span>
                  </div>
                </div>

                <!-- Add coordinator information if user is technician -->
                <div v-if="user.roles.includes('technician') && user.coordinator" class="flex items-center gap-2">
                  <UsersRound class="w-4 h-4 text-violet-500" />
                  <p class="text-sm">
                    Coordinator: <span class="text-violet-500">{{ user.coordinator.name }}</span>
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <CalendarDays class="w-4 h-4 text-orange-500" />
                  <p class="text-sm text-muted-foreground">
                    Joined
                    {{
                      new Date(user.created_at).toLocaleDateString('en-US', {
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
        </template>
      </div>

      <!-- Load More Button -->
      <div class="text-center mt-6">
        <Button
          v-if="hasNextPage && !isFetchingNextPage"
          @click="fetchNextPage"
          variant="default"
          class="rounded-lg gap-2"
        >
          <span>Load More</span>
          <Users class="h-4 w-4" />
        </Button>
        <div v-else-if="isFetchingNextPage" class="text-muted-foreground italic">
          Loading more...
        </div>
      </div>
    </div>

    <!-- Create User Dialog -->
    <Dialog :open="showCreateDialog" @update:open="showCreateDialog = $event">
      <DialogContent
        class="sm:max-w-[600px] p-0 overflow-hidden duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]"
      >
        <div class="p-6 pb-0">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2 text-xl font-semibold text-primary">
              <User class="w-5 h-5" />
              Create New User
            </DialogTitle>
            <DialogDescription class="text-muted-foreground mt-1.5">
              Add a new user to the system with their role and permissions.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form ref="formRef" @submit.prevent="handleCreateUser" class="p-6 pt-4">
          <div class="grid md:grid-cols-2 gap-4">
            <!-- Username field -->
            <div class="space-y-2 group">
              <Label
                for="username"
                class="text-sm font-medium group-focus-within:text-primary transition-colors"
                >Username</Label
              >
              <div class="relative">
                <User
                  class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
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
            <div class="space-y-2 group">
              <Label
                for="email"
                class="text-sm font-medium group-focus-within:text-primary transition-colors"
                >Email</Label
              >
              <div class="relative">
                <Mail
                  class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
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
            <div class="space-y-2 group">
              <Label
                for="password"
                class="text-sm font-medium group-focus-within:text-primary transition-colors"
                >Password</Label
              >
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
                      <Users class="h-4 w-4 mr-2 text-blue-500" />
                      Technician
                    </div>
                  </SelectItem>
                  <SelectItem value="coordinator">
                    <div class="flex items-center">
                      <Shield class="h-4 w-4 mr-2 text-green-500" />
                      Coordinator
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Coordinator field (shows only when role is technician) -->
            <div v-if="showCoordinatorField" class="space-y-2 md:col-span-2">
              <Label for="coordinator" class="text-sm font-medium">Assign to Coordinator</Label>
              <Select v-model="formData.coordinator_id" required>
                <SelectTrigger
                  class="ring-offset-background transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  :disabled="isLoadingCoordinators"
                >
                  <SelectValue
                    :placeholder="
                      isLoadingCoordinators ? 'Loading coordinators...' : 'Select a coordinator'
                    "
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="coordinator in coordinators"
                    :key="coordinator.id"
                    :value="coordinator.id"
                  >
                    <div class="flex items-center">
                      <Shield class="h-4 w-4 mr-2 text-green-500" />
                      {{ coordinator.name }}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter class="mt-6 gap-2">
            <DialogTrigger as-child>
              <Button
                type="button"
                variant="outline"
                class="transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              :disabled="isCreating"
              class="transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <div class="flex items-center gap-2">
                <Plus class="w-4 h-4" />
                {{ isCreating ? 'Creating...' : 'Create User' }}
              </div>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserManagement } from '@/composables/useUserManagement'
import { useUtilsStore } from '@/stores/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
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
  Search,
  ArrowUpDown,
  User,
  Mail,
  Shield,
  Users,
  CalendarDays,
  UsersRound,
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'

const { toast } = useToast()
const router = useRouter()
const utilsStore = useUtilsStore()

// Search and filter state
const searchQuery = ref('')
const filterRole = ref('all')
const sortBy = ref('created_at')
const sortDirection = ref('desc')

// State from composable with search params
const {
  usersData,
  isLoadingUsers,
  fetchError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  createUser,
  isCreating,
  refreshUsers,
} = useUserManagement({
  search: searchQuery,
  role: filterRole,
  sortBy: sortBy,
  sortDirection: sortDirection,
})

// Use debounce from store
const debounceSearch = utilsStore.debounce(
  () => {
    refreshUsers()
  },
  300,
  'userSearch',
)

// Filter and sort handlers
function applyFilters() {
  refreshUsers()
}

function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  refreshUsers()
}

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
  coordinator_id: null,
})

// Add new refs for password visibility and form validation
const showPassword = ref(false)
const formRef = ref(null)

// Coordinator state
const coordinators = ref([])
const isLoadingCoordinators = ref(false)

// Computed property for showing coordinator field
const showCoordinatorField = computed(() => formData.value.role === 'technician')

// Watch for dialog changes to reset form
watch(showCreateDialog, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

// Watch for role changes to fetch coordinators
watch(showCoordinatorField, async (show) => {
  if (show) {
    await fetchCoordinators()
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
    coordinator_id: null,
  }
  selectedUser.value = null
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
</script>
