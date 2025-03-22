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

// Form data
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')

// Form state
const formErrors = ref({})
const generalError = ref('')

// Get auth store and router
const authStore = useAuthStore()
const router = useRouter()

// Handle form submission
const handleSubmit = async () => {
  formErrors.value = {}
  generalError.value = ''

  const userData = {
    name: name.value,
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  }

  const result = await authStore.register(userData)

  if (!result.success) {
    // Handle errors
    formErrors.value = result.errors || {}

    if (result.errors?.general) {
      generalError.value = result.errors.general[0]
    } else if (result.errors?.email || result.errors?.password) {
      generalError.value = 'Invalid email or password'
    }
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription> Enter your information to create your account </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Error Alert -->
          <Alert variant="destructive" v-if="generalError">
            <AlertDescription>{{ generalError }}</AlertDescription>
          </Alert>

          <!-- Name Field -->
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="name"
              placeholder="Enter your name"
              :class="{ 'border-destructive': formErrors.name }"
            />
            <p class="text-sm text-destructive" v-if="formErrors.name">
              {{ formErrors.name[0] }}
            </p>
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="email"
              placeholder="Enter your email"
              :class="{ 'border-destructive': formErrors.email }"
            />
            <p class="text-sm text-destructive" v-if="formErrors.email">
              {{ formErrors.email[0] }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              v-model="password"
              placeholder="Create a password"
              :class="{ 'border-destructive': formErrors.password }"
            />
            <p class="text-sm text-destructive" v-if="formErrors.password">
              {{ formErrors.password[0] }}
            </p>
          </div>

          <!-- Password Confirmation Field -->
          <div class="space-y-2">
            <Label for="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              v-model="passwordConfirmation"
              placeholder="Confirm your password"
              :class="{ 'border-destructive': formErrors.password_confirmation }"
            />
            <p class="text-sm text-destructive" v-if="formErrors.password_confirmation">
              {{ formErrors.password_confirmation[0] }}
            </p>
          </div>

          <!-- Submit Button -->
          <Button type="submit" class="w-full" :disabled="authStore.isLoading">
            <span v-if="authStore.isLoading">Creating account...</span>
            <span v-else>Create Account</span>
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p class="text-sm text-center w-full text-muted-foreground">
          Already have an account?
          <router-link to="/login" class="text-primary hover:underline"> Login </router-link>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
