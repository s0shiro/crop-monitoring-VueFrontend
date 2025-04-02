<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { SidebarProvider } from '@/components/ui/sidebar'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
</script>

<template>
  <SidebarProvider>
    <div class="">
      <h1 class="text-2xl font-bold mb-4">Welcome {{ user?.name }}</h1>

      <!-- Dashboard Content -->
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border bg-card p-4">
          <h2>Card 1</h2>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <h2>Card 2</h2>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <h2>Card 3</h2>
        </div>
      </div>
    </div>
  </SidebarProvider>
</template>
