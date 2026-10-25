<script setup lang="ts">
const navLinks = [
  { label: 'Overview', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Instances', to: '/instances', icon: 'i-lucide-server' },
  { label: 'Snapshots', to: '/snapshots', icon: 'i-lucide-camera' },
  { label: 'Scenarios', to: '/migrations/scenarios', icon: 'i-lucide-git-branch' },
  { label: 'Migrations', to: '/migrations/history', icon: 'i-lucide-arrow-left-right' },
  { label: 'Network', to: '/network', icon: 'i-lucide-network' },
  { label: 'DNS Routing', to: '/network/dns', icon: 'i-lucide-globe' },
  { label: 'Monitoring', to: '/monitoring', icon: 'i-lucide-activity' },
  { label: 'Logs', to: '/logs', icon: 'i-lucide-file-text' }
]
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <!-- Top Navigation -->
    <header
      class="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20"
        >
          XR
        </div>
        <div>
          <span class="font-bold text-white tracking-wide">XRegion-EC2</span>
          <span
            class="text-xs text-slate-400 ml-2 px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
            >Mock Mode</span
          >
        </div>
      </div>
      <div class="flex items-center gap-4 text-sm text-slate-300">
        <span class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Region A: ap-southeast-1
        </span>
        <span class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Region B: us-east-1
        </span>
      </div>
    </header>

    <div class="flex flex-1">
      <!-- Sidebar Navigation -->
      <aside class="w-64 border-r border-slate-800 bg-slate-900/40 p-4 space-y-1">
        <div class="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">
          Management
        </div>
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          active-class="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold"
        >
          <UIcon :name="link.icon" class="w-4 h-4 shrink-0" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
