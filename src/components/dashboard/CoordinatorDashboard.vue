<script setup>
import { Card } from '@/components/ui/card'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import {
  Users,
  Activity,
  ChartBar,
  Calendar,
  Bell,
  AlertTriangle,
  Ruler,
  MessageSquare,
  User,
  Globe2,
} from 'lucide-vue-next'
import { computed } from 'vue'
import MarinduqueHeatmap from './MarinduqueHeatmap.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Common chart configurations
const commonScales = {
  x: {
    grid: {
      display: false,
    },
    ticks: {
      font: {
        size: 12,
        family: 'system-ui',
      },
    },
  },
  y: {
    beginAtZero: true,
    grid: {
      color: 'rgba(var(--muted), 0.1)',
    },
    ticks: {
      font: {
        size: 12,
        family: 'system-ui',
      },
      padding: 8,
    },
  },
}

const commonLegendLabels = {
  usePointStyle: true,
  pointStyle: 'circle',
  padding: 20,
  font: {
    size: 12,
    family: 'system-ui',
    weight: '500',
  },
  boxWidth: 8,
  boxHeight: 8,
}

const commonTooltip = {
  backgroundColor: 'rgba(var(--background), 0.9)',
  titleColor: 'rgb(var(--foreground))',
  bodyColor: 'rgb(var(--foreground))',
  borderColor: 'rgba(var(--border), 0.2)',
  borderWidth: 1,
  padding: 12,
  cornerRadius: 8,
  titleFont: {
    size: 13,
    weight: '600',
  },
  bodyFont: {
    size: 12,
  },
  displayColors: true,
  boxWidth: 8,
  boxHeight: 8,
  usePointStyle: true,
}

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: commonScales,
  plugins: {
    legend: {
      position: 'top',
      labels: commonLegendLabels,
    },
    tooltip: {
      ...commonTooltip,
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.parsed.y} plantings`
        },
      },
    },
    title: {
      display: true,
      text: 'Monthly Crop Plantings',
      font: {
        size: 16,
        family: 'system-ui',
        weight: '600',
      },
      padding: {
        bottom: 16,
      },
    },
  },
}

// Process chart data with colors
const processedChartData = computed(() => {
  if (!props.stats?.trends) return null

  return {
    ...props.stats.trends,
    datasets: props.stats.trends.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: 'rgba(34, 197, 94, 0.5)', // Green theme
      borderColor: 'rgb(22, 163, 74)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    })),
  }
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
        <!-- Total Technicians Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-500/10 rounded-lg">
                <User class="h-5 w-5 text-blue-500" />
              </div>
              <h4 class="text-lg font-semibold">Total Technicians</h4>
            </div>
            <div class="text-3xl font-bold text-blue-500">
              {{ stats.overview.total_technicians }}
            </div>
            <p class="mt-2 text-sm text-muted-foreground">Technicians under supervision</p>
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
            <p class="mt-2 text-sm text-muted-foreground">Active crop plantings by technicians</p>
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
            <p class="mt-2 text-sm text-muted-foreground">Farmers managed by technicians</p>
          </div>
        </Card>
      </div>
    </div>

    <!-- Monitoring Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Recent Inspections -->
      <div>
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar class="h-5 w-5 text-primary" />
          Recent Inspections
        </h3>
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6">
            <div
              v-if="stats.monitoring.recent_inspections.length === 0"
              class="text-muted-foreground text-center py-4"
            >
              No recent inspections
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="inspection in stats.monitoring.recent_inspections"
                :key="inspection.date"
                class="p-4 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-full">
                      <Calendar class="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p class="font-medium">{{ inspection.farmer_name }}</p>
                      <p class="text-sm text-muted-foreground">
                        By {{ inspection.technician_name }}
                      </p>
                    </div>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    {{ new Date(inspection.date).toLocaleDateString() }}
                  </p>
                </div>
                <div class="ml-11">
                  <div class="flex items-center gap-2">
                    <MessageSquare class="h-4 w-4 text-muted-foreground" />
                    <p class="text-sm">
                      <span class="text-muted-foreground">Remarks:</span>
                      <span class="font-medium">{{ inspection.remarks }}</span>
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
                    <div>
                      <p class="font-medium">{{ alert.farmer_name }}</p>
                      <p class="text-sm text-muted-foreground">By {{ alert.technician_name }}</p>
                    </div>
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

    <!-- Trends Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChartBar class="h-5 w-5 text-primary" />
        Planting Trends
      </h3>
      <Card class="overflow-hidden transition-all hover:shadow-lg">
        <div class="p-6">
          <div class="h-[400px]">
            <Line v-if="processedChartData" :data="processedChartData" :options="chartOptions" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Marinduque Heatmap Section -->
    <div v-if="stats?.marinduque_heatmap" class="w-full overflow-hidden">
      <MarinduqueHeatmap :heatmap-data="stats.marinduque_heatmap" />
    </div>
  </div>
</template>

<style scoped>
/* Ensure no horizontal scrolling on mobile */
:deep(.leaflet-container) {
  max-width: 100%;
}
</style>
