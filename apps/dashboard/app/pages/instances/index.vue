<script setup lang="ts">
useHead({ title: 'Instances' })
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Instances</h1>
        <p class="text-sm text-slate-400 mt-1">
          Compute virtual machines across active cloud regions
        </p>
      </div>
      <NuxtLink
        to="/instances/create"
        class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
      >
        Launch Instance
      </NuxtLink>
    </div>

    <div class="p-8 border border-slate-800 rounded-xl bg-slate-900/40 text-center space-y-2">
      <div class="text-sm font-medium text-slate-300">Phase 0: Instances route placeholder</div>
      <p class="text-xs text-slate-500">
        Full instance management UI will be implemented in Phase 2.
      </p>
    </div>
  </div>
</template>
