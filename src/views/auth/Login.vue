<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

// Form state
const formErrors = ref({})
const generalError = ref('')

// Get auth store and router
const authStore = useAuthStore()
const router = useRouter()

// For Login.vue and Register.vue
const handleSubmit = async () => {
  formErrors.value = {}
  generalError.value = ''

  const credentials = {
    email: email.value,
    password: password.value,
    remember: rememberMe.value,
  }

  // No need to import or use router here
  // The store will handle navigation
  const result = await authStore.login(credentials)

  if (!result.success) {
    // Handle errors
    formErrors.value = result.errors || {}

    if (result.errors?.general) {
      generalError.value = result.errors.general[0]
    } else if (result.errors?.email || result.errors?.password) {
      generalError.value = 'Invalid email or password'
    }
  }
  // No need for router.push, it's handled in the store
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Sign in to your account</CardTitle>
        <CardDescription> Enter your credentials to access your account </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Error Alert -->
          <Alert variant="destructive" v-if="generalError">
            <AlertDescription>{{ generalError }}</AlertDescription>
          </Alert>

          <!-- Email Field -->
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="email"
              placeholder="Enter your email"
              :class="{ 'border-destructive': formErrors.email }"
              autocomplete="email"
            />
            <p class="text-sm text-destructive" v-if="formErrors.email">
              {{ formErrors.email[0] }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="password">Password</Label>
              <router-link
                to="/forgot-password"
                class="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </router-link>
            </div>
            <Input
              id="password"
              type="password"
              v-model="password"
              placeholder="Enter your password"
              :class="{ 'border-destructive': formErrors.password }"
              autocomplete="current-password"
            />
            <p class="text-sm text-destructive" v-if="formErrors.password">
              {{ formErrors.password[0] }}
            </p>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center space-x-2">
            <Checkbox id="remember" v-model:checked="rememberMe" />
            <Label
              for="remember"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </Label>
          </div>

          <!-- Submit Button -->
          <Button type="submit" class="w-full" :disabled="authStore.isLoading">
            <span v-if="authStore.isLoading">Signing in...</span>
            <span v-else>Sign In</span>
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p class="text-sm text-center w-full text-muted-foreground">
          Don't have an account?
          <router-link to="/register" class="text-primary hover:underline"> Sign up </router-link>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
