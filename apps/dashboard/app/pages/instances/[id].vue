<script setup lang="ts">
const route = useRoute()
const instanceId = computed(() => route.params.id as string)

useHead({ title: `Instance ${instanceId.value}` })
</script>

<template>
  <div class="space-y-6">
    <div>
      <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
        <NuxtLink to="/instances" class="hover:text-white">Instances</NuxtLink>
        <span>/</span>
        <span>{{ instanceId }}</span>
      </div>
      <h1 class="text-2xl font-bold text-white">
        {{ instanceId }}
      </h1>
    </div>

    <div class="p-8 border border-slate-800 rounded-xl bg-slate-900/40 text-center space-y-2">
      <div class="text-sm font-medium text-slate-300">
        Phase 0: Instance Detail route placeholder
      </div>
      <p class="text-xs text-slate-500">
        Instance details and metrics tabs will be implemented in Phase 2.
      </p>
    </div>
  </div>
</template>
