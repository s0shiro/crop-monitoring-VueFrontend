import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Register from '@/views/auth/Register.vue'
import Login from '@/views/auth/Login.vue'
import Dashboard from '@/views/auth/Dashboard.vue'
import { useAuthStore } from '@/stores/auth' // Import the auth store

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

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check authentication status if not already initialized
  if (!authStore.isInitialized) {
    await authStore.init()
  }

  const isAuthenticated = authStore.isAuthenticated

  // Route requires authentication but user is not logged in
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  }
  // Route is for guests only and user is logged in
  else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' })
  }
  // Otherwise proceed normally
  else {
    next()
  }
})

export default router
