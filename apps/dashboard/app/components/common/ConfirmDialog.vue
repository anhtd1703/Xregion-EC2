<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
    loading?: boolean
  }>(),
  {
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    danger: false,
    loading: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm' | 'cancel'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function onConfirm() {
  emit('confirm')
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-150"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
    >
      <div class="flex items-start gap-3">
        <div
          class="p-2.5 rounded-xl shrink-0"
          :class="
            danger
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
          "
        >
          <UIcon
            :name="danger ? 'i-lucide-alert-triangle' : 'i-lucide-help-circle'"
            class="w-5 h-5"
          />
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-white">
            {{ title }}
          </h3>
          <p v-if="description" class="text-xs text-slate-400 leading-relaxed">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <UButton color="neutral" variant="outline" size="sm" :disabled="loading" @click="close">
          {{ cancelLabel }}
        </UButton>
        <UButton
          :color="danger ? 'error' : 'primary'"
          variant="solid"
          size="sm"
          :loading="loading"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </UButton>
      </div>
    </div>
  </div>
</template>
