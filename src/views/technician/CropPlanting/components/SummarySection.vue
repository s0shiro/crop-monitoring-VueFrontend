<script setup>
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  ChartBar,
  Loader2,
  AlertTriangle,
  Scale,
  Coins,
  CalendarClock,
  Calendar,
  CalendarCheck,
  CalendarCheck2,
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axios'

const props = defineProps({
  plantingId: {
    type: [String, Number],
    required: true,
  },
  planting: {
    type: Object,
    required: true,
  },
})

// Fetch summary data
const {
  data: summaryData,
  error: summaryError,
  isLoading: isLoadingSummary,
} = useQuery({
  queryKey: ['harvest-summary', props.plantingId],
  queryFn: async () => {
    const response = await axiosInstance.get(`/api/crop-plantings/${props.plantingId}/summary`)
    return response.data.data
  },
  enabled: computed(() => props.planting?.status === 'harvested'),
})
</script>

<template>
  <Card
    v-if="planting?.status === 'harvested'"
    class="lg:col-span-3 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-transparent border-border/50 hover:border-primary/20"
  >
    <CardHeader class="border-b bg-muted/5">
      <CardTitle class="flex items-center gap-2 text-lg">
        <ChartBar class="w-5 h-5 text-primary" />
        Harvest Summary
      </CardTitle>
    </CardHeader>

    <CardContent class="p-6">
      <!-- Loading State -->
      <div v-if="isLoadingSummary" class="flex justify-center py-8">
        <div class="flex flex-col items-center gap-2">
          <Loader2 class="w-8 h-8 animate-spin text-primary" />
          <span class="text-sm text-muted-foreground">Loading summary...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="summaryError" class="text-center py-8">
        <div class="flex flex-col items-center gap-2">
          <AlertTriangle class="w-8 h-8 text-destructive" />
          <p class="text-destructive font-medium">Failed to load harvest summary</p>
          <p class="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>

      <!-- Summary Content -->
      <div v-else-if="summaryData" class="space-y-6">
        <!-- Metrics Section -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            class="p-4 rounded-lg border border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 group/item hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center gap-2 mb-2">
              <Scale class="w-4 h-4 text-yellow-500" />
              <p class="text-sm text-muted-foreground">Total Yield</p>
            </div>
            <p class="text-2xl font-semibold text-yellow-600">
              {{ summaryData.metrics.total_yield }} kg
            </p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ summaryData.metrics.yield_per_hectare }} kg/ha
            </p>
          </div>

          <div
            class="p-4 rounded-lg border border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 group/item hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center gap-2 mb-2">
              <Coins class="w-4 h-4 text-green-500" />
              <p class="text-sm text-muted-foreground">Total Profit</p>
            </div>
            <p class="text-2xl font-semibold text-green-600">
              ₱{{ summaryData.metrics.total_profit.toLocaleString() }}
            </p>
            <p class="text-sm text-muted-foreground mt-1">
              ₱{{ summaryData.metrics.profit_per_hectare.toLocaleString() }}/ha
            </p>
          </div>
        </div>

        <!-- Duration Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <CalendarClock class="w-4 h-4 text-primary" />
            <h3 class="font-medium">Growing Period</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              class="p-4 rounded-lg border border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 group/item hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-center gap-2 mb-2">
                <Calendar class="w-4 h-4 text-blue-500" />
                <p class="text-sm text-muted-foreground">Planting Date</p>
              </div>
              <p class="font-medium text-blue-600">
                {{ format(new Date(summaryData.duration.planting_date), 'MMM d, yyyy') }}
              </p>
            </div>
            <div
              class="p-4 rounded-lg border border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 group/item hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-center gap-2 mb-2">
                <CalendarCheck class="w-4 h-4 text-orange-500" />
                <p class="text-sm text-muted-foreground">Expected Completion</p>
              </div>
              <p class="font-medium text-orange-600">
                {{ format(new Date(summaryData.duration.expected_completion), 'MMM d, yyyy') }}
              </p>
            </div>
            <div
              class="p-4 rounded-lg border border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 group/item hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-center gap-2 mb-2">
                <CalendarCheck2 class="w-4 h-4 text-green-500" />
                <p class="text-sm text-muted-foreground">Actual Completion</p>
              </div>
              <p class="font-medium text-green-600">
                {{ format(new Date(summaryData.duration.actual_completion), 'MMM d, yyyy') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
