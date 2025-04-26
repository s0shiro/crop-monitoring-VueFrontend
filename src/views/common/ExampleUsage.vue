<template>
  <div>
    <!-- Basic Usage -->
    <Loading v-if="isLoading" />

    <!-- With Custom Message -->
    <Loading v-if="isLoadingWithMessage"> Fetching Data... </Loading>

    <!-- With Description -->
    <Loading v-if="isLoadingWithDescription" description="This may take a few moments">
      Processing Your Request
    </Loading>

    <!-- Demo Buttons -->
    <div class="space-y-4">
      <Button @click="toggleBasic">Show Basic Loading</Button>
      <Button @click="toggleWithMessage">Show Loading with Message</Button>
      <Button @click="toggleWithDescription">Show Loading with Description</Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Loading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'

const isLoading = ref(false)
const isLoadingWithMessage = ref(false)
const isLoadingWithDescription = ref(false)

const toggleBasic = () => {
  isLoading.value = true
  setTimeout(() => (isLoading.value = false), 2000)
}

const toggleWithMessage = () => {
  isLoadingWithMessage.value = true
  setTimeout(() => (isLoadingWithMessage.value = false), 2000)
}

const toggleWithDescription = () => {
  isLoadingWithDescription.value = true
  setTimeout(() => (isLoadingWithDescription.value = false), 2000)
}
</script>
