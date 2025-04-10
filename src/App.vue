<script setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { useThemeStore } from '@/stores/theme'
import { onMounted } from 'vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})

</script>

<template>
  <Toaster />
  <VueQueryDevtools />
  <div class="min-h-screen bg-background text-foreground">
    <RouterView />
  </div>
</template>
