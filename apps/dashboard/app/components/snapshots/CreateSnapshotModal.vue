<script setup lang="ts">
import type { Instance, Snapshot } from '@xregion/contracts'
import { useSnapshotsApi } from '../../composables/useSnapshotsApi.js'

const props = defineProps<{
  modelValue: boolean
  instance?: Instance | null
  availableInstances?: Instance[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', snapshot: Snapshot): void
}>()

const snapshotsApi = useSnapshotsApi()

const selectedInstanceId = ref('')
const name = ref('')
const description = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const activeInstance = computed(() => {
  if (props.instance) return props.instance
  if (props.availableInstances) {
    return props.availableInstances.find((i) => i.id === selectedInstanceId.value) || null
  }
  return null
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      error.value = null
      if (props.instance) {
        selectedInstanceId.value = props.instance.id
        name.value = `${props.instance.name}-snap-${Date.now().toString(36).slice(-4)}`
      } else if (props.availableInstances && props.availableInstances.length > 0) {
        selectedInstanceId.value = props.availableInstances[0].id
        name.value = `${props.availableInstances[0].name}-snap-${Date.now().toString(36).slice(-4)}`
      } else {
        selectedInstanceId.value = ''
        name.value = ''
      }
      description.value = ''
    }
  }
)

watch(selectedInstanceId, (newId) => {
  if (!props.instance && newId && props.availableInstances) {
    const inst = props.availableInstances.find((i) => i.id === newId)
    if (inst) {
      name.value = `${inst.name}-snap-${Date.now().toString(36).slice(-4)}`
    }
  }
})

async function handleCreate() {
  const targetId = props.instance?.id || selectedInstanceId.value
  if (!targetId) {
    error.value = 'Please select a source compute instance'
    return
  }

  loading.value = true
  error.value = null

  try {
    const created = await snapshotsApi.createInstanceSnapshot(targetId, {
      name: name.value.trim() || undefined,
      description: description.value.trim() || undefined
    })
    emit('created', created)
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e?.message || 'Failed to create snapshot'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-150"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5"
    >
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div
            class="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
          >
            <UIcon name="i-lucide-camera" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Create Volume Snapshot</h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Point-in-time storage backup ready for cross-region replication
            </p>
          </div>
        </div>
        <button
          type="button"
          class="text-slate-400 hover:text-white transition-colors"
          @click="emit('update:modelValue', false)"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2.5"
      >
        <UIcon name="i-lucide-alert-circle" class="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
        <span>{{ error }}</span>
      </div>

      <!-- Source Instance Selector / Display -->
      <div class="space-y-2">
        <label class="block text-xs font-medium text-slate-300"> Source Instance </label>

        <!-- Fixed Instance (when launched from detail page) -->
        <div
          v-if="instance"
          class="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 text-xs flex items-center justify-between"
        >
          <div class="flex items-center gap-2.5">
            <UIcon name="i-lucide-server" class="w-4 h-4 text-indigo-400" />
            <div>
              <div class="font-semibold text-white">{{ instance.name }}</div>
              <div class="font-mono text-[11px] text-slate-400">ID: {{ instance.id }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <CommonRegionBadge :region="instance.region" show-details />
            <span class="text-slate-400 font-mono text-[11px]">{{ instance.diskGb }} GB</span>
          </div>
        </div>

        <!-- Dropdown Selector (when launched from /snapshots page) -->
        <div v-else-if="availableInstances && availableInstances.length > 0">
          <select
            v-model="selectedInstanceId"
            class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option v-for="inst in availableInstances" :key="inst.id" :value="inst.id">
              {{ inst.name }} ({{ inst.id }}) —
              {{ inst.region === 'REGION_A' ? 'ap-southeast-1' : 'us-east-1' }} —
              {{ inst.diskGb }} GB
            </option>
          </select>
        </div>

        <div v-else class="text-xs text-amber-400 p-2 bg-amber-500/10 rounded-lg">
          No running instances available to snapshot.
        </div>
      </div>

      <!-- Snapshot Name Input -->
      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-300">
          Snapshot Name <span class="text-rose-400">*</span>
        </label>
        <input
          v-model="name"
          type="text"
          placeholder="e.g. web-api-gateway-backup"
          class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p class="text-[11px] text-slate-500">
          A memorable label for this point-in-time EBS volume copy.
        </p>
      </div>

      <!-- Description Input -->
      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-300">
          Description <span class="text-slate-500">(Optional)</span>
        </label>
        <textarea
          v-model="description"
          rows="2"
          placeholder="e.g. Scheduled pre-deployment snapshot before major API update"
          class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </div>

      <!-- Summary Info Box -->
      <div
        v-if="activeInstance"
        class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1"
      >
        <div class="flex justify-between">
          <span class="text-indigo-400">Captured Region:</span>
          <span class="font-mono text-white">
            {{
              activeInstance.region === 'REGION_A'
                ? 'ap-southeast-1 (Singapore)'
                : 'us-east-1 (N. Virginia)'
            }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-indigo-400">Captured Size:</span>
          <span class="font-mono text-white">{{ activeInstance.diskGb }} GB</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="loading"
          @click="emit('update:modelValue', false)"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          variant="solid"
          size="sm"
          icon="i-lucide-camera"
          :loading="loading"
          :disabled="!name.trim() || (!instance && !selectedInstanceId)"
          @click="handleCreate"
        >
          Take Snapshot
        </UButton>
      </div>
    </div>
  </div>
</template>
