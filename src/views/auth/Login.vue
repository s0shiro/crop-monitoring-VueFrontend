<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, LockKeyhole, Eye, EyeOff } from 'lucide-vue-next'
import loginImage from '../../../images/pao-bg.webp'

// Form data
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// Form state
const formErrors = ref({})
const generalError = ref('')

// Get auth store and router
const authStore = useAuthStore()

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  formErrors.value = {}
  generalError.value = ''

  const credentials = {
    email: email.value,
    password: password.value,
    remember: rememberMe.value,
  }

  const result = await authStore.login(credentials)

  if (!result.success) {
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
  <div
    class="min-h-screen flex justify-center items-center bg-cover bg-center bg-gradient-to-t from-purple-600 to-accent p-4"
  >
    <div
      class="bg-card w-full max-w-[1000px] min-h-[500px] py-6 sm:py-8 lg:py-10 rounded-xl shadow-xl font-poppins flex flex-col lg:flex-row justify-center items-center gap-6"
    >
      <div class="hidden lg:block lg:w-1/2">
        <img :src="loginImage" alt="Login" class="w-full h-auto object-cover" />
      </div>

      <div class="w-full px-4 sm:px-6 lg:w-1/2 max-w-[450px]">
        <p class="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-card-foreground">
          Crop Monitoring System
        </p>

        <!-- Error Alert -->
        <Alert variant="destructive" v-if="generalError" class="mb-4">
          <AlertDescription>{{ generalError }}</AlertDescription>
        </Alert>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-4 sm:space-y-6 w-full max-w-[400px] mx-auto"
        >
          <!-- Email Field -->
          <div class="space-y-2">
            <div class="relative">
              <Input
                id="email"
                type="email"
                v-model="email"
                placeholder="Email"
                class="pl-10 h-11 sm:h-12"
                :class="{ 'border-destructive': formErrors.email }"
                autocomplete="email"
              />
              <span
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                <User size="18" />
              </span>
            </div>
            <p class="text-xs sm:text-sm text-destructive" v-if="formErrors.email">
              {{ formErrors.email[0] }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <div class="relative">
              <Input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Password"
                class="px-10 h-11 sm:h-12"
                :class="{ 'border-destructive': formErrors.password }"
                autocomplete="current-password"
              />
              <span
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                <LockKeyhole size="18" />
              </span>
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                <EyeOff v-if="showPassword" size="18" />
                <Eye v-else size="18" />
              </button>
            </div>
            <p class="text-xs sm:text-sm text-destructive" v-if="formErrors.password">
              {{ formErrors.password[0] }}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-center items-center pt-2">
            <Button
              type="submit"
              class="bg-primary text-primary-foreground hover:bg-primary/90 text-lg sm:text-xl w-full sm:w-[85%] rounded-full font-bold tracking-wider py-5 sm:py-6"
              :disabled="authStore.isLoggingIn"
            >
              <span v-if="authStore.isLoggingIn">Signing in...</span>
              <span v-else>Login</span>
            </Button>
          </div>
        </form>

        <div class="text-center mt-4">
          <router-link
            to="/forgot-password"
            class="text-xs sm:text-sm text-primary hover:text-primary/90 hover:underline"
          >
            Forgot password?
          </router-link>
        </div>

        <div class="text-center mt-4">
          <p class="text-xs sm:text-sm text-muted-foreground">
            Don't have an account?
            <router-link to="/register" class="text-primary hover:text-primary/90 hover:underline">
              Sign up
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
