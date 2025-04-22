<template>
  <div class="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">404</h1>
      <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">Page not found</p>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div class="mt-6">
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go back home
        </RouterLink>
      </div>
    </div>
  </div>
</template>
