<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    message?: string
    retryLabel?: string
  }>(),
  {
    title: 'An error occurred',
    message: 'Unable to load data at this time.',
    retryLabel: 'Try Again'
  }
)

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center p-8 text-center border border-rose-500/20 rounded-2xl bg-rose-500/5"
  >
    <div
      class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3"
    >
      <UIcon name="i-lucide-alert-triangle" class="w-5 h-5" />
    </div>
    <h3 class="text-sm font-semibold text-rose-200">
      {{ title }}
    </h3>
    <p class="text-xs text-rose-300/80 max-w-md mt-1 mb-4">
      {{ message }}
    </p>
    <UButton
      color="error"
      variant="soft"
      size="xs"
      icon="i-lucide-rotate-cw"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </UButton>
  </div>
</template>
