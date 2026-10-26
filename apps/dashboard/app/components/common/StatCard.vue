<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    icon?: string
    subtext?: string
    trend?: 'up' | 'down' | 'neutral'
    changeText?: string
    color?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose'
    loading?: boolean
  }>(),
  {
    icon: 'i-lucide-activity',
    subtext: '',
    trend: 'neutral',
    changeText: '',
    color: 'indigo',
    loading: false
  }
)

const colorStyles = computed(() => {
  switch (props.color) {
    case 'emerald':
      return {
        bgIcon: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        textValue: 'text-emerald-400',
        glow: 'group-hover:border-emerald-500/40'
      }
    case 'amber':
      return {
        bgIcon: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        textValue: 'text-amber-400',
        glow: 'group-hover:border-amber-500/40'
      }
    case 'cyan':
      return {
        bgIcon: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
        textValue: 'text-cyan-400',
        glow: 'group-hover:border-cyan-500/40'
      }
    case 'rose':
      return {
        bgIcon: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        textValue: 'text-rose-400',
        glow: 'group-hover:border-rose-500/40'
      }
    default:
      return {
        bgIcon: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
        textValue: 'text-white',
        glow: 'group-hover:border-indigo-500/40'
      }
  }
})
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-slate-900/90"
    :class="colorStyles.glow"
  >
    <div v-if="loading" class="space-y-3 animate-pulse">
      <div class="h-4 w-24 rounded bg-slate-800" />
      <div class="h-8 w-16 rounded bg-slate-800" />
      <div class="h-3 w-32 rounded bg-slate-800/60" />
    </div>

    <div v-else class="flex items-start justify-between">
      <div class="space-y-2">
        <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">
          {{ title }}
        </span>
        <div class="text-2xl font-bold tracking-tight" :class="colorStyles.textValue">
          {{ value }}
        </div>
        <div v-if="subtext || changeText" class="flex items-center gap-1.5 text-xs text-slate-400">
          <span
            v-if="changeText"
            class="font-medium"
            :class="{
              'text-emerald-400': trend === 'up',
              'text-rose-400': trend === 'down',
              'text-slate-400': trend === 'neutral' || !trend
            }"
          >
            {{ changeText }}
          </span>
          <span v-if="subtext">{{ subtext }}</span>
        </div>
      </div>

      <div class="rounded-lg p-2.5" :class="colorStyles.bgIcon">
        <UIcon :name="icon" class="w-5 h-5 shrink-0" />
      </div>
    </div>
  </div>
</template>
