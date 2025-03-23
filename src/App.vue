<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onBeforeMount, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { initializeAuth } from '@/router' // Import the auth initialization function

// Menu state
const isMenuOpen = ref(false)
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Dark mode state
const isDarkMode = ref(false)
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Auth state
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// Logout specific loading state
const isLoggingOut = ref(false)

// Handle logout
const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await authStore.logout()
  } finally {
    isLoggingOut.value = false
    isMenuOpen.value = false // Close mobile menu after logout
  }
}

// Initialize app
onBeforeMount(async () => {
  console.log('App initializing')

  // Check for dark mode preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }

  // Initialize auth state using the shared initialization function
  await initializeAuth()
  console.log('App initialization complete')
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header
      class="sticky top-0 z-50 w-full border-b border-border bg-background/50 backdrop-blur-xl"
    >
      <div class="container flex h-16 items-center justify-between px-4 md:px-6">
        <div class="flex items-center gap-2">
          <RouterLink to="/" class="font-semibold text-lg"> MyApp </RouterLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink to="/" class="text-sm font-medium transition-colors hover:text-primary">
            Home
          </RouterLink>

          <!-- Authenticated-only navigation items -->
          <template v-if="isAuthenticated">
            <RouterLink
              to="/dashboard"
              class="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </RouterLink>
            <!-- Add more authenticated routes here -->
          </template>
        </nav>

        <!-- Auth Buttons -->
        <div class="hidden md:flex items-center gap-4">
          <!-- Dark Mode Toggle -->
          <Button variant="outline" size="icon" @click="toggleDarkMode" class="size-9 shrink-0">
            <!-- SVG Icons (unchanged) -->
            <svg
              v-if="!isDarkMode"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-[1.2rem] w-[1.2rem]"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-[1.2rem] w-[1.2rem]"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </Button>

          <!-- Show these buttons only for guests (not authenticated) -->
          <template v-if="!isAuthenticated">
            <Button variant="outline" class="border-border">
              <RouterLink to="/login" class="text-sm font-medium"> Login </RouterLink>
            </Button>
            <Button
              variant="default"
              class="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RouterLink to="/register" class="text-sm font-medium"> Sign Up </RouterLink>
            </Button>
          </template>

          <!-- Show these buttons only for authenticated users -->
          <template v-else>
            <span class="text-sm mr-2">Hello, {{ user?.name }}</span>
            <Button
              variant="outline"
              class="border-border"
              @click="handleLogout"
              :disabled="isLoggingOut"
            >
              <span v-if="!isLoggingOut">Logout</span>
              <span v-else class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging out...
              </span>
            </Button>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex md:hidden items-center gap-2">
          <!-- Dark Mode Toggle (Mobile) - unchanged -->
          <Button variant="outline" size="icon" @click="toggleDarkMode" class="size-9 shrink-0">
            <!-- SVG icons (unchanged) -->
            <svg
              v-if="!isDarkMode"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-[1.2rem] w-[1.2rem]"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-[1.2rem] w-[1.2rem]"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </Button>

          <!-- Menu Toggle - unchanged -->
          <Button
            @click="toggleMenu"
            variant="outline"
            size="icon"
            class="size-9 border-border"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
              v-if="!isMenuOpen"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
              v-if="isMenuOpen"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="md:hidden border-t border-border">
        <div class="container flex flex-col space-y-4 py-4">
          <!-- Mobile menu links (unchanged) -->
          <RouterLink to="/" class="text-sm font-medium transition-colors hover:text-primary">
            Home
          </RouterLink>

          <!-- Authenticated-only mobile navigation items -->
          <template v-if="isAuthenticated">
            <RouterLink
              to="/dashboard"
              class="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </RouterLink>
            <!-- Add more authenticated routes here -->
          </template>

          <RouterLink
            to="/about"
            class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            About
          </RouterLink>
          <RouterLink
            to="/features"
            class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </RouterLink>

          <!-- Auth buttons section for mobile menu -->
          <div class="flex flex-col space-y-2 pt-2">
            <!-- Guest only buttons -->
            <template v-if="!isAuthenticated">
              <Button variant="outline" class="w-full justify-start border-border">
                <RouterLink to="/login" class="w-full"> Login </RouterLink>
              </Button>
              <Button
                variant="default"
                class="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RouterLink to="/register" class="w-full"> Sign Up </RouterLink>
              </Button>
            </template>

            <!-- Authenticated user buttons with logout loading state -->
            <template v-else>
              <div class="py-2 text-sm">Hello, {{ user?.name }}</div>
              <Button
                variant="outline"
                class="w-full justify-start border-border"
                @click="handleLogout"
                :disabled="isLoggingOut"
              >
                <span v-if="!isLoggingOut">Logout</span>
                <span v-else class="flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging out...
                </span>
              </Button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <RouterView />
    </main>
  </div>
</template>
