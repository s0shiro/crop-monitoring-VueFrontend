<script setup>
import { Card } from '@/components/ui/card'
import { Users, Activity, Building2, ChartBar, Sprout, Scale, Globe2 } from 'lucide-vue-next'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { computed } from 'vue'
import MarinduqueHeatmap from './MarinduqueHeatmap.vue'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

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

const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: commonScales,
}

// Define chart theme colors
const chartTheme = {
  Rice: {
    backgroundColor: 'rgba(250, 204, 21, 0.5)', // Yellow theme
    borderColor: 'rgb(234, 179, 8)',
    hoverBackgroundColor: 'rgba(250, 204, 21, 0.7)',
  },
  Corn: {
    backgroundColor: 'rgba(34, 197, 94, 0.5)', // Green theme
    borderColor: 'rgb(22, 163, 74)',
    hoverBackgroundColor: 'rgba(34, 197, 94, 0.7)',
  },
  'High Value': {
    backgroundColor: 'rgba(99, 102, 241, 0.5)', // Indigo theme
    borderColor: 'rgb(79, 70, 229)',
    hoverBackgroundColor: 'rgba(99, 102, 241, 0.7)',
  },
}

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
})

// Process chart data with colors
const processedChartData = computed(() => {
  if (!props.stats?.analytics?.crop_plantings_by_category) return null

  const data = props.stats.analytics.crop_plantings_by_category
  return {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: chartTheme[dataset.label]?.backgroundColor,
      borderColor: chartTheme[dataset.label]?.borderColor,
      hoverBackgroundColor: chartTheme[dataset.label]?.hoverBackgroundColor,
      borderWidth: 2,
      borderRadius: 4,
      barThickness: 16,
      maxBarThickness: 20,
    })),
  }
})

// Process harvest analytics data
const harvestAnalyticsData = computed(() => {
  if (!props.stats?.analytics?.harvest_analytics) return null

  const data = props.stats.analytics.harvest_analytics

  // Area harvested chart data
  const areaData = {
    labels: data.labels,
    datasets: data.area_harvested.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: chartTheme[dataset.label]?.backgroundColor,
      borderColor: chartTheme[dataset.label]?.borderColor,
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    })),
  }

  // Yield chart data
  const yieldData = {
    labels: data.labels,
    datasets: data.total_yield.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: chartTheme[dataset.label]?.backgroundColor,
      borderColor: chartTheme[dataset.label]?.borderColor,
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    })),
  }

  return {
    areaData,
    yieldData,
  }
})

// Chart options
const lineChartOptions = {
  ...commonChartOptions,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'center',
      labels: commonLegendLabels,
    },
    tooltip: commonTooltip,
  },
}

const barChartOptions = {
  ...commonChartOptions,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'center',
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
  },
}
</script>

<template>
  <div class="space-y-8">
    <!-- System Overview Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChartBar class="h-5 w-5 text-primary" />
        System Overview
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Users Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-500/10 rounded-lg">
                <Users class="h-5 w-5 text-blue-500" />
              </div>
              <h4 class="text-lg font-semibold">Total Users</h4>
            </div>
            <div class="text-3xl font-bold text-blue-500 mb-3">
              {{ stats.system_overview.total_users }}
            </div>
            <div class="space-y-1.5">
              <div
                v-for="(count, role) in stats.system_overview.users_by_role"
                :key="role"
                class="flex justify-between items-center text-sm"
              >
                <span class="text-muted-foreground capitalize">{{ role }}</span>
                <span class="font-medium text-foreground">{{ count }}</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Active Fields Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-green-500/10 rounded-lg">
                <Activity class="h-5 w-5 text-green-500" />
              </div>
              <h4 class="text-lg font-semibold">Active Fields</h4>
            </div>
            <div class="text-3xl font-bold text-green-500">
              {{ stats.system_overview.active_fields }}
            </div>
            <p class="mt-2 text-sm text-muted-foreground">
              Currently monitored agricultural fields
            </p>
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
              {{ stats.system_overview.total_farmers }}
            </div>
            <p class="mt-2 text-sm text-muted-foreground">Registered farmers in the system</p>
          </div>
        </Card>
      </div>
    </div>

    <!-- Crop Plantings by Category Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sprout class="h-5 w-5 text-primary" />
        Crop Plantings by Category
      </h3>
      <Card class="overflow-hidden transition-all hover:shadow-lg">
        <div class="p-6">
          <div class="h-[300px]">
            <Bar v-if="processedChartData" :data="processedChartData" :options="barChartOptions" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Harvest Analytics Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <Scale class="h-5 w-5 text-primary" />
        Harvest Analytics
      </h3>

      <!-- Area Harvested Chart -->
      <Card class="overflow-hidden transition-all hover:shadow-lg mb-6">
        <div class="p-6">
          <h4 class="text-base font-medium mb-4">Area Harvested by Category (ha)</h4>
          <div class="h-[300px]">
            <Line
              v-if="harvestAnalyticsData"
              :data="harvestAnalyticsData.areaData"
              :options="lineChartOptions"
            />
          </div>
        </div>
      </Card>

      <!-- Total Yield Chart -->
      <Card class="overflow-hidden transition-all hover:shadow-lg">
        <div class="p-6">
          <h4 class="text-base font-medium mb-4">Total Yield by Category (kg)</h4>
          <div class="h-[300px]">
            <Line
              v-if="harvestAnalyticsData"
              :data="harvestAnalyticsData.yieldData"
              :options="lineChartOptions"
            />
          </div>
        </div>
      </Card>
    </div>

    <!-- Marinduque Heatmap Section -->
    <div v-if="stats?.analytics?.marinduque_heatmap" class="w-full overflow-hidden">
      <MarinduqueHeatmap :heatmap-data="stats.analytics.marinduque_heatmap" />
    </div>
  </div>
</template>

<style scoped>
/* Ensure no horizontal scrolling on mobile */
:deep(.leaflet-container) {
  max-width: 100%;
}
</style>
