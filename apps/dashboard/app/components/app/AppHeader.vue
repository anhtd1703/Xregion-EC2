<script setup lang="ts">
import type { RegionId } from '@xregion/contracts'
import { useAuthApi } from '../../composables/useAuthApi.js'
import { useAppStore } from '../../stores/app.js'
import { useAuthStore } from '../../stores/auth.js'

defineEmits<{
  (e: 'toggleMobile'): void
}>()

const appStore = useAppStore()
const authStore = useAuthStore()
const { logout } = useAuthApi()

const regionOptions = [
  { label: 'All Regions', value: 'ALL' },
  { label: 'Region A (ap-southeast-1)', value: 'REGION_A' },
  { label: 'Region B (us-east-1)', value: 'REGION_B' }
]

function onSelectRegion(val: string) {
  appStore.setSelectedRegion(val as RegionId | 'ALL')
}

const showNotifications = ref(false)
const showUserMenu = ref(false)

const notifications = [
  {
    id: 1,
    title: 'Snapshot replicated',
    time: '5m ago',
    desc: 'snap-001 copied from Region A to Region B'
  },
  {
    id: 2,
    title: 'Health check OK',
    time: '18m ago',
    desc: 'Route 53 DNS active region health check passed'
  }
]
</script>

<template>
  <header
    class="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-40"
  >
    <!-- Left: Mobile Toggle & Brand -->
    <div class="flex items-center gap-3">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-menu"
        class="lg:hidden"
        size="sm"
        aria-label="Toggle Navigation"
        @click="$emit('toggleMobile')"
      />

      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
        >
          XR
        </div>
        <div class="hidden sm:block">
          <div class="font-bold text-white tracking-tight leading-tight text-sm">XRegion-EC2</div>
          <div class="text-[10px] text-slate-400 leading-tight">Multi-Region Migration</div>
        </div>
      </NuxtLink>

      <span
        class="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 ml-2"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        Mock-First
      </span>
    </div>

    <!-- Right: Region Switcher, Health, Notifications, User Menu -->
    <div class="flex items-center gap-2 md:gap-4">
      <!-- Region Selector -->
      <div class="relative">
        <select
          :value="appStore.selectedRegion"
          class="appearance-none bg-slate-800/80 border border-slate-700 text-slate-200 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          @change="onSelectRegion(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="r in regionOptions" :key="r.value" :value="r.value">
            {{ r.label }}
          </option>
        </select>
        <UIcon
          name="i-lucide-chevron-down"
          class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none"
        />
      </div>

      <!-- System Health Indicator -->
      <div
        class="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-800 text-xs text-slate-300"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span class="text-[11px] font-medium">Route 53 Active</span>
      </div>

      <!-- Notifications Placeholder Popover -->
      <div class="relative">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-bell"
          size="sm"
          aria-label="Notifications"
          class="relative"
          @click="showNotifications = !showNotifications"
        >
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
        </UButton>

        <div
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl z-50 transition-all duration-150 ease-out"
        >
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <span class="text-xs font-semibold text-white">Notifications</span>
            <span class="text-[10px] text-slate-500">2 unread</span>
          </div>
          <div class="py-2 space-y-2">
            <div
              v-for="n in notifications"
              :key="n.id"
              class="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-xs transition-colors"
            >
              <div class="flex items-center justify-between font-medium text-slate-200">
                <span>{{ n.title }}</span>
                <span class="text-[10px] text-slate-500">{{ n.time }}</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">
                {{ n.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- User Menu -->
      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          @click="showUserMenu = !showUserMenu"
        >
          <div
            class="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-semibold text-white text-xs"
          >
            {{ authStore.user?.username?.substring(0, 2).toUpperCase() || 'AD' }}
          </div>
          <div class="hidden lg:block text-left text-xs">
            <div class="font-medium text-white leading-tight">
              {{ authStore.user?.displayName || 'Administrator' }}
            </div>
            <div class="text-[10px] text-slate-400 leading-tight">
              {{ authStore.user?.role || 'ADMIN' }}
            </div>
          </div>
          <UIcon name="i-lucide-chevron-down" class="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 transition-all duration-150 ease-out space-y-1"
        >
          <div class="px-3 py-2 border-b border-slate-800">
            <div class="text-xs font-semibold text-white">
              {{ authStore.user?.displayName || 'Platform Administrator' }}
            </div>
            <div class="text-[11px] text-slate-400">admin@xregion.local</div>
          </div>
          <NuxtLink
            to="/login"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            @click="showUserMenu = false"
          >
            <UIcon name="i-lucide-key-round" class="w-4 h-4 text-slate-400" />
            <span>Switch Account</span>
          </NuxtLink>
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            @click="logout"
          >
            <UIcon name="i-lucide-log-out" class="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
