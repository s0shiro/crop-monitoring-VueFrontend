<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast/use-toast'
import axiosInstance from '@/lib/axios'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { User, Users, MoreHorizontal, Eye, CalendarDays, Search } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useUtilsStore } from '@/stores/utils'

const router = useRouter()
const { toast } = useToast()
const utilsStore = useUtilsStore()
const searchQuery = ref('')

// Fetch technicians query
const {
  data: techniciansData,
  isLoading,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['my-technicians', searchQuery],
  queryFn: async ({ pageParam = 0 }) => {
    const { data } = await axiosInstance.get('/api/my-technicians', {
      params: {
        cursor: pageParam,
        search: searchQuery.value,
      },
    })
    return data
  },
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// View technician details
function viewTechnicianDetails(technician) {
  router.push({ name: 'user-details', params: { id: technician.id } })
}

// Use debounce from store for search
const debounceSearch = utilsStore.debounce(
  () => {
    // The query will automatically refresh due to searchQuery being in the queryKey
  },
  300,
  'technicianSearch',
)
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-full bg-primary/10">
          <Users class="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-primary">My Technicians</h1>
          <p class="text-sm text-muted-foreground mt-1">
            View and manage your assigned technicians
          </p>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search technicians..."
            class="pl-9 w-full"
            @input="debounceSearch"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
      Loading technicians...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8 text-destructive">
      Failed to load technicians. Please try again later.
    </div>

    <!-- Empty State -->
    <div
      v-else-if="
        !techniciansData?.pages ||
        techniciansData.pages.length === 0 ||
        !techniciansData.pages.some((page) => page.data?.length > 0)
      "
      class="min-h-[400px] flex flex-col items-center justify-center text-center"
    >
      <div class="p-4 rounded-full bg-muted">
        <Users class="h-8 w-8 text-muted-foreground" />
      </div>
      <p class="mt-4 text-lg font-medium text-muted-foreground">No technicians assigned</p>
    </div>

    <!-- Technicians Grid -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-for="page in techniciansData.pages" :key="page.nextCursor">
          <Card
            v-for="technician in page.data"
            :key="technician.id"
            class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/20"
          >
            <CardContent class="p-6">
              <div class="flex justify-between items-start">
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-full bg-primary/10">
                    <User class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-foreground">{{ technician.name }}</h3>
                    <p class="text-sm text-muted-foreground">@{{ technician.username }}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      class="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      @click="viewTechnicianDetails(technician)"
                      class="cursor-pointer"
                    >
                      <Eye class="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div class="mt-4 space-y-3">
                <div class="flex items-center gap-2">
                  <CalendarDays class="w-4 h-4 text-orange-500" />
                  <p class="text-sm text-muted-foreground">
                    Joined
                    {{
                      new Date(technician.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </template>
      </div>

      <!-- Load More Button -->
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
  </div>
</template>
