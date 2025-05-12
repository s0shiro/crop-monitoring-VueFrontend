<template>
  <div class="max-w-2xl mx-auto w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center">
    <div class="mb-8 px-4 sm:px-0">
      <h1 class="text-3xl font-extrabold tracking-tight text-primary flex items-center gap-2">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2v1h-4v-1zm-6 8V7a2 2 0 012-2h2a2 2 0 012 2v2h4V7a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2z"/></svg>
        </span>
        Change Password
      </h1>
      <p class="text-sm text-muted-foreground mt-1">Update your account password below.</p>
    </div>
    <form @submit.prevent="handleChangePassword" class="space-y-6 px-4 sm:px-0">
      <div class="space-y-2">
        <Label for="current_password">Current Password</Label>
        <div class="relative group">
          <Input
            id="current_password"
            v-model="form.current_password"
            :type="showPassword.current ? 'text' : 'password'"
            placeholder="Enter current password"
            required
            autocomplete="current-password"
            class="pr-10"
            @focus="setFieldFocus('current', true)"
            @blur="setFieldFocus('current', false)"
          />
          <button
            type="button"
            @click="togglePassword('current')"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none transition-opacity"
            :class="{ 'opacity-100': passwordFieldState.current || passwordHoverState.current, 'opacity-0 pointer-events-none': !(passwordFieldState.current || passwordHoverState.current) }"
            @mouseenter="setFieldHover('current', true)"
            @mouseleave="setFieldHover('current', false)"
            tabindex="-1"
          >
            <component :is="showPassword.current ? EyeOff : Eye" class="h-5 w-5" />
          </button>
        </div>
      </div>
      <div class="space-y-2">
        <Label for="new_password">New Password</Label>
        <div class="relative group">
          <Input
            id="new_password"
            v-model="form.new_password"
            :type="showPassword.new ? 'text' : 'password'"
            placeholder="Enter new password"
            required
            minlength="8"
            autocomplete="new-password"
            class="pr-10"
            @focus="setFieldFocus('new', true)"
            @blur="setFieldFocus('new', false)"
          />
          <button
            type="button"
            @click="togglePassword('new')"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none transition-opacity"
            :class="{ 'opacity-100': passwordFieldState.new || passwordHoverState.new, 'opacity-0 pointer-events-none': !(passwordFieldState.new || passwordHoverState.new) }"
            @mouseenter="setFieldHover('new', true)"
            @mouseleave="setFieldHover('new', false)"
            tabindex="-1"
          >
            <component :is="showPassword.new ? EyeOff : Eye" class="h-5 w-5" />
          </button>
        </div>
      </div>
      <div class="space-y-2">
        <Label for="new_password_confirmation">Confirm New Password</Label>
        <div class="relative group">
          <Input
            id="new_password_confirmation"
            v-model="form.new_password_confirmation"
            :type="showPassword.confirm ? 'text' : 'password'"
            placeholder="Re-enter new password"
            required
            minlength="8"
            autocomplete="new-password"
            class="pr-10"
            @focus="setFieldFocus('confirm', true)"
            @blur="setFieldFocus('confirm', false)"
          />
          <button
            type="button"
            @click="togglePassword('confirm')"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none transition-opacity"
            :class="{ 'opacity-100': passwordFieldState.confirm || passwordHoverState.confirm, 'opacity-0 pointer-events-none': !(passwordFieldState.confirm || passwordHoverState.confirm) }"
            @mouseenter="setFieldHover('confirm', true)"
            @mouseleave="setFieldHover('confirm', false)"
            tabindex="-1"
          >
            <component :is="showPassword.confirm ? EyeOff : Eye" class="h-5 w-5" />
          </button>
        </div>
      </div>
      <Button type="submit" class="w-full mt-2 flex items-center justify-center gap-2" :disabled="loading">
        <svg v-if="loading" class="animate-spin h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        <span>{{ loading ? 'Changing...' : 'Change Password' }}</span>
      </Button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axiosInstance from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast/use-toast'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const form = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})
const loading = ref(false)
const showPassword = ref({
  current: false,
  new: false,
  confirm: false,
})
const passwordFieldState = ref({
  current: false,
  new: false,
  confirm: false,
})
const passwordHoverState = ref({
  current: false,
  new: false,
  confirm: false,
})
const { toast } = useToast()
const router = useRouter()
const authStore = useAuthStore()

function togglePassword(field) {
  showPassword.value[field] = !showPassword.value[field]
}

function setFieldFocus(field, value) {
  passwordFieldState.value[field] = value
}

function setFieldHover(field, value) {
  passwordHoverState.value[field] = value
}

async function handleChangePassword() {
  loading.value = true
  try {
    const res = await axiosInstance.post('/api/change-password', form.value)
    toast({
      title: 'Success',
      description: res.data.message || 'Password changed successfully.',
      variant: 'default',
    })
    form.value.current_password = ''
    form.value.new_password = ''
    form.value.new_password_confirmation = ''
    // Logout and redirect to login after password change
    await authStore.logout()
    router.push({ name: 'login' })
  } catch (err) {
    toast({
      title: 'Error',
      description: err.response?.data?.message || 'Failed to change password.',
      variant: 'destructive',
    })
  } finally {
    loading.value = false
  }
}
</script>
