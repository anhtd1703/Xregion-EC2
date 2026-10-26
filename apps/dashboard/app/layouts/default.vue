<script setup lang="ts">
import AppHeader from '../components/app/AppHeader.vue'
import AppSidebar from '../components/app/AppSidebar.vue'
import BreadcrumbNav from '../components/app/BreadcrumbNav.vue'

const mobileOpen = ref(false)

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}
</script>

<template>
  <div
    class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white"
  >
    <!-- Top Header -->
    <AppHeader @toggle-mobile="toggleMobile" />

    <div class="flex flex-1">
      <!-- Sidebar (Desktop & Mobile) -->
      <AppSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />

      <!-- Main Content Area -->
      <main class="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <!-- Dynamic Breadcrumb Navigation -->
        <BreadcrumbNav />

        <!-- Page Outlet -->
        <slot />
      </main>
    </div>
  </div>
</template>
