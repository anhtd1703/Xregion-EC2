<script setup lang="ts">
import type { RegionId } from '@xregion/contracts'

const props = withDefaults(
  defineProps<{
    region: RegionId | string
    showDetails?: boolean
  }>(),
  {
    showDetails: false
  }
)

const regionMeta = computed(() => {
  if (props.region === 'REGION_A') {
    return {
      label: 'Region A',
      location: 'ap-southeast-1',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }
  }
  if (props.region === 'REGION_B') {
    return {
      label: 'Region B',
      location: 'us-east-1',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    }
  }
  return {
    label: props.region,
    location: 'Cloud Region',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide shrink-0"
    :class="regionMeta.badgeClass"
  >
    <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 shrink-0 opacity-80" />
    <span>{{ regionMeta.label }}</span>
    <span v-if="showDetails" class="opacity-75 font-normal text-[11px]">
      ({{ regionMeta.location }})
    </span>
  </span>
</template>
