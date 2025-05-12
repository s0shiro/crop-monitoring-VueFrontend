import { createRouter, createWebHistory } from 'vue-router'
import { toast } from '@/components/ui/toast'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/authApi'
import Login from '@/views/auth/Login.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: (to) => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated ? '/' : '/login'
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
      component: () => import('@/views/auth/Register.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/auth/Dashboard.vue'),
        },
        {
          path: 'my-technicians',
          name: 'my-technicians',
          component: () => import('@/views/coordinator/TechnicianManagement.vue'),
          meta: {
            requiredRoles: ['coordinator'],
            title: 'My Technicians',
          },
        },
        {
          path: 'my-technicians/:id',
          name: 'technician-details',
          component: () => import('@/views/coordinator/TechnicianDetails.vue'),
          meta: {
            requiredRoles: ['coordinator'],
            title: 'Technician Details',
          },
        },
        {
          path: 'users',
          name: 'user-management',
          component: () => import('@/views/admin/ManageUsers/UserManagement.vue'),
          meta: {
            requiredRoles: ['admin'],
            title: 'User Management',
          },
        },
        {
          path: 'users/:id',
          name: 'user-details',
          component: () => import('@/views/admin/ManageUsers/UserDetails.vue'),
          meta: {
            requiredRoles: ['admin'],
            title: 'User Details',
          },
        },
        {
          path: 'crops',
          name: 'crop-management',
          component: () => import('@/views/common/CropManagement/CropManagement.vue'),
          meta: {
            requiredRoles: ['admin', 'technician', 'coordinator'],
            title: 'Crop Management',
          },
        },
        {
          path: 'crops/:cropId/varieties',
          name: 'crop-varieties',
          component: () => import('@/views/common/CropManagement/CropVarieties.vue'),
          meta: {
            requiredRoles: ['admin', 'technician'],
            title: 'Crop Varieties',
          },
        },
        {
          path: 'associations',
          name: 'associations-management',
          component: () =>
            import('@/views/common/AssociationsManagement/AssociationsManagement.vue'),
          meta: {
            requiredRoles: ['admin', 'coordinator'],
            title: 'Associations Management',
          },
        },
        {
          path: 'associations/:id',
          name: 'association-details',
          component: () => import('@/views/common/AssociationsManagement/AssociationDetails.vue'),
          meta: {
            requiredRoles: ['admin'],
            title: 'Association Details',
          },
        },
        {
          path: 'farmers',
          name: 'farmer-management',
          component: () => import('@/views/common/FarmerManagement/FarmerManagement.vue'),
          meta: {
            requiredRoles: ['admin', 'technician'],
            title: 'Farmer Management',
          },
        },
        {
          path: 'farmers/:id',
          name: 'farmer-details',
          component: () => import('@/views/common/FarmerManagement/FarmerDetails.vue'),
          meta: {
            requiredRoles: ['admin', 'technician'],
            title: 'Farmer Details',
          },
        },
        {
          path: 'crop-plantings',
          name: 'crop-planting-management',
          component: () => import('@/views/technician/CropPlanting/CropPlantingManagement.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Crop Planting Management',
          },
        },
        {
          path: 'crop-plantings/new',
          name: 'crop-planting-form',
          component: () => import('@/views/technician/CropPlanting/CropPlantingForm.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'New Crop Planting',
          },
        },
        {
          path: 'crop-plantings/:id',
          name: 'crop-planting-details',
          component: () => import('@/views/technician/CropPlanting/CropPlantingDetails.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Crop Planting Details',
          },
        },
        {
          path: 'crop-plantings/:id/edit',
          name: 'crop-planting-edit',
          component: () => import('@/views/technician/CropPlanting/CropPlantingEditForm.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Edit Crop Planting',
          },
        },
        {
          path: 'reports/rice-standing',
          name: 'rice-standing-report',
          component: () => import('@/views/common/GenerateReports/RiceStandingReport.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Rice Standing Report',
          },
        },
        {
          path: 'reports/rice-harvest',
          name: 'rice-harvest-report',
          component: () => import('@/views/common/GenerateReports/RiceHarvestReport.vue'),
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
        {
          path: 'reports/corn-harvest',
          name: 'monthly-corn-harvest-report',
          component: () => import('@/views/common/GenerateReports/MonthlyCornHarvestReport.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Monthly Corn Harvest Report',
          },
        },
        {
          path: 'reports/corn-planting',
          name: 'monthly-corn-planting-report',
          component: () => import('@/views/common/GenerateReports/MonthlyPlantingCornReport.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Monthly Corn Planting Report',
          },
        },
        {
          path: 'reports/corn-standing',
          name: 'corn-standing-report',
          component: () => import('@/views/common/GenerateReports/CornStandingReport.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'Corn Standing Report',
          },
        },
        {
          path: 'reports/high-value',
          name: 'high-value-report',
          component: () => import('@/views/common/GenerateReports/HighValueReport.vue'),
          meta: {
            requiredRoles: ['technician', 'admin'],
            title: 'High Value Crop Report',
          },
        },
        {
          path: 'example',
          name: 'example-usage',
          component: () => import('@/views/common/ExampleUsage.vue'),
          meta: {
            requiredRoles: ['admin', 'technician'],
            title: 'Example Loading States',
          },
        },
        {
          path: 'change-password',
          name: 'change-password',
          component: () => import('@/views/auth/ChangePassword.vue'),
          meta: {
            requiresAuth: true,
            title: 'Change Password',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
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
        toast({
          title: 'Access Denied',
          description: "You don't have sufficient privileges to access this page.",
          variant: 'destructive',
        })
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
