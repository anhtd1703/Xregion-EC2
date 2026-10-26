<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'cards' | 'table' | 'detail'
    count?: number
  }>(),
  {
    type: 'cards',
    count: 4
  }
)
</script>

<template>
  <div
    v-if="type === 'cards'"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse"
  >
    <div
      v-for="i in count"
      :key="i"
      class="h-28 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
    >
      <div class="h-3 w-20 rounded bg-slate-800" />
      <div class="h-7 w-28 rounded bg-slate-800" />
      <div class="h-3 w-36 rounded bg-slate-800/60" />
    </div>
  </div>

  <div
    v-else-if="type === 'table'"
    class="space-y-3 animate-pulse border border-slate-800 rounded-xl bg-slate-900/40 p-4"
  >
    <div class="h-8 rounded bg-slate-800/80 mb-4" />
    <div v-for="i in count" :key="i" class="h-10 rounded bg-slate-800/40" />
  </div>

  <div v-else class="space-y-4 animate-pulse">
    <div class="h-12 w-1/3 rounded bg-slate-800" />
    <div class="h-48 rounded-xl bg-slate-800/40" />
    <div class="h-64 rounded-xl bg-slate-800/40" />
  </div>
</template>
