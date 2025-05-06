<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Users, CalendarDays, Building2 } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'

const associationName = ref('')
const associationDescription = ref('')
const showAddAssociationDialog = ref(false)

const { toast } = useToast()
const queryClient = useQueryClient()

const fetchAssociations = async ({ pageParam = 0 }) => {
  const response = await axiosInstance.get('/api/associations', {
    params: { cursor: pageParam },
  })
  return response.data
}

const {
  data: associationsData,
  error: associationsError,
  fetchNextPage,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  isPending: isLoadingAssociations,
} = useInfiniteQuery({
  queryKey: ['associations'],
  queryFn: fetchAssociations,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
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
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3"
    >
      <div class="flex items-center gap-3">
        <Building2 class="h-8 w-8 text-primary shrink-0" />
        <h1 class="text-2xl sm:text-3xl font-extrabold text-primary break-words">
          Associations Management
        </h1>
      </div>
      <Button
        @click="showAddAssociationDialog = true"
        variant="default"
        class="gap-2 whitespace-nowrap"
      >
        <Users class="h-4 w-4" />
        Add Association
      </Button>
    </div>

    <Loading v-if="isLoadingAssociations">Loading associations...</Loading>

    <div v-else-if="associationsError" class="text-center py-8 text-destructive">
      Failed to load associations. Please try again later.
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-for="page in associationsData.pages" :key="page.nextCursor">
          <div
            v-for="association in page.data"
            :key="association.id"
            class="group flex flex-col items-start p-6 hover:shadow-lg transition-all duration-300 rounded-lg border border-border/50 hover:border-primary/20 bg-gradient-to-br from-background to-muted/20"
          >
            <div class="flex justify-between w-full">
              <div class="flex items-start gap-3">
                <Building2 class="h-5 w-5 text-primary mt-1" />
                <div>
                  <h2 class="text-xl font-bold text-primary">{{ association.name }}</h2>
                  <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {{ association.description }}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    class="p-2 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal class="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56">
                  <RouterLink :to="{ name: 'association-details', params: { id: association.id } }">
                    <DropdownMenuItem> View Details </DropdownMenuItem>
                  </RouterLink>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div class="flex items-center gap-4 mt-4 w-full">
              <div class="flex items-center gap-2">
                <Users class="h-4 w-4 text-blue-500" />
                <p class="text-sm text-muted-foreground">
                  <span class="font-semibold text-foreground">{{ association.farmers_count }}</span>
                  {{ association.farmers_count !== 1 ? 'Farmers' : 'Farmer' }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <CalendarDays class="h-4 w-4 text-green-500" />
                <p class="text-sm text-muted-foreground">
                  {{
                    new Date(association.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="text-center mt-6">
        <Button
          v-if="hasNextPage && !isFetchingNextPage"
          @click="fetchNextPage"
          variant="default"
          class="rounded-lg gap-2"
        >
          <span>Load More</span>
          <Users class="h-4 w-4" />
        </Button>
        <div v-else-if="isFetchingNextPage" class="text-muted-foreground italic">
          Loading more...
        </div>
      </div>
    </div>

    <!-- Add Association Dialog -->
    <Dialog :open="showAddAssociationDialog" @update:open="showAddAssociationDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-lg font-semibold text-primary">
            <Building2 class="h-5 w-5" />
            Add Association
          </DialogTitle>
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
            class="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-md gap-2"
          >
            <Users class="h-4 w-4" />
            <template v-if="isCreatingAssociation">Creating...</template>
            <template v-else>Create Association</template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
