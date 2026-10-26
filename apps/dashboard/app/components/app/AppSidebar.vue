<script setup lang="ts">
defineProps<{
  mobileOpen?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const navSections = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/', icon: 'i-lucide-layout-dashboard' }]
  },
  {
    title: 'Compute',
    items: [
      { label: 'Instances', to: '/instances', icon: 'i-lucide-server' },
      { label: 'Images & Snapshots', to: '/snapshots', icon: 'i-lucide-camera' }
    ]
  },
  {
    title: 'Cross-Region',
    items: [
      { label: 'Migration Scenarios', to: '/migrations/scenarios', icon: 'i-lucide-git-branch' },
      { label: 'Migration History', to: '/migrations/history', icon: 'i-lucide-arrow-left-right' }
    ]
  },
  {
    title: 'Network & Routing',
    items: [
      { label: 'Networking', to: '/network', icon: 'i-lucide-network' },
      { label: 'DNS Routing', to: '/network/dns', icon: 'i-lucide-globe' }
    ]
  },
  {
    title: 'Observability',
    items: [
      { label: 'Monitoring', to: '/monitoring', icon: 'i-lucide-activity' },
      { label: 'Structured Logs', to: '/logs', icon: 'i-lucide-file-text' }
    ]
  }
]
</script>

<template>
  <div>
    <!-- Desktop Sidebar -->
    <aside
      class="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-900/40 min-h-[calc(100vh-65px)] p-4 shrink-0 justify-between"
    >
      <div class="space-y-6">
        <div v-for="section in navSections" :key="section.title" class="space-y-1">
          <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
            {{ section.title }}
          </div>
          <NuxtLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all group"
            active-class="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold"
          >
            <UIcon
              :name="item.icon"
              class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Footer Info in Sidebar -->
      <div class="pt-4 border-t border-slate-800/80 space-y-2">
        <div
          class="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400"
        >
          <div class="flex items-center justify-between text-slate-300 font-medium mb-1">
            <span>Control Plane</span>
            <span class="text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Online
            </span>
          </div>
          <div class="text-slate-500 text-[10px]">Mock Provider v1.0</div>
        </div>
      </div>
    </aside>

    <!-- Mobile Slideover / Drawer -->
    <div v-if="mobileOpen" class="fixed inset-0 z-50 lg:hidden flex">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
      />

      <!-- Drawer Content -->
      <div
        class="relative w-72 max-w-[80vw] bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between z-10"
      >
        <div class="space-y-6 overflow-y-auto">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <div
                class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs"
              >
                XR
              </div>
              <span class="font-bold text-sm text-white">XRegion-EC2</span>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="xs"
              @click="$emit('close')"
            />
          </div>

          <div v-for="section in navSections" :key="section.title" class="space-y-1">
            <div
              class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1"
            >
              {{ section.title }}
            </div>
            <NuxtLink
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
              active-class="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold"
              @click="$emit('close')"
            >
              <UIcon :name="item.icon" class="w-4 h-4 shrink-0" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          XRegion-EC2 Cloud Capstone
        </div>
      </div>
    </div>
  </div>
</template>
