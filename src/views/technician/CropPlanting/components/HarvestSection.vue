<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import { Wheat, AlertCircle, Plus, Calendar, User, Loader2, Scale, Coins } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
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

const { toast } = useToast()
const queryClient = useQueryClient()

// Harvest dialog state
const showHarvestDialog = ref(false)
const validationErrors = ref({})

// Harvest form data
const harvestForm = ref({
  harvest_date: format(new Date(), 'yyyy-MM-dd'),
  area_harvested: '',
  total_yield: '',
  profit: '',
  damage_quantity: '',
  remarks: '',
})

// Fetch harvests
const {
  data: harvestsData,
  error: harvestsError,
  fetchNextPage: fetchNextHarvests,
  hasNextPage: hasNextHarvestsPage,
  isFetchingNextPage: isFetchingNextHarvests,
  isLoading: isLoadingHarvests,
} = useInfiniteQuery({
  queryKey: ['harvests', props.plantingId],
  queryFn: async ({ pageParam = 0 }) => {
    const response = await axiosInstance.get(`/api/crop-plantings/${props.plantingId}/harvests`, {
      params: { cursor: pageParam },
    })
    return response.data
  },
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Create harvest mutation
const { mutate: createHarvest, isPending: isCreatingHarvest } = useMutation({
  mutationFn: async (data) => {
    const response = await axiosInstance.post('/api/harvest-reports', {
      crop_planting_id: props.plantingId,
      ...data,
    })
    return response.data
  },
  onSuccess: (data) => {
    toast({
      title: 'Success',
      description: data.message,
    })
    showHarvestDialog.value = false
    harvestForm.value = {
      harvest_date: format(new Date(), 'yyyy-MM-dd'),
      area_harvested: '',
      total_yield: '',
      profit: '',
      damage_quantity: '',
      remarks: '',
    }
    validationErrors.value = {}
    queryClient.invalidateQueries(['harvests', props.plantingId])
    queryClient.invalidateQueries(['planting', props.plantingId])
  },
  onError: (error) => {
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create harvest report.',
      })
    }
  },
})

const handleHarvestSubmit = () => {
  validationErrors.value = {}
  createHarvest({
    harvest_date: harvestForm.value.harvest_date,
    area_harvested: parseFloat(harvestForm.value.area_harvested),
    total_yield: parseFloat(harvestForm.value.total_yield),
    profit: harvestForm.value.profit ? parseFloat(harvestForm.value.profit) : null,
    damage_quantity: harvestForm.value.damage_quantity
      ? parseFloat(harvestForm.value.damage_quantity)
      : null,
    remarks: harvestForm.value.remarks,
  })
}
</script>

