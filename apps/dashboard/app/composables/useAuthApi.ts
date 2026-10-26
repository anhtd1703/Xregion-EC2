import type { LoginRequest, LoginResponse, UserProfile } from '@xregion/contracts'
import { useAuthStore } from '../stores/auth.js'
import { useApi } from './useApi.js'

export function useAuthApi() {
  const api = useApi()
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function login(credentials: LoginRequest): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const res = await api.post<LoginResponse>('/auth/login', credentials)
      authStore.setAuth(res.token, res.user)
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e?.message || 'Login failed. Please check credentials.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser(): Promise<UserProfile | null> {
    try {
      const user = await api.get<UserProfile>('/auth/me')
      if (user) {
        authStore.user = user
      }
      return user
    } catch {
      return null
    }
  }

  function logout() {
    authStore.clearAuth()
    navigateTo('/login')
  }

  return {
    loading,
    error,
    login,
    logout,
    fetchCurrentUser
  }
}
