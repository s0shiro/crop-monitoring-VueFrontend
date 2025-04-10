<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

const associationName = ref('')
const associationDescription = ref('')
const showAddAssociationDialog = ref(false)

const { toast } = useToast()
const queryClient = useQueryClient()

const {
  data: associations,
  isLoading,
  isError,
} = useQuery({
  queryKey: ['associations'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/associations')
    return response.data
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to load associations.',
    })
  },
})

const { mutate: createAssociationMutation, isPending: isCreatingAssociation } = useMutation({
  mutationFn: async (newAssociation) => {
    return await axiosInstance.post('/api/associations', newAssociation)
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Association created successfully.',
    })
    associationName.value = ''
    associationDescription.value = ''
    showAddAssociationDialog.value = false
    queryClient.invalidateQueries(['associations'])
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to create association.',
    })
  },
})

const createAssociation = () => {
  createAssociationMutation({
    name: associationName.value,
    description: associationDescription.value,
  })
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-extrabold text-primary">Associations Management</h1>
      <Button @click="showAddAssociationDialog = true" variant="default"> Add Association </Button>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <div
        class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"
      ></div>
      <p class="mt-2 text-muted-foreground">Loading associations...</p>
    </div>

    <div v-else-if="isError" class="text-center py-8 text-destructive">
      Failed to load associations. Please try again later.
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="association in associations"
          :key="association.id"
          class="flex flex-col items-start p-4 shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 class="text-xl font-bold text-primary">{{ association.name }}</h2>
          <p class="text-sm text-muted-foreground">{{ association.description }}</p>
          <div class="flex items-center mt-2 space-x-2">
            <p class="text-xs text-muted-foreground">
              Added on
              {{
                new Date(association.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}
            </p>
            <span class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
              {{ association.farmers_count }} Farmer{{ association.farmers_count !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Association Dialog -->
    <Dialog :open="showAddAssociationDialog" @update:open="showAddAssociationDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-lg font-semibold text-primary">Add Association</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <label for="association-name" class="block text-sm font-medium text-muted-foreground">
              Association Name
            </label>
            <Input
              id="association-name"
              v-model="associationName"
              placeholder="Enter association name"
              class="border-muted focus:ring-primary rounded-lg"
            />
          </div>
          <div>
            <label
              for="association-description"
              class="block text-sm font-medium text-muted-foreground"
            >
              Description
            </label>
            <Input
              id="association-description"
              v-model="associationDescription"
              placeholder="Enter description"
              class="border-muted focus:ring-primary rounded-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showAddAssociationDialog = false" class="rounded-lg">
            Cancel
          </Button>
          <Button
            @click="createAssociation"
            :disabled="isCreatingAssociation"
            class="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-md"
          >
            <template v-if="isCreatingAssociation">Creating...</template>
            <template v-else>Create Association</template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