<template>
  <Card
    class="lg:col-span-3 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500/5 to-transparent border-border/50 hover:border-primary/20"
  >
    <CardHeader class="border-b bg-muted/5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <Wheat class="w-5 h-5 text-primary" />
            <CardTitle class="text-lg">Harvest Reports</CardTitle>
          </div>
          <Badge variant="outline" class="bg-green-500/10 text-green-600 border-green-200/20">
            {{ planting?.remaining_area }} ha remaining
          </Badge>
        </div>
        <Button
          v-if="planting?.status === 'harvest' || planting?.status === 'partially harvested'"
          @click="showHarvestDialog = true"
          variant="default"
          class="gap-2 whitespace-nowrap bg-primary hover:bg-primary/90 text-white"
        >
          <Plus class="w-4 h-4" />
          Add Harvest Report
        </Button>
      </div>
    </CardHeader>

    <CardContent class="p-6">
      <!-- Loading State -->
      <div v-if="isLoadingHarvests" class="flex justify-center py-8">
        <div class="flex flex-col items-center gap-2">
          <Loader2 class="w-8 h-8 animate-spin text-primary" />
          <span class="text-sm text-muted-foreground">Loading harvest reports...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="harvestsError" class="text-center py-8">
        <div class="flex flex-col items-center gap-2">
          <AlertCircle class="w-8 h-8 text-destructive" />
          <p class="text-destructive font-medium">Failed to load harvest reports</p>
          <p class="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!harvestsData?.pages[0]?.data?.length" class="text-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="p-3 rounded-full bg-muted/10 w-fit">
            <Wheat class="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p class="text-muted-foreground">No harvest reports recorded yet.</p>
        </div>
      </div>

      <!-- Harvests List -->
      <div v-else class="space-y-4">
        <div
          v-for="harvest in harvestsData?.pages.flatMap((page) => page.data)"
          :key="harvest.id"
          class="group/item p-4 rounded-lg border border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-all duration-200"
        >
          <div class="flex flex-col gap-4">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-primary" />
                <span class="font-medium text-lg text-primary">
                  {{ format(new Date(harvest.harvest_date), 'MMMM d, yyyy') }}
                </span>
              </div>
              <Badge
                variant="outline"
                class="bg-primary/10 text-primary whitespace-nowrap border-primary/20"
              >
                {{ harvest.area_harvested }} ha harvested
              </Badge>
            </div>

            <!-- Harvest Details -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <Scale class="w-4 h-4 text-yellow-500" />
                <div>
                  <p class="text-sm text-muted-foreground">Total Yield</p>
                  <p class="font-semibold">{{ harvest.total_yield }} kg</p>
                </div>
              </div>
              <div
                class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <Coins class="w-4 h-4 text-green-500" />
                <div>
                  <p class="text-sm text-muted-foreground">Profit</p>
                  <p class="font-semibold">₱{{ harvest.profit.toLocaleString() }}</p>
                </div>
              </div>
              <div
                v-if="harvest.damage_quantity"
                class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <AlertCircle class="w-4 h-4 text-destructive" />
                <div>
                  <p class="text-sm text-muted-foreground">Damaged</p>
                  <p class="font-semibold">{{ harvest.damage_quantity }} kg</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
              <User class="w-3 h-3" />
              <span>Recorded by {{ harvest.technician.name }}</span>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="hasNextHarvestsPage" class="flex justify-center mt-6">
          <Button
            variant="outline"
            @click="fetchNextHarvests"
            :disabled="isFetchingNextHarvests"
            class="min-w-[200px] gap-2 hover:bg-primary/5"
          >
            <template v-if="isFetchingNextHarvests">
              <Loader2 class="w-4 h-4 animate-spin" />
              Loading...
            </template>
            <template v-else>
              <span>Load More</span>
              <Wheat class="w-4 h-4" />
            </template>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Add Harvest Dialog -->
  <Dialog :open="showHarvestDialog" @update:open="showHarvestDialog = $event">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-lg">
          <Wheat class="w-5 h-5 text-primary" />
          Add Harvest Report
        </DialogTitle>
        <DialogDescription>
          Record a new harvest report for this crop planting. The harvested area will be deducted
          from the remaining area.
        </DialogDescription>
      </DialogHeader>

      <Form>
        <div class="space-y-4">
          <FormField name="harvest_date">
            <FormItem>
              <FormLabel>Harvest Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  v-model="harvestForm.harvest_date"
                  :max="format(new Date(), 'yyyy-MM-dd')"
                  :class="{ 'border-destructive': validationErrors.harvest_date }"
                />
              </FormControl>
              <FormMessage class="text-destructive" v-if="validationErrors.harvest_date">
                {{ validationErrors.harvest_date[0] }}
              </FormMessage>
            </FormItem>
          </FormField>

          <FormField name="area_harvested">
            <FormItem>
              <FormLabel>Area Harvested (hectares)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  v-model="harvestForm.area_harvested"
                  placeholder="0.00"
                  :max="planting?.remaining_area"
                  step="0.01"
                  :class="{ 'border-destructive': validationErrors.area_harvested }"
                />
              </FormControl>
              <FormMessage class="text-destructive" v-if="validationErrors.area_harvested">
                {{ validationErrors.area_harvested[0] }}
              </FormMessage>
              <FormDescription>
                Cannot exceed remaining area:
                <span class="font-bold text-green-600">{{ planting?.remaining_area }} ha</span>
              </FormDescription>
            </FormItem>
          </FormField>

          <FormField name="total_yield">
            <FormItem>
              <FormLabel>Total Yield (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  v-model="harvestForm.total_yield"
                  placeholder="0.00"
                  step="0.01"
                  :class="{ 'border-destructive': validationErrors.total_yield }"
                />
              </FormControl>
              <FormMessage class="text-destructive" v-if="validationErrors.total_yield">
                {{ validationErrors.total_yield[0] }}
              </FormMessage>
            </FormItem>
          </FormField>

          <FormField name="profit">
            <FormItem>
              <FormLabel>Profit (₱)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  v-model="harvestForm.profit"
                  placeholder="0.00"
                  step="0.01"
                  :class="{ 'border-destructive': validationErrors.profit }"
                />
              </FormControl>
              <FormMessage class="text-destructive" v-if="validationErrors.profit">
                {{ validationErrors.profit[0] }}
              </FormMessage>
            </FormItem>
          </FormField>

          <FormField name="damage_quantity">
            <FormItem>
              <FormLabel>Damaged Quantity (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  v-model="harvestForm.damage_quantity"
                  placeholder="0.00"
                  step="0.01"
                  :class="{ 'border-destructive': validationErrors.damage_quantity }"
                />
              </FormControl>
              <FormMessage class="text-destructive" v-if="validationErrors.damage_quantity">
                {{ validationErrors.damage_quantity[0] }}
              </FormMessage>
            </FormItem>
          </FormField>

          <FormField name="remarks">
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea
                  v-model="harvestForm.remarks"
                  placeholder="Add any additional notes about the harvest..."
                  :class="{ 'border-destructive': validationErrors.remarks }"
                />
              </FormControl>
              <FormMessage class="text-destructive" v-if="validationErrors.remarks">
                {{ validationErrors.remarks[0] }}
              </FormMessage>
            </FormItem>
          </FormField>
        </div>
      </Form>

      <DialogFooter class="mt-4">
        <Button variant="ghost" @click="showHarvestDialog = false" class="hover:bg-muted/10"
          >Cancel</Button
        >
        <Button
          type="submit"
          :disabled="isCreatingHarvest"
          @click="handleHarvestSubmit"
          class="bg-primary hover:bg-primary/90 text-white gap-2"
        >
          <Loader2 v-if="isCreatingHarvest" class="h-4 w-4 animate-spin" />
          {{ isCreatingHarvest ? 'Adding...' : 'Add Harvest Report' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
