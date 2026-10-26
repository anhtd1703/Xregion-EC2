<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80"
  >
    <div>
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold tracking-tight text-white">
          {{ title }}
        </h1>
        <slot name="badge" />
      </div>
      <p v-if="description" class="text-sm text-slate-400 mt-1">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-3 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
