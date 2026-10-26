<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: string
    actionLabel?: string
  }>(),
  {
    icon: 'i-lucide-inbox',
    description: 'No resources found in the current view.',
    actionLabel: ''
  }
)

defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30"
  >
    <div
      class="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4"
    >
      <UIcon :name="icon" class="w-6 h-6" />
    </div>
    <h3 class="text-base font-semibold text-white">
      {{ title }}
    </h3>
    <p v-if="description" class="text-sm text-slate-400 max-w-sm mt-1.5 mb-5">
      {{ description }}
    </p>
    <UButton v-if="actionLabel" color="primary" variant="solid" size="sm" @click="$emit('action')">
      {{ actionLabel }}
    </UButton>
  </div>
</template>
