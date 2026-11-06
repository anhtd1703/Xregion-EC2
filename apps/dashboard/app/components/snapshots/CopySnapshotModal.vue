<script setup lang="ts">
import type { RegionId, Snapshot } from '@xregion/contracts'
import { useSnapshotsApi } from '../../composables/useSnapshotsApi.js'

const props = defineProps<{
  modelValue: boolean
  snapshot: Snapshot | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'copied', copiedSnapshot: Snapshot): void
}>()

const snapshotsApi = useSnapshotsApi()
const loading = ref(false)
const error = ref<string | null>(null)

const targetRegion = computed<RegionId>(() => {
  if (!props.snapshot) return 'REGION_B'
  return props.snapshot.region === 'REGION_A' ? 'REGION_B' : 'REGION_A'
})

const targetLocationName = computed(() => {
  return targetRegion.value === 'REGION_A'
    ? 'ap-southeast-1 (Singapore Datacenter)'
    : 'us-east-1 (N. Virginia Datacenter)'
})

const sourceLocationName = computed(() => {
  if (!props.snapshot) return ''
  return props.snapshot.region === 'REGION_A'
    ? 'ap-southeast-1 (Singapore Datacenter)'
    : 'us-east-1 (N. Virginia Datacenter)'
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      error.value = null
    }
  }
)

async function handleCopy() {
  if (!props.snapshot) return
  loading.value = true
  error.value = null

  try {
    const copied = await snapshotsApi.copySnapshot(props.snapshot.id, targetRegion.value)
    emit('copied', copied)
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e?.message || 'Failed to copy snapshot across regions'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    v-if="modelValue && snapshot"
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
            <UIcon name="i-lucide-copy" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Copy Snapshot Across Regions</h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Replicate volume snapshot to enable cross-region recovery and instance restore
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

      <!-- Replication Flow Visual Cards -->
      <div class="space-y-3">
        <!-- Source Snapshot Details -->
        <div class="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 text-xs space-y-2">
          <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Source Snapshot
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Snapshot Name:</span>
            <span class="font-medium text-white">{{ snapshot.name }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Snapshot ID:</span>
            <span class="font-mono text-slate-300">{{ snapshot.id }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Source Region:</span>
            <CommonRegionBadge :region="snapshot.region" show-details />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Source Location:</span>
            <span class="text-slate-300">{{ sourceLocationName }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Storage Size:</span>
            <span class="font-mono text-emerald-400 font-semibold">{{ snapshot.sizeGb }} GB</span>
          </div>
        </div>

        <!-- Direction Arrow -->
        <div class="flex items-center justify-center">
          <div
            class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs"
          >
            <UIcon name="i-lucide-arrow-down" class="w-3.5 h-3.5" />
            <span>Replicating to Destination</span>
          </div>
        </div>

        <!-- Destination Target Details -->
        <div class="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-xs space-y-2">
          <div class="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
            Destination Target
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Target Region:</span>
            <CommonRegionBadge :region="targetRegion" show-details />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Target Datacenter:</span>
            <span class="font-mono text-indigo-200">{{ targetLocationName }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Preserved Storage:</span>
            <span class="font-mono text-slate-200">{{ snapshot.sizeGb }} GB SSD Volume</span>
          </div>
        </div>
      </div>

      <!-- Replication Guarantee Notice -->
      <div
        class="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-1"
      >
        <div class="flex items-center gap-1.5 text-slate-300 font-medium">
          <UIcon name="i-lucide-shield-check" class="w-4 h-4 text-emerald-400" />
          Cross-Region Replication Policy
        </div>
        <p class="text-[11px] text-slate-400">
          The source snapshot in
          <span class="text-slate-200">{{
            snapshot.region === 'REGION_A' ? 'Singapore' : 'N. Virginia'
          }}</span>
          remains intact. A new independent snapshot will be provisioned in the secondary region
          with linked provenance for Phase 5 disaster recovery restore.
        </p>
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
          icon="i-lucide-copy"
          :loading="loading"
          @click="handleCopy"
        >
          Confirm Cross-Region Copy
        </UButton>
      </div>
    </div>
  </div>
</template>
