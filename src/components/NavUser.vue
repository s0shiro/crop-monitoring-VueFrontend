<script setup>
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Moon, Sun } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/components/ui/toast/use-toast'

const props = defineProps({
  user: { type: Object, required: true },
})

const { isMobile } = useSidebar()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { toast } = useToast()

function logout() {
  toast({
    title: 'Logging out',
    description: 'Please wait while we log you out.',
  })

  authStore
    .logout()
    .then(() => {
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
    })
    .catch(() => {
      toast({
        title: 'Logout failed',
        description: 'An error occurred while logging out. Please try again.',
      })
    })
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg"> CN </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg"> CN </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="themeStore.toggleDarkMode">
            <component :is="themeStore.isDark ? Sun : Moon" class="mr-2 h-4 w-4" />
            <span>{{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="logout">
            <LogOut class="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
