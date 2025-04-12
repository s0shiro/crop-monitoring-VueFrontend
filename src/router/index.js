import { createRouter, createWebHistory } from 'vue-router'
import NotFound from '../views/NotFound.vue'
import Register from '@/views/auth/Register.vue'
import Login from '@/views/auth/Login.vue'
import Dashboard from '@/views/auth/Dashboard.vue'
import UserManagement from '@/views/admin/ManageUsers/UserManagement.vue'
import UserDetails from '@/views/admin/ManageUsers/UserDetails.vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/authApi'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CropManagement from '@/views/common/CropManagement/CropManagement.vue'
import CropVarieties from '@/views/common/CropManagement/CropVarieties.vue'
import AssociationsManagement from '@/views/common/AssociationsManagement/AssociationsManagement.vue'
import AssociationDetails from '@/views/common/AssociationsManagement/AssociationDetails.vue'
import FarmerManagement from '@/views/common/FarmerManagement/FarmerManagement.vue'
import FarmerDetails from '@/views/common/FarmerManagement/FarmerDetails.vue'
import CropPlantingManagement from '@/views/technician/CropPlanting/CropPlantingManagement.vue'
import CropPlantingDetails from '@/views/technician/CropPlanting/CropPlantingDetails.vue'
import CropPlantingForm from '@/views/technician/CropPlanting/CropPlantingForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: (to) => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated ? '/dashboard' : '/login'
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard,
        },
        {
          path: 'users',
          name: 'user-management',
          component: UserManagement,
          meta: {
            requiredRoles: ['admin'],
          },
        },
        {
          path: 'users/:id',
          name: 'user-details',
          component: UserDetails,
          meta: {
            requiredRoles: ['admin'],
          },
        },
        {
          path: 'crops',
          name: 'crop-management',
          component: CropManagement,
          meta: {
            requiredRoles: ['admin', 'technician'],
          },
        },
        {
          path: 'crops/:cropId/varieties',
          name: 'crop-varieties',
          component: CropVarieties,
          meta: {
            requiredRoles: ['admin'],
          },
        },
        {
          path: 'associations',
          name: 'associations-management',
          component: AssociationsManagement,
          meta: {
            requiredRoles: ['admin'],
          },
        },
        {
          path: 'associations/:id',
          name: 'association-details',
          component: AssociationDetails,
          meta: {
            requiredRoles: ['admin'],
          },
        },
        {
          path: 'farmers',
          name: 'farmer-management',
          component: FarmerManagement,
          meta: {
            requiredRoles: ['admin', 'technician'],
          },
        },
        {
          path: 'farmers/:id',
          name: 'farmer-details',
          component: FarmerDetails,
          meta: {
            requiredRoles: ['admin', 'technician'],
          },
        },
        {
          path: 'crop-plantings',
          name: 'crop-planting-management',
          component: CropPlantingManagement,
          meta: {
            requiredRoles: ['technician', 'admin'],
          },
        },
        {
          path: 'crop-plantings/new',
          name: 'crop-planting-form',
          component: CropPlantingForm,
          meta: {
            requiredRoles: ['technician', 'admin'],
          },
        },
        {
          path: 'crop-plantings/:id',
          name: 'crop-planting-details',
          component: CropPlantingDetails,
          meta: {
            requiredRoles: ['technician', 'admin'],
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
})

async function checkAuthAndRoles(authStore, to) {
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }

  if (to.meta.requiredRoles && authStore.roles.length === 0) {
    const response = await authApi.getCurrentUser()
    if (response.data) {
      authStore.updateUserRolesAndPermissions(response.data)
    }
  }

  if (to.meta.requiredRoles) {
    return to.meta.requiredRoles.some((role) => authStore.hasRole(role))
  }

  return true
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  try {
    // First check authentication status for all routes
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth()
    }

    // Now handle guest routes (login/register)
    if (to.meta.requiresGuest) {
      if (authStore.isAuthenticated) {
        return next({ name: 'dashboard' })
      }
      return next()
    }

    // Handle protected routes
    if (to.meta.requiresAuth) {
      try {
        const hasAccess = await checkAuthAndRoles(authStore, to)

        if (!authStore.isAuthenticated) {
          return next({ name: 'login' })
        }

        if (!hasAccess) {
          console.log('Access denied: insufficient privileges')
          return next({ name: 'dashboard' })
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        return next({ name: 'login' })
      }
    }

    return next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    // Only redirect to login if it's not already a guest route
    if (!to.meta.requiresGuest) {
      return next({ name: 'login' })
    }
    return next()
  }
})

export default router
