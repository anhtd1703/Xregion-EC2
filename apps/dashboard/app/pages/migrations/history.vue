<script setup lang="ts">
useHead({ title: 'Migration History' })
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Migration History</h1>
        <p class="text-sm text-slate-400 mt-1">
          Cross-region VM migration records and rollback audit trail
        </p>
      </div>
      <NuxtLink
        to="/migrations/scenarios"
        class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
      >
        View Scenarios
      </NuxtLink>
    </div>

    <div class="p-8 border border-slate-800 rounded-xl bg-slate-900/40 text-center space-y-2">
      <div class="text-sm font-medium text-slate-300">
        Phase 0: Migration History route placeholder
      </div>
      <p class="text-xs text-slate-500">
        Migration history table and execution tracking will be implemented in Phase 5.
      </p>
    </div>
  </div>
</template>
