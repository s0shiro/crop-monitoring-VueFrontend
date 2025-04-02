<script setup>
import { useFetchUser } from '@/composables/useFetchUser'

const { data: userData, isLoading, error } = useFetchUser()

// Simple helper function
const hasPermission = (permName) => userData?.permissions?.includes(permName)
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Dashboard</h1>

    <!-- Loading state -->
    <div v-if="isLoading">Loading user data...</div>

    <!-- Error state -->
    <div v-else-if="error" class="text-red-500">Error loading user data: {{ error.message }}</div>

    <!-- Success state -->
    <div v-else-if="userData" class="space-y-4">
      <!-- User info -->
      <div class="p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h2 class="text-xl">Welcome, {{ userData.user.name }}!</h2>
        <div>Email: {{ userData.user.email }}</div>
      </div>

      <!-- Roles section -->
      <div class="p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h3 class="font-bold mb-2">Your Roles</h3>
        <div v-if="userData.roles?.length" class="flex flex-wrap gap-2">
          <span
            v-for="role in userData.roles"
            :key="role"
            class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-sm"
          >
            {{ role }}
          </span>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400">No roles assigned</p>
      </div>

      <!-- Permissions section -->
      <div v-if="userData.permissions?.length" class="p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h3 class="font-bold mb-2">Your Permissions</h3>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="permission in userData.permissions"
            :key="permission"
            class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded text-xs mb-1"
          >
            {{ permission }}
          </span>
        </div>
      </div>

      <!-- Admin access section example -->
      <div
        v-if="hasPermission('manage_users')"
        class="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded"
      >
        <h3 class="font-bold text-amber-800 dark:text-amber-300">Admin Features</h3>
        <p class="text-amber-700 dark:text-amber-400">
          You have admin privileges to manage users and system settings.
        </p>
      </div>
    </div>
  </div>
</template>
