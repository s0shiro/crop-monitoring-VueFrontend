import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Register from '@/views/auth/Register.vue'
import Login from '@/views/auth/Login.vue'
import Dashboard from '@/views/auth/Dashboard.vue'
import { useAuthStore } from '@/stores/auth'

// Create a flag to track initialization status
let isAuthInitialized = false

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }, // Only for non-authenticated users
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true }, // Only for non-authenticated users
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }, // Protected route
    },
  ],
})

// Function to initialize auth
export async function initializeAuth() {
  if (isAuthInitialized) return

  const authStore = useAuthStore()

  try {
    await authStore.init()
    console.log('Router auth initialization complete')
    isAuthInitialized = true
  } catch (error) {
    console.error('Failed to initialize auth in router', error)
  }
}

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to be initialized before making any routing decisions
  if (!isAuthInitialized) {
    console.log('Auth not initialized yet, initializing...')
    await initializeAuth()
  }

  // Always refresh auth state if going to a protected route or guest route
  if ((to.meta.requiresAuth || to.meta.requiresGuest) && !authStore.loading) {
    try {
      await authStore.checkAuth()
    } catch (err) {
      console.log('Auth check failed:', err)
      authStore.user = null
    }
  }

  // Get authentication status
  const isAuthenticated = authStore.isAuthenticated

  console.log(
    'Route:',
    to.path,
    'Auth State:',
    isAuthenticated ? 'Authenticated' : 'Not authenticated',
  )

  // First check if route is for guests only and user is authenticated
  if (to.meta.requiresGuest && isAuthenticated) {
    console.log('Redirecting authenticated user from guest route to dashboard')
    return next({ name: 'dashboard' })
  }
  // Then check if route requires auth but user is not authenticated
  else if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting unauthenticated user from protected route to login')
    return next({ name: 'login' })
  }
  // Otherwise proceed normally
  else {
    console.log('Proceeding normally to', to.path)
    return next()
  }
})

export default router
