<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <VueQueryDevtools />
  <div class="min-h-screen bg-background text-foreground">
    <RouterView />
  </div>
</template>
