<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import axiosInstance from '@/lib/axios'
import {
  ChevronLeft,
  User,
  Users2,
  Mail,
  CalendarDays,
  UserCircle,
  Wheat,
  ClipboardList,
  ActivitySquare,
  PieChart,
  MessageSquare,
  Scale,
  DollarSign,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const {
  data: technicianData,
  error: technicianError,
  isLoading: isLoadingTechnician,
} = useQuery({
  queryKey: ['technician-details', route.params.id],
  queryFn: async () => {
    const response = await axiosInstance.get(`/api/technicians/${route.params.id}/details`)
    return response.data
  },
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon" @click="router.back()">
          <ChevronLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-primary">Technician Details</h1>
          <p class="text-sm text-muted-foreground mt-1">View detailed statistics and activity</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingTechnician" class="flex justify-center py-8">
      <Loading>Loading technician details...</Loading>
    </div>

    <!-- Error State -->
    <div v-else-if="technicianError" class="text-center py-8 text-destructive">
      Failed to load technician details. Please try again later.
    </div>

    <!-- Content -->
    <div v-else-if="technicianData" class="grid gap-8">
      <!-- Basic Information Card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="h-5 w-5 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
              <div class="flex items-center gap-2">
                <UserCircle class="h-5 w-5 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Name:</span>
                <span class="font-medium">{{ technicianData.technician_info.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Mail class="h-5 w-5 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Email:</span>
                <span class="font-medium">{{ technicianData.technician_info.email }}</span>
              </div>
              <div class="flex items-center gap-2">
                <CalendarDays class="h-5 w-5 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Joined:</span>
                <span class="font-medium">
                  {{ new Date(technicianData.technician_info.joined_date).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Overview Stats Grid -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Farmers Handled -->
        <Card class="hover:shadow-lg transition-all duration-200">
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-500/10 rounded-lg">
                <Users2 class="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Farmers Handled</p>
                <p class="text-2xl font-bold">{{ technicianData.overview.farmers_handled }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Active Plantings -->
        <Card class="hover:shadow-lg transition-all duration-200">
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-500/10 rounded-lg">
                <Wheat class="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Active Plantings</p>
                <p class="text-2xl font-bold">{{ technicianData.overview.active_plantings }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Monthly Inspections -->
        <Card class="hover:shadow-lg transition-all duration-200">
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-orange-500/10 rounded-lg">
                <ClipboardList class="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Monthly Inspections</p>
                <p class="text-2xl font-bold">{{ technicianData.overview.monthly_inspections }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Monthly Harvests -->
        <Card class="hover:shadow-lg transition-all duration-200">
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-500/10 rounded-lg">
                <ActivitySquare class="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Monthly Harvests</p>
                <p class="text-2xl font-bold">{{ technicianData.overview.monthly_harvests }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Crop Distribution -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <PieChart class="h-5 w-5 text-primary" />
            Crop Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div
              v-for="(crops, category) in technicianData.crop_distribution"
              :key="category"
              class="space-y-4"
            >
              <h3 class="font-semibold text-lg">{{ category }}</h3>
              <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div
                  v-for="(stats, cropName) in crops"
                  :key="cropName"
                  class="p-4 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                >
                  <div class="flex flex-col gap-2">
                    <h4 class="font-medium">{{ cropName }}</h4>
                    <div class="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Count:</span>
                      <span class="font-medium text-foreground">{{ stats.count }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Total Area:</span>
                      <span class="font-medium text-foreground">{{ stats.total_area }} ha</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Performance Metrics -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <ActivitySquare class="h-5 w-5 text-primary" />
            Monthly Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div class="p-4 rounded-lg border">
              <div class="flex items-center gap-2 mb-2">
                <Scale class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Average Yield</span>
              </div>
              <p class="text-2xl font-bold">
                {{ technicianData.performance_metrics.monthly_stats.average_yield }}
              </p>
            </div>

            <div class="p-4 rounded-lg border">
              <div class="flex items-center gap-2 mb-2">
                <Scale class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Total Yield</span>
              </div>
              <p class="text-2xl font-bold">
                {{ technicianData.performance_metrics.monthly_stats.total_yield }}
              </p>
            </div>

            <div class="p-4 rounded-lg border">
              <div class="flex items-center gap-2 mb-2">
                <DollarSign class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Average Profit</span>
              </div>
              <p class="text-2xl font-bold">
                ₱{{ technicianData.performance_metrics.monthly_stats.average_profit }}
              </p>
            </div>

            <div class="p-4 rounded-lg border">
              <div class="flex items-center gap-2 mb-2">
                <ClipboardList class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Harvest Count</span>
              </div>
              <p class="text-2xl font-bold">
                {{ technicianData.performance_metrics.monthly_stats.harvest_count }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Activity -->
      <div class="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <!-- Recent Inspections -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <ClipboardList class="h-5 w-5 text-primary" />
              Recent Inspections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="inspection in technicianData.recent_activity.inspections"
                :key="inspection.date"
                class="p-4 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="font-medium">{{ inspection.farmer_name }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ new Date(inspection.date).toLocaleDateString() }}
                    </p>
                  </div>
                  <Badge variant="outline" class="bg-destructive/10 text-destructive">
                    {{ inspection.damaged_area }} ha damaged
                  </Badge>
                </div>
                <div class="flex items-start gap-2 mt-2">
                  <MessageSquare class="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p class="text-sm text-muted-foreground">{{ inspection.remarks }}</p>
                </div>
              </div>
              <div
                v-if="technicianData.recent_activity.inspections.length === 0"
                class="text-center py-4 text-muted-foreground"
              >
                No recent inspections
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Harvests -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Wheat class="h-5 w-5 text-primary" />
              Recent Harvests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="harvest in technicianData.recent_activity.harvests"
                :key="harvest.date"
                class="p-4 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="font-medium">{{ harvest.farmer_name }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ new Date(harvest.date).toLocaleDateString() }}
                    </p>
                  </div>
                  <Badge variant="outline" class="bg-primary/10 text-primary">
                    {{ harvest.area_harvested }} ha
                  </Badge>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-2">
                  <div class="flex items-center gap-2">
                    <Scale class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm text-muted-foreground">Yield:</span>
                    <span class="text-sm font-medium">{{ harvest.total_yield }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <DollarSign class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm text-muted-foreground">Profit:</span>
                    <span class="text-sm font-medium">₱{{ harvest.profit }}</span>
                  </div>
                </div>
              </div>
              <div
                v-if="technicianData.recent_activity.harvests.length === 0"
                class="text-center py-4 text-muted-foreground"
              >
                No recent harvests
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
