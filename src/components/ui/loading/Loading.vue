<template>
  <div class="fixed inset-0 flex items-center justify-center z-50">
    <!-- Overlay with solid background -->
    <div class="fixed inset-0 w-screen h-screen bg-black/60"></div>

    <!-- Loading Container -->
    <div class="relative flex flex-col items-center gap-4 z-50">
      <!-- Background Image Container -->
      <div class="w-32 h-32 relative animate-pulse">
        <img
          src="../../../../../images/pao-noBG.png"
          alt="PAO Logo"
          class="w-full h-full object-contain opacity-50 max-w-[120px]"
        />
      </div>

      <!-- Spinner Animation -->
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
        <div class="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
        <div class="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
      </div>

      <!-- Loading Text -->
      <p class="text-lg font-medium text-white">
        <slot>Loading...</slot>
      </p>

      <!-- Optional Description -->
      <p v-if="description" class="text-sm text-gray-300">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  description: {
    type: String,
    default: '',
  },
})
</script>
