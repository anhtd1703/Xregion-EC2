import { defineStore } from 'pinia'
import type { UserProfile } from '@xregion/contracts'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<UserProfile | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  function setAuth(newToken: string, newUser: UserProfile) {
    token.value = newToken
    user.value = newUser
  }

  function clearAuth() {
    token.value = null
    user.value = null
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth
  }
})
