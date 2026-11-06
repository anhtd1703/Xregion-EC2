<script setup lang="ts">
import type { Snapshot } from '@xregion/contracts'

const props = defineProps<{
  modelValue: boolean
  snapshot: Snapshot | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'request-copy' | 'request-delete', snapshot: Snapshot): void
}>()

function handleDelete() {
  if (!props.snapshot) return
  emit('update:modelValue', false)
  emit('request-delete', props.snapshot)
}

function handleCopy() {
  if (!props.snapshot) return
  emit('update:modelValue', false)
  emit('request-copy', props.snapshot)
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
        <div class="space-y-1">
          <div class="flex items-center gap-2.5">
            <h3 class="text-base font-semibold text-white">{{ snapshot.name }}</h3>
            <CommonStatusBadge :status="snapshot.status" />
          </div>
          <div class="text-xs font-mono text-slate-400">ID: {{ snapshot.id }}</div>
        </div>
        <button
          type="button"
          class="text-slate-400 hover:text-white transition-colors"
          @click="emit('update:modelValue', false)"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Detail Grid -->
      <div class="space-y-3 text-xs divide-y divide-slate-800/80">
        <!-- Physical Region -->
        <div class="flex items-center justify-between pt-1">
          <span class="text-slate-400">Current Storage Region:</span>
          <CommonRegionBadge :region="snapshot.region" show-details />
        </div>

        <!-- Source Origin Region -->
        <div class="flex items-center justify-between pt-2">
          <span class="text-slate-400">Originating Region:</span>
          <CommonRegionBadge :region="snapshot.sourceRegion" show-details />
        </div>

        <!-- Size -->
        <div class="flex items-center justify-between pt-2">
          <span class="text-slate-400">Volume Size:</span>
          <span class="font-mono text-emerald-400 font-semibold">{{ snapshot.sizeGb }} GB SSD</span>
        </div>

        <!-- Source Instance -->
        <div class="flex items-center justify-between pt-2">
          <span class="text-slate-400">Source Instance:</span>
          <NuxtLink
            :to="`/instances/${snapshot.instanceId}`"
            class="font-mono text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
          >
            <span>{{ snapshot.instanceName || snapshot.instanceId }}</span>
            <UIcon name="i-lucide-external-link" class="w-3 h-3" />
          </NuxtLink>
        </div>

        <!-- Copy Provenance -->
        <div v-if="snapshot.copiedFromSnapshotId" class="flex items-center justify-between pt-2">
          <span class="text-slate-400">Copied From Snapshot:</span>
          <span class="font-mono text-slate-300">{{ snapshot.copiedFromSnapshotId }}</span>
        </div>

        <!-- Replicated Destinations -->
        <div
          v-if="snapshot.copiedRegions && snapshot.copiedRegions.length > 0"
          class="flex items-center justify-between pt-2"
        >
          <span class="text-slate-400">Replicated In:</span>
          <div class="flex gap-1.5">
            <CommonRegionBadge
              v-for="r in snapshot.copiedRegions"
              :key="r"
              :region="r"
              show-details
            />
          </div>
        </div>

        <!-- Description -->
        <div v-if="snapshot.description" class="pt-2 space-y-1">
          <span class="text-slate-400">Description:</span>
          <p class="text-slate-300 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
            {{ snapshot.description }}
          </p>
        </div>

        <!-- Timestamps -->
        <div class="flex items-center justify-between pt-2">
          <span class="text-slate-400">Created:</span>
          <span class="font-mono text-slate-300">{{
            new Date(snapshot.createdAt).toLocaleString()
          }}</span>
        </div>
        <div class="flex items-center justify-between pt-2">
          <span class="text-slate-400">Last Modified:</span>
          <span class="font-mono text-slate-300">{{
            new Date(snapshot.updatedAt).toLocaleString()
          }}</span>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-800">
        <UButton
          color="error"
          variant="ghost"
          size="sm"
          icon="i-lucide-trash-2"
          @click="handleDelete"
        >
          Delete Snapshot
        </UButton>

        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            @click="emit('update:modelValue', false)"
          >
            Close
          </UButton>
          <UButton
            color="primary"
            variant="solid"
            size="sm"
            icon="i-lucide-copy"
            :disabled="snapshot.status !== 'AVAILABLE'"
            @click="handleCopy"
          >
            Copy to {{ snapshot.region === 'REGION_A' ? 'Region B' : 'Region A' }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
