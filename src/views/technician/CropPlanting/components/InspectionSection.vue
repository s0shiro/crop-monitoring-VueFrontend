<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import { useUserAuth } from '@/composables/useUserAuth'
import {
  ClipboardListIcon,
  AlertCircleIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  Loader2Icon,
  XIcon,
} from 'lucide-vue-next'
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
const { hasPermission } = useUserAuth()

// Inspection dialog state
const showInspectionDialog = ref(false)
const validationErrors = ref({})

// Inspection form data
const inspectionForm = ref({
  inspection_date: format(new Date(), 'yyyy-MM-dd'),
  remarks: '',
  damaged_area: '',
})

// Fetch inspections
const {
  data: inspectionsData,
  error: inspectionsError,
  fetchNextPage: fetchNextInspections,
  hasNextPage: hasNextInspectionsPage,
  isFetchingNextPage: isFetchingNextInspections,
  isLoading: isLoadingInspections,
} = useInfiniteQuery({
  queryKey: ['inspections', props.plantingId],
  queryFn: async ({ pageParam = 0 }) => {
    const response = await axiosInstance.get(
      `/api/crop-plantings/${props.plantingId}/inspections`,
      {
        params: { cursor: pageParam },
      },
    )
    return response.data
  },
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Create inspection mutation
const { mutate: createInspection, isPending: isCreatingInspection } = useMutation({
  mutationFn: async (data) => {
    const response = await axiosInstance.post('/api/crop-inspections', {
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
    showInspectionDialog.value = false
    inspectionForm.value = {
      inspection_date: format(new Date(), 'yyyy-MM-dd'),
      remarks: '',
      damaged_area: '',
    }
    validationErrors.value = {}
    queryClient.invalidateQueries(['inspections', props.plantingId])
  },
  onError: (error) => {
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create inspection record.',
      })
    }
  },
})

const handleInspectionSubmit = () => {
  validationErrors.value = {}
  createInspection({
    inspection_date: inspectionForm.value.inspection_date,
    remarks: inspectionForm.value.remarks,
    damaged_area: parseFloat(inspectionForm.value.damaged_area),
  })
}
</script>

<template>
  <Card
    class="lg:col-span-3 group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20 hover:bg-primary/5"
  >
    <CardHeader class="border-b">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ClipboardListIcon class="w-5 h-5 text-primary" />
            <CardTitle class="text-lg">Inspections</CardTitle>
          </div>
          <Button
            v-if="planting?.status === 'standing' && hasPermission('create_inspections')"
            @click="showInspectionDialog = true"
            variant="default"
            class="gap-2 whitespace-nowrap"
          >
            <PlusIcon class="w-4 h-4" />
            Add Inspection
          </Button>
        </div>
        <div v-if="planting?.damaged_area > 0" class="flex items-center gap-2">
          <Badge variant="outline" class="bg-destructive/10 text-destructive whitespace-nowrap">
            Total damaged area: {{ planting?.damaged_area }} ha
          </Badge>
        </div>
      </div>
    </CardHeader>

    <CardContent class="p-6">
      <!-- Loading State -->
      <div v-if="isLoadingInspections" class="flex justify-center py-8">
        <Loader2Icon class="w-8 h-8 animate-spin text-primary" />
      </div>

      <!-- Error State -->
      <div v-else-if="inspectionsError" class="text-center text-destructive py-8">
        <AlertCircleIcon class="w-6 h-6 mx-auto mb-2" />
        <p>Failed to load inspections.</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!inspectionsData?.pages[0]?.data?.length"
        class="text-center text-muted-foreground py-8"
      >
        No inspections recorded yet.
      </div>

      <!-- Inspections List -->
      <div v-else class="space-y-4">
        <div
          v-for="inspection in inspectionsData?.pages.flatMap((page) => page.data)"
          :key="inspection.id"
          class="group/item p-4 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-primary/5 transition-all duration-200"
        >
          <div class="flex flex-col gap-4">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2">
                <CalendarIcon class="w-4 h-4 text-primary" />
                <span class="font-medium text-lg text-primary">
                  {{ format(new Date(inspection.inspection_date), 'MMMM d, yyyy') }}
                </span>
              </div>
              <Badge variant="outline" class="bg-destructive/10 text-destructive whitespace-nowrap">
                {{ inspection.damaged_area }} ha damaged
              </Badge>
            </div>

            <!-- Remarks -->
            <div class="p-3 rounded-lg bg-muted/50">
              <p class="text-sm text-muted-foreground">{{ inspection.remarks }}</p>
            </div>

            <!-- Footer -->
            <div class="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <UserIcon class="w-3 h-3" />
              <span>Inspected by {{ inspection.technician.name }}</span>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="hasNextInspectionsPage" class="flex justify-center mt-6">
          <Button
            variant="outline"
            @click="fetchNextInspections"
            :disabled="isFetchingNextInspections"
            class="min-w-[200px] gap-2"
          >
            <template v-if="isFetchingNextInspections">
              <Loader2Icon class="w-4 h-4 animate-spin" />
              Loading...
            </template>
            <template v-else>
              <span>Load More</span>
              <ClipboardListIcon class="w-4 h-4" />
            </template>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Add Inspection Dialog -->
  <Dialog :open="showInspectionDialog" @update:open="showInspectionDialog = $event">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Inspection</DialogTitle>
        <DialogDescription>
          Record a new inspection for this crop planting. The damaged area will be deducted from the
          remaining area.
        </DialogDescription>
      </DialogHeader>

      <Form>
        <div class="space-y-4">
          <FormField name="inspection_date">
            <FormItem>
              <FormLabel>Inspection Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  v-model="inspectionForm.inspection_date"
                  :max="format(new Date(), 'yyyy-MM-dd')"
                  :class="{ 'border-destructive': validationErrors.inspection_date }"
                />
              </FormControl>
              <FormMessage class="text-destructive" v-if="validationErrors.inspection_date">
                {{ validationErrors.inspection_date[0] }}
              </FormMessage>
            </FormItem>
          </FormField>

          <FormField name="damaged_area">
            <FormItem>
              <FormLabel>Damaged Area (hectares)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  v-model="inspectionForm.damaged_area"
                  placeholder="0.00"
                  :max="planting?.remaining_area"
                  step="0.01"
                  :class="{ 'border-destructive': validationErrors.damaged_area }"
                />
              </FormControl>
              <FormMessage class="text-destructive" v-if="validationErrors.damaged_area">
                {{ validationErrors.damaged_area[0] }}
              </FormMessage>
              <FormDescription>
                Cannot exceed remaining area:
                <span class="font-bold text-green-600">{{ planting?.remaining_area }} ha</span>
              </FormDescription>
            </FormItem>
          </FormField>

          <FormField name="remarks">
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea
                  v-model="inspectionForm.remarks"
                  placeholder="Describe the current condition and any issues found..."
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

      <DialogFooter>
        <Button variant="ghost" @click="showInspectionDialog = false">Cancel</Button>
        <Button type="submit" :disabled="isCreatingInspection" @click="handleInspectionSubmit">
          <Loader2Icon v-if="isCreatingInspection" class="mr-2 h-4 w-4 animate-spin" />
          {{ isCreatingInspection ? 'Adding...' : 'Add Inspection' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
