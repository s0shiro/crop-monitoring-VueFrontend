<template>
  <div>
    <button
      class="rounded-full border border-muted-foreground p-2 bg-background hover:bg-muted transition"
      :title="isGrid ? 'Grid View' : 'List View'"
      @click="$emit('toggle')"
    >
      <svg
        v-if="isGrid"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <rect x="3" y="4" width="18" height="3.5" rx="1.5" fill="currentColor" />
        <rect x="3" y="10.25" width="18" height="3.5" rx="1.5" fill="currentColor" />
        <rect x="3" y="16.5" width="18" height="3.5" rx="1.5" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  isGrid: Boolean,
})
const emit = defineEmits(['toggle'])
</script>
