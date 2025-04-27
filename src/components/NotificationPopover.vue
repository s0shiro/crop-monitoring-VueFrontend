<script setup>
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/api/notifications'
import { useToast } from '@/components/ui/toast/use-toast'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Loader2, Check, Trash2, MapPin, UserCircle2, Sprout, Ruler } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'vue-router'

const router = useRouter()
const queryClient = useQueryClient()
const { toast } = useToast()

// Fetch notifications with infinite scroll
const {
  data: notificationsData,
  error: notificationsError,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
} = useInfiniteQuery({
  queryKey: ['notifications'],
  queryFn: async ({ pageParam = null }) => {
    const response = await getNotifications(pageParam)
    return response
  },
  getNextPageParam: (lastPage) => lastPage.next_cursor,
  refetchInterval: 30000, // Refetch every 30 seconds
})

// Mark as read mutation
const { mutate: markAsReadMutation } = useMutation({
  mutationFn: markAsRead,
  onSuccess: () => {
    queryClient.invalidateQueries(['notifications'])
  },
})

// Mark all as read mutation
const { mutate: markAllAsReadMutation } = useMutation({
  mutationFn: markAllAsRead,
  onSuccess: () => {
    queryClient.invalidateQueries(['notifications'])
    toast({
      title: 'Success',
      description: 'All notifications marked as read',
    })
  },
})

// Delete notification mutation
const { mutate: deleteNotificationMutation } = useMutation({
  mutationFn: deleteNotification,
  onSuccess: () => {
    queryClient.invalidateQueries(['notifications'])
    toast({
      title: 'Success',
      description: 'Notification deleted',
    })
  },
})

const handleMarkAsRead = (id) => {
  markAsReadMutation(id)
}

const handleMarkAllAsRead = () => {
  markAllAsReadMutation()
}

const handleDelete = (id) => {
  deleteNotificationMutation(id)
}

const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

const navigateToCropPlanting = (id) => {
  router.push({ name: 'crop-planting-details', params: { id } })
}

const getTimeAgo = (date) => {
  const now = new Date()
  const createdAt = new Date(date)
  const diffInSeconds = Math.floor((now - createdAt) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="ghost" size="icon" class="relative">
        <Bell class="h-5 w-5" />
        <Badge
          v-if="notificationsData?.pages?.[0]?.unread_count"
          class="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full"
        >
          {{ notificationsData.pages[0].unread_count }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[380px] p-0" align="end">
      <div class="flex items-center justify-between border-b px-4 py-3">
        <div class="space-y-0.5">
          <h4 class="text-sm font-medium">Notifications</h4>
          <p class="text-xs text-muted-foreground">
            You have {{ notificationsData?.pages?.[0]?.unread_count || 0 }} unread notifications
          </p>
        </div>
        <Button
          v-if="notificationsData?.pages?.[0]?.unread_count"
          variant="ghost"
          size="sm"
          class="text-xs gap-1.5"
          @click="handleMarkAllAsRead"
        >
          <Check class="h-3.5 w-3.5" />
          Mark all read
        </Button>
      </div>
      <ScrollArea class="h-[400px]">
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <Loader2 class="h-6 w-6 animate-spin" />
        </div>
        <div v-else-if="notificationsError" class="p-4 text-center text-sm text-destructive">
          Failed to load notifications
        </div>
        <div
          v-else-if="
            !notificationsData?.pages ||
            notificationsData.pages.length === 0 ||
            notificationsData.pages.every((page) => page.notifications.length === 0)
          "
          class="p-4 text-center text-sm text-muted-foreground"
        >
          No notifications
        </div>
        <div v-else>
          <template v-for="page in notificationsData.pages" :key="page.next_cursor">
            <div
              v-for="notification in page.notifications"
              :key="notification.id"
              class="relative flex flex-col gap-2 border-b p-4 hover:bg-muted/50 transition-colors"
              :class="{ 'bg-muted/30': !notification.read_at }"
              role="button"
              @click="navigateToCropPlanting(notification.data.crop_planting_id)"
            >
              <!-- Top row with time and actions -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">
                  {{ getTimeAgo(notification.created_at) }}
                </span>
                <div class="flex items-center gap-1">
                  <Button
                    v-if="!notification.read_at"
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7"
                    @click.stop="handleMarkAsRead(notification.id)"
                  >
                    <Check class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7 text-destructive"
                    @click.stop="handleDelete(notification.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <!-- Main content -->
              <div class="space-y-2">
                <!-- Message -->
                <p class="text-sm font-medium">{{ notification.data.message }}</p>

                <!-- Details grid -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="flex items-center gap-1.5">
                    <UserCircle2 class="h-3.5 w-3.5 text-blue-500" />
                    <span>{{ notification.data.farmer_name }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Sprout class="h-3.5 w-3.5 text-green-500" />
                    <span>{{ notification.data.crop_name }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <MapPin class="h-3.5 w-3.5 text-red-500" />
                    <span>{{ notification.data.location }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Ruler class="h-3.5 w-3.5 text-yellow-500" />
                    <span>{{ notification.data.area }} hectares</span>
                  </div>
                </div>
              </div>

              <!-- Unread indicator -->
              <div
                v-if="!notification.read_at"
                class="absolute left-0 top-0 bottom-0 w-1 bg-primary"
              />
            </div>
          </template>
        </div>

        <div class="p-2 text-center">
          <Button
            v-if="hasNextPage"
            @click="fetchNextPage"
            variant="ghost"
            size="sm"
            class="w-full gap-2"
            :disabled="isFetchingNextPage"
          >
            <template v-if="isFetchingNextPage">
              <Loader2 class="h-4 w-4 animate-spin" />
              Loading more...
            </template>
            <template v-else> Load More </template>
          </Button>
        </div>
      </ScrollArea>
    </PopoverContent>
  </Popover>
</template>
