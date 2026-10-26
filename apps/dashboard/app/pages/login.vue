<script setup lang="ts">
import { useAuthApi } from '../composables/useAuthApi.js'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign In' })

const { login, loading, error } = useAuthApi()

const username = ref('admin')
const password = ref('admin123')

async function handleLogin() {
  if (!username.value || !password.value) return
  const success = await login({
    username: username.value,
    password: password.value
  })

  if (success) {
    navigateTo('/')
  }
}

function fillMockAdmin() {
  username.value = 'admin'
  password.value = 'admin123'
}
</script>

<template>
  <div
    class="p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur space-y-6"
  >
    <!-- Header -->
    <div class="text-center space-y-2">
      <div
        class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-lg shadow-indigo-500/30"
      >
        XR
      </div>
      <h1 class="text-xl font-bold text-white tracking-tight">Sign in to XRegion-EC2</h1>
      <p class="text-xs text-slate-400">Multi-Region Cloud Management & Migration Control Plane</p>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
    >
      <UIcon name="i-lucide-alert-circle" class="w-4 h-4 shrink-0 text-rose-400" />
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <form class="space-y-4" @submit.prevent="handleLogin">
      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
        <div class="relative">
          <input
            v-model="username"
            type="text"
            required
            placeholder="admin"
            class="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <UIcon
            name="i-lucide-user"
            class="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
        <div class="relative">
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <UIcon
            name="i-lucide-lock"
            class="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
          />
        </div>
      </div>

      <UButton
        type="submit"
        block
        color="primary"
        variant="solid"
        size="md"
        :loading="loading"
        class="w-full mt-2"
      >
        Sign In
      </UButton>
    </form>

    <!-- Quick Seed Admin Fill -->
    <div class="pt-4 border-t border-slate-800/80 text-center space-y-2">
      <div class="text-[11px] text-slate-400">Demo Mode Credentials:</div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700/60"
        @click="fillMockAdmin"
      >
        <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-amber-400" />
        <span>admin / admin123</span>
      </button>
    </div>
  </div>
</template>
