<script setup>
import { Card } from '@/components/ui/card'
import {
  Users,
  Activity,
  Building2,
  ChartBar,
  Calendar,
  Bell,
  AlertTriangle,
  Ruler,
  MessageSquare,
} from 'lucide-vue-next'

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
              <div
                v-for="inspection in stats.monitoring.upcoming_inspections"
                :key="inspection.date"
                class="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-primary/10 rounded-full">
                    <Calendar class="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p class="font-medium">{{ inspection.farmer_name }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ new Date(inspection.date).toLocaleDateString() }}
                    </p>
                  </div>
                </div>
              </div>
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
              <div
                v-for="alert in stats.monitoring.recent_alerts"
                :key="alert.date"
                class="p-4 rounded-lg border bg-card/50 hover:bg-destructive/5 transition-colors"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-destructive/10 rounded-full">
                      <AlertTriangle class="h-4 w-4 text-destructive" />
                    </div>
                    <p class="font-medium">{{ alert.farmer_name }}</p>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    {{ new Date(alert.date).toLocaleDateString() }}
                  </p>
                </div>
                <div class="ml-11 space-y-1">
                  <div class="flex items-center gap-2">
                    <Ruler class="h-4 w-4 text-muted-foreground" />
                    <p class="text-sm">
                      <span class="text-muted-foreground">Damaged Area:</span>
                      <span class="font-medium">{{ alert.damaged_area }} hectares</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <MessageSquare class="h-4 w-4 text-muted-foreground" />
                    <p class="text-sm">
                      <span class="text-muted-foreground">Remarks:</span>
                      <span class="font-medium">{{ alert.remarks }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
