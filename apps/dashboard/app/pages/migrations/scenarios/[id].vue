<script setup lang="ts">
const route = useRoute()
const scenarioId = computed(() => route.params.id as string)

useHead({ title: `Scenario ${scenarioId.value}` })
</script>

<template>
  <div class="space-y-6">
    <div>
      <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
        <NuxtLink to="/migrations/scenarios" class="hover:text-white">Scenarios</NuxtLink>
        <span>/</span>
        <span>{{ scenarioId }}</span>
      </div>
      <h1 class="text-2xl font-bold text-white">
        {{ scenarioId }}
      </h1>
    </div>

    <div class="p-8 border border-slate-800 rounded-xl bg-slate-900/40 text-center space-y-2">
      <div class="text-sm font-medium text-slate-300">
        Phase 0: Scenario Detail route placeholder
      </div>
      <p class="text-xs text-slate-500">
        Scenario settings and manual run triggers will be implemented in Phase 4.
      </p>
    </div>
  </div>
</template>
