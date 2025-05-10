<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast/use-toast'
import { AlertTriangleIcon, UserIcon, Loader2 } from 'lucide-vue-next'
import axiosInstance from '@/lib/axios'
import { useMutation } from '@tanstack/vue-query'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  farmer: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isOpen', 'farmer-deleted'])

const { toast } = useToast()
const isDeleting = ref(false)

// Delete farmer mutation
const { mutate: deleteFarmer } = useMutation({
  mutationFn: async () => {
    return await axiosInstance.delete(`/api/farmers/${props.farmer.id}`)
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Farmer deleted successfully.',
    })
    emit('farmer-deleted')
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete farmer.',
    })
  },
  onSettled: () => {
    isDeleting.value = false
    emit('update:isOpen', false)
  },
})

const handleDelete = () => {
  isDeleting.value = true
  deleteFarmer()
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-[425px] overflow-hidden">
      <DialogHeader class="space-y-3">
        <DialogTitle class="flex items-center gap-2 text-lg font-semibold text-destructive">
          <AlertTriangleIcon class="h-5 w-5" />
          Delete Farmer Record
        </DialogTitle>
        <DialogDescription>
          <p class="text-sm text-muted-foreground">
            Are you sure you want to delete this farmer's record? This action cannot be undone and
            will also delete:
          </p>
          <ul class="mt-2 ml-4 list-disc text-sm space-y-1 text-muted-foreground">
            <li>All crop planting records</li>
            <li>All inspection reports</li>
            <li>All harvest records</li>
          </ul>
        </DialogDescription>
      </DialogHeader>

      <div class="my-6 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-full bg-destructive/10">
            <UserIcon class="h-6 w-6 text-destructive" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-destructive truncate">{{ farmer?.name }}</h4>
            <p class="text-sm text-destructive/70 truncate">
              {{ farmer?.municipality }}, {{ farmer?.barangay }}
            </p>
          </div>
        </div>
      </div>

      <DialogFooter class="sm:justify-end">
        <div class="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-2">
          <Button
            variant="outline"
            class="flex-1 sm:flex-initial"
            @click="emit('update:isOpen', false)"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            class="flex-1 sm:flex-initial gap-2 min-w-[100px]"
            :disabled="isDeleting"
            @click="handleDelete"
          >
            <Loader2 v-if="isDeleting" class="h-4 w-4 animate-spin" />
            {{ isDeleting ? 'Deleting...' : 'Delete Farmer' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
