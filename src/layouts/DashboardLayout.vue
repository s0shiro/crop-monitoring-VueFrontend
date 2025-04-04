<script setup>
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <SidebarProvider>
 
      <!-- Sidebar - Only show when not loading -->
      <AppSidebar v-if="!isLoading" />

      <!-- Main Content -->
      <div class="flex-1 overflow-hidden">
        <div class="h-full">
          <!-- Show loading spinner while loading -->
          <div v-if="isLoading" class="flex justify-center items-center min-h-screen">
            <div
              class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
            ></div>
          </div>

          <!-- Page Content -->
          <div v-else class="p-6">
            <RouterView />
          </div>
        </div>
      </div>
  </SidebarProvider>
</template>
