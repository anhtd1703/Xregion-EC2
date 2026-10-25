<script setup lang="ts">
useHead({ title: 'Migration Scenarios' })
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Migration Scenarios</h1>
        <p class="text-sm text-slate-400 mt-1">
          Automated scheduled and manual cross-region migration policies
        </p>
      </div>
      <NuxtLink
        to="/migrations/scenarios/create"
        class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
      >
        Create Scenario
      </NuxtLink>
    </div>

    <div class="p-8 border border-slate-800 rounded-xl bg-slate-900/40 text-center space-y-2">
      <div class="text-sm font-medium text-slate-300">
        Phase 0: Migration Scenarios route placeholder
      </div>
      <p class="text-xs text-slate-500">
        Scenario policies and configuration cards will be implemented in Phase 4.
      </p>
    </div>
  </div>
</template>
