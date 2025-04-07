<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>

<template>
  <Toaster />
  <VueQueryDevtools />
  <div class="min-h-screen bg-background text-foreground">
    <RouterView />
  </div>
</template>
