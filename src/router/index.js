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
import CropPlantingEditForm from '@/views/technician/CropPlanting/CropPlantingEditForm.vue'
import RiceStandingReport from '@/views/common/GenerateReports/RiceStandingReport.vue'
import RiceHarvestReport from '@/views/common/GenerateReports/RiceHarvestReport.vue'

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
            title: 'User Management',
          },
        },
        {
          path: 'users/:id',
          name: 'user-details',
          component: UserDetails,
          meta: {
            requiredRoles: ['admin'],
            title: 'User Details',
          },
        },
        {
          path: 'crops',
          name: 'crop-management',
          component: CropManagement,
          meta: {
            requiredRoles: ['admin', 'technician'],
            title: 'Crop Management',
          },
        },
        {
          path: 'crops/:cropId/varieties',
          name: 'crop-varieties',
          component: CropVarieties,
          meta: {
            requiredRoles: ['admin', 'technician'],
            title: 'Crop Varieties',
          },
        },
        {
          path: 'associations',
          name: 'associations-management',
          component: AssociationsManagement,
          meta: {
            requiredRoles: ['admin'],
            title: 'Associations Management',
          },
        },
        {
          path: 'associations/:id',
          name: 'association-details',
          component: AssociationDetails,
          meta: {
            requiredRoles: ['admin'],
            title: 'Association Details',
          },
        },
        {
          path: 'farmers',
          name: 'farmer-management',
          component: FarmerManagement,
          meta: {
            requiredRoles: ['admin', 'technician'],
            title: 'Farmer Management',
          },
        },
        {
          path: 'farmers/:id',
          name: 'farmer-details',
          component: FarmerDetails,
          meta: {
            requiredRoles: ['admin', 'technician'],
            title: 'Farmer Details',
          },
        },
        {
          path: 'crop-plantings',
          name: 'crop-planting-management',
          component: CropPlantingManagement,
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Crop Planting Management',
          },
        },
        {
          path: 'crop-plantings/new',
          name: 'crop-planting-form',
          component: CropPlantingForm,
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'New Crop Planting',
          },
        },
        {
          path: 'crop-plantings/:id',
          name: 'crop-planting-details',
          component: CropPlantingDetails,
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Crop Planting Details',
          },
        },
        {
          path: 'crop-plantings/:id/edit',
          name: 'crop-planting-edit',
          component: CropPlantingEditForm,
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Edit Crop Planting',
          },
        },
        {
          path: 'reports/rice-standing',
          name: 'rice-standing-report',
          component: RiceStandingReport,
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Rice Standing Report',
          },
        },
        {
          path: 'reports/rice-harvest',
          name: 'rice-harvest-report',
          component: RiceHarvestReport,
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Rice Harvest Report',
          },
        },
        {
          path: 'reports/rice-planting',
          name: 'rice-planting-report',
          component: () => import('@/views/common/GenerateReports/MonthlyRicePlantingReport.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Monthly Rice Planting Report',
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
    // Check auth status if not already checked
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth()
    }

    // Prevent authenticated users from accessing guest routes
    if (to.meta.requiresGuest) {
      if (authStore.isAuthenticated) {
        console.log('Authenticated user redirected from guest route')
        return next({ name: 'dashboard' })
      }
      return next()
    }

    // Handle protected routes
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        console.log('Unauthenticated user redirected to login')
        return next({ name: 'login' })
      }

      const hasAccess = await checkAuthAndRoles(authStore, to)
      if (!hasAccess) {
        console.log('Access denied: insufficient privileges')
        return next({ name: 'dashboard' })
      }
    }

    return next()
  } catch (err) {
    console.error('Navigation guard error:', err)
    if (to.meta.requiresAuth) {
      return next({ name: 'login' })
    }
    return next()
  }
})

export default router
