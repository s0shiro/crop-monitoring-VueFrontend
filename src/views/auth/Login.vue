<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, LockKeyhole, Eye, EyeOff } from 'lucide-vue-next'
import loginImage from '../../../images/login-left.webp'

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
    class="h-screen flex justify-center items-center bg-cover bg-center bg-gradient-to-t from-purple-600 to-accent"
  >
    <div
      class="bg-card w-[90%] lg:w-[1000px] h-[80%] py-4 lg:py-10 rounded-xl shadow-xl font-poppins flex justify-center items-center"
    >
      <div class="hidden lg:block">
        <img :src="loginImage" alt="Login" />
      </div>

      <div class="w-[95%] lg:w-[40%]">
        <p class="text-2xl font-bold text-center mb-8 text-card-foreground">
          Crop Monitoring System
        </p>

        <!-- Error Alert -->
        <Alert variant="destructive" v-if="generalError" class="mb-4">
          <AlertDescription>{{ generalError }}</AlertDescription>
        </Alert>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-6 lg:space-y-8 w-[95%] lg:w-[80%] mx-auto"
        >
          <!-- Email Field -->
          <div class="space-y-2">
            <div class="relative">
              <Input
                id="email"
                type="email"
                v-model="email"
                placeholder="Email"
                class="pl-10"
                :class="{ 'border-destructive': formErrors.email }"
                autocomplete="email"
              />
              <span
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                <User size="20" />
              </span>
            </div>
            <p class="text-sm text-destructive" v-if="formErrors.email">
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
                class="px-10"
                :class="{ 'border-destructive': formErrors.password }"
                autocomplete="current-password"
              />
              <span
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                <LockKeyhole size="20" />
              </span>
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                <EyeOff v-if="showPassword" size="20" />
                <Eye v-else size="20" />
              </button>
            </div>
            <p class="text-sm text-destructive" v-if="formErrors.password">
              {{ formErrors.password[0] }}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-center items-center">
            <Button
              type="submit"
              class="bg-primary text-primary-foreground hover:bg-primary/90 text-xl w-[85%] rounded-full font-bold tracking-wider py-6"
              :disabled="authStore.isLoading"
            >
              <span v-if="authStore.isLoading">Signing in...</span>
              <span v-else>Login</span>
            </Button>
          </div>
        </form>

        <div class="text-center mt-4">
          <router-link
            to="/forgot-password"
            class="text-sm text-primary hover:text-primary/90 hover:underline"
          >
            Forgot password?
          </router-link>
        </div>

        <div class="text-center mt-4">
          <p class="text-sm text-muted-foreground">
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
