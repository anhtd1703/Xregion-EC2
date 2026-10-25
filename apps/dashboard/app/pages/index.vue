<script setup lang="ts">
useHead({ title: 'Overview' })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Cross-Region Control Plane</h1>
      <p class="text-sm text-slate-400 mt-1">
        Multi-region infrastructure overview and migration status
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div class="text-xs font-medium text-slate-400">Total Instances</div>
        <div class="text-2xl font-bold text-white mt-1">3</div>
      </div>
      <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div class="text-xs font-medium text-slate-400">Running Instances</div>
        <div class="text-2xl font-bold text-emerald-400 mt-1">2</div>
      </div>
      <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div class="text-xs font-medium text-slate-400">Migration Success Rate</div>
        <div class="text-2xl font-bold text-indigo-400 mt-1">100%</div>
      </div>
      <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div class="text-xs font-medium text-slate-400">Estimated Cost</div>
        <div class="text-2xl font-bold text-amber-400 mt-1">$136.80/mo</div>
      </div>
    </div>
  </div>
</template>
