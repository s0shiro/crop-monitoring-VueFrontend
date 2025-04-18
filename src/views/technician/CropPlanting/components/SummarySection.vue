<script setup>
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast/use-toast'
import { Loader2, ChartBar, CalendarClock } from 'lucide-vue-next'
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
    class="lg:col-span-3 group hover:shadow-md transition-shadow"
  >
    <CardHeader class="border-b">
      <CardTitle class="flex items-center gap-2 text-lg">
        <ChartBar class="w-5 h-5 text-primary" />
        Harvest Summary
      </CardTitle>
    </CardHeader>

    <CardContent class="p-6">
      <!-- Loading State -->
      <div v-if="isLoadingSummary" class="flex justify-center py-8">
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
      </div>

      <!-- Error State -->
      <div v-else-if="summaryError" class="text-center text-destructive py-8">
        <p>Failed to load harvest summary.</p>
      </div>

      <!-- Summary Content -->
      <div v-else-if="summaryData" class="space-y-6">
        <!-- Metrics Section -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-lg border group/item hover:bg-muted/50 transition-colors">
            <p class="text-sm text-muted-foreground">Total Yield</p>
            <p class="mt-1 text-2xl font-semibold">{{ summaryData.metrics.total_yield }} kg</p>
            <p class="text-sm text-muted-foreground mt-1">
              {{ summaryData.metrics.yield_per_hectare }} kg/ha
            </p>
          </div>

          <div class="p-4 rounded-lg border group/item hover:bg-muted/50 transition-colors">
            <p class="text-sm text-muted-foreground">Total Profit</p>
            <p class="mt-1 text-2xl font-semibold">
              ₱{{ summaryData.metrics.total_profit.toLocaleString() }}
            </p>
            <p class="text-sm text-muted-foreground mt-1">
              ₱{{ summaryData.metrics.profit_per_hectare.toLocaleString() }}/ha
            </p>
          </div>
        </div>

        <!-- Duration Section -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <CalendarClock class="w-4 h-4 text-muted-foreground" />
            <h3 class="font-medium">Growing Period</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-lg border">
              <p class="text-sm text-muted-foreground">Planting Date</p>
              <p class="mt-1 font-medium">
                {{ format(new Date(summaryData.duration.planting_date), 'MMM d, yyyy') }}
              </p>
            </div>
            <div class="p-4 rounded-lg border">
              <p class="text-sm text-muted-foreground">Expected Completion</p>
              <p class="mt-1 font-medium">
                {{ format(new Date(summaryData.duration.expected_completion), 'MMM d, yyyy') }}
              </p>
            </div>
            <div class="p-4 rounded-lg border">
              <p class="text-sm text-muted-foreground">Actual Completion</p>
              <p class="mt-1 font-medium">
                {{ format(new Date(summaryData.duration.actual_completion), 'MMM d, yyyy') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
