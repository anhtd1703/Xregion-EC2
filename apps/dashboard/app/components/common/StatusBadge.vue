<script setup lang="ts">
import type { InstanceStatus, MigrationStatus } from '@xregion/contracts'

const props = defineProps<{
  status: InstanceStatus | MigrationStatus | string
  size?: 'sm' | 'md'
}>()

const config = computed(() => {
  switch (props.status) {
    case 'RUNNING':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'AVAILABLE':
      return {
        label: props.status,
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400'
      }
    case 'MIGRATING':
    case 'IN_PROGRESS':
    case 'COPYING':
    case 'CREATING':
      return {
        label: props.status,
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400 animate-pulse'
      }
    case 'ROLLING_BACK':
    case 'ROLLED_BACK':
      return {
        label: props.status,
        color: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        dot: 'bg-orange-400'
      }
    case 'STOPPED':
    case 'PAUSED':
      return {
        label: props.status,
        color: 'bg-slate-700/30 text-slate-400 border-slate-700/50',
        dot: 'bg-slate-500'
      }
    case 'ERROR':
    case 'FAILED':
      return {
        label: props.status,
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400'
      }
    case 'PENDING':
      return {
        label: props.status,
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        dot: 'bg-blue-400'
      }
    default:
      return {
        label: props.status,
        color: 'bg-slate-800 text-slate-300 border-slate-700',
        dot: 'bg-slate-400'
      }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium tracking-wide shrink-0 transition-colors"
    :class="[config.color, size === 'sm' ? 'text-[11px] leading-4' : 'text-xs leading-5']"
  >
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="config.dot" />
    <span>{{ config.label }}</span>
  </span>
</template>
