<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axios'
import { Loading } from '@/components/ui/loading'
import AdminDashboard from '@/components/dashboard/AdminDashboard.vue'
import TechnicianDashboard from '@/components/dashboard/TechnicianDashboard.vue'
import CoordinatorDashboard from '@/components/dashboard/CoordinatorDashboard.vue'
import { useUserAuth } from '@/composables/useUserAuth'

const authStore = useAuthStore()
const { hasRole } = useUserAuth()

const isAdmin = computed(() => hasRole('admin'))
const isTechnician = computed(() => hasRole('technician'))
const isCoordinator = computed(() => hasRole('coordinator'))

// Check if data matches the expected structure for each role
const hasAdminData = computed(
  () => dashboardStats.value?.system_overview && dashboardStats.value?.analytics,
)
const hasTechnicianData = computed(
  () => dashboardStats.value?.overview && dashboardStats.value?.monitoring,
)
const hasCoordinatorData = computed(
  () => dashboardStats.value?.overview && dashboardStats.value?.monitoring,
)

// Dashboard stats query
const {
  data: dashboardStats,
  isLoading: statsLoading,
  error: statsError,
  refetch: refetchStats,
} = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: async () => {
    const { data } = await axiosInstance.get('/api/dashboard/stats')
    return data
  },
  refetchOnWindowFocus: false,
  enabled: true,
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Loading state -->
    <Loading v-if="statsLoading" description="Fetching dashboard statistics...">
      Loading Dashboard Data
    </Loading>

    <!-- Success state -->
    <div v-else-if="dashboardStats" class="space-y-8">
      <!-- Welcome section -->
      <div class="relative overflow-hidden rounded-lg border bg-card animate-fade-in">
        <!-- Background pattern -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-gradient"
        >
          <div
            class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIG9wYWNpdHk9Ii4yIi8+PC9nPjwvc3ZnPg==')] opacity-20 animate-pattern"
          ></div>
        </div>

        <!-- Content -->
        <div class="relative p-8">
          <div class="flex items-center gap-6 animate-slide-in">
            <!-- User avatar or icon -->
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-bounce-soft"
            >
              <svg
                class="h-8 w-8 text-primary animate-pulse"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <div class="space-y-1">
              <h2 class="text-3xl font-bold tracking-tight animate-slide-up">
                Welcome back, {{ authStore.user?.name || 'User' }}! 👋
              </h2>
              <p class="text-lg text-muted-foreground animate-fade-in-delayed">
                Here's what's happening in your agricultural monitoring system.
              </p>
            </div>
          </div>

          <!-- Quick stats -->
          <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              class="rounded-lg border bg-background/50 p-4 backdrop-blur-sm animate-slide-up"
              style="animation-delay: 100ms"
            >
              <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <svg
                  class="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Last login
              </div>
              <p class="mt-1 text-2xl font-semibold">{{ new Date().toLocaleDateString() }}</p>
            </div>

            <div
              class="rounded-lg border bg-background/50 p-4 backdrop-blur-sm animate-slide-up"
              style="animation-delay: 200ms"
            >
              <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <svg
                  class="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Role
              </div>
              <p class="mt-1 text-2xl font-semibold capitalize">
                {{ isAdmin ? 'Admin' : isTechnician ? 'Technician' : 'Coordinator' }}
              </p>
            </div>

            <div
              class="rounded-lg border bg-background/50 p-4 backdrop-blur-sm animate-slide-up sm:col-span-2 lg:col-span-1"
              style="animation-delay: 300ms"
            >
              <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <svg
                  class="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                System Status
              </div>
              <p class="mt-1 text-2xl font-semibold text-green-500">Active</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Role-specific Dashboard -->
      <AdminDashboard v-if="isAdmin && hasAdminData" :stats="dashboardStats" />
      <TechnicianDashboard v-else-if="isTechnician && hasTechnicianData" :stats="dashboardStats" />
      <CoordinatorDashboard
        v-else-if="isCoordinator && hasCoordinatorData"
        :stats="dashboardStats"
      />
    </div>
  </div>
</template>
