<script setup>
import { Card } from '@/components/ui/card'
import { Users, Activity, Building2, ChartBar, Calendar, Bell } from 'lucide-vue-next'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="space-y-8">
    <!-- Overview Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChartBar class="h-5 w-5 text-primary" />
        Overview
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Crop Plantings Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-500/10 rounded-lg">
                <Building2 class="h-5 w-5 text-blue-500" />
              </div>
              <h4 class="text-lg font-semibold">Total Crop Plantings</h4>
            </div>
            <div class="text-3xl font-bold text-blue-500">
              {{ stats.overview.total_crop_plantings }}
            </div>
            <p class="mt-2 text-sm text-muted-foreground">Total registered crop plantings</p>
          </div>
        </Card>

        <!-- Active Crop Plantings Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-green-500/10 rounded-lg">
                <Activity class="h-5 w-5 text-green-500" />
              </div>
              <h4 class="text-lg font-semibold">Active Plantings</h4>
            </div>
            <div class="text-3xl font-bold text-green-500">
              {{ stats.overview.active_crop_plantings }}
            </div>
            <p class="mt-2 text-sm text-muted-foreground">Currently active crop plantings</p>
          </div>
        </Card>

        <!-- Total Farmers Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-orange-500/10 rounded-lg">
                <Users class="h-5 w-5 text-orange-500" />
              </div>
              <h4 class="text-lg font-semibold">Total Farmers</h4>
            </div>
            <div class="text-3xl font-bold text-orange-500">
              {{ stats.overview.total_farmers }}
            </div>
            <p class="mt-2 text-sm text-muted-foreground">Registered farmers</p>
          </div>
        </Card>
      </div>
    </div>

    <!-- Monitoring Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Upcoming Inspections -->
      <div>
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar class="h-5 w-5 text-primary" />
          Upcoming Inspections
        </h3>
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6">
            <div
              v-if="stats.monitoring.upcoming_inspections.length === 0"
              class="text-muted-foreground text-center py-4"
            >
              No upcoming inspections scheduled
            </div>
            <div v-else class="space-y-4">
              <!-- Add upcoming inspections list here when data structure is known -->
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Alerts -->
      <div>
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell class="h-5 w-5 text-primary" />
          Recent Alerts
        </h3>
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6">
            <div
              v-if="stats.monitoring.recent_alerts.length === 0"
              class="text-muted-foreground text-center py-4"
            >
              No recent alerts
            </div>
            <div v-else class="space-y-4">
              <!-- Add recent alerts list here when data structure is known -->
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
