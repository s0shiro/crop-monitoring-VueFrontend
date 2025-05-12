<template>
  <div
    :class="[
      isGrid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4',
    ]"
  >
    <template v-if="farmersData && farmersData.pages">
      <template v-for="page in farmersData.pages" :key="page.nextCursor">
        <template v-for="farmer in page.data" :key="farmer.id">
          <slot :farmer="farmer" :isGrid="isGrid" />
        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  isGrid: Boolean,
  farmersData: Object,
})
</script>
