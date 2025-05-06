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
      <div
        class="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border shadow-sm"
      >
        <div class="relative p-8">
          <h2 class="text-3xl font-bold text-foreground">
            Welcome back, {{ authStore.user?.name || 'User' }}! 👋
          </h2>
          <p class="mt-2 text-muted-foreground">
            Here's what's happening in your agricultural monitoring system.
          </p>
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
