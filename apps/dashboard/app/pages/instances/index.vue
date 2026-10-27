<script setup lang="ts">
import type { Instance, InstanceStatus, RegionId } from '@xregion/contracts'
import { useInstancesApi } from '../../composables/useInstancesApi.js'
import { useAppStore } from '../../stores/app.js'

useHead({ title: 'Instances — XRegion-EC2' })

const appStore = useAppStore()
const instancesApi = useInstancesApi()

// Local state
const instances = ref<Instance[]>([])
const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)

// Notification state
const toastMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(text: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = { text, type }
  toastTimer = setTimeout(() => {
    toastMessage.value = null
  }, 4000)
}

// Filters
const searchQuery = ref('')
const selectedStatus = ref<InstanceStatus | 'ALL'>('ALL')
const selectedRegion = ref<RegionId | 'ALL'>(appStore.selectedRegion)

// Sync with global header region selection
watch(
  () => appStore.selectedRegion,
  (newRegion) => {
    selectedRegion.value = newRegion
    fetchInstances()
  }
)

// Computed KPI stats derived strictly from current returned instances
const kpiStats = computed(() => {
  const total = instances.value.length
  const running = instances.value.filter((i) => i.status === 'RUNNING').length
  const stopped = instances.value.filter((i) => i.status === 'STOPPED').length
  const migrating = instances.value.filter((i) => i.status === 'MIGRATING').length

  return { total, running, stopped, migrating }
})

// Filtered instances in table
const filteredInstances = computed(() => {
  return instances.value.filter((inst) => {
    // Status filter
    if (selectedStatus.value !== 'ALL' && inst.status !== selectedStatus.value) {
      return false
    }
    // Region filter
    if (selectedRegion.value !== 'ALL' && inst.region !== selectedRegion.value) {
      return false
    }
    // Text search
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = inst.name.toLowerCase().includes(q)
      const matchId = inst.id.toLowerCase().includes(q)
      const matchIp =
        inst.privateIp?.toLowerCase().includes(q) || inst.publicIp?.toLowerCase().includes(q)
      const matchImage = inst.imageName?.toLowerCase().includes(q)
      if (!matchName && !matchId && !matchIp && !matchImage) {
        return false
      }
    }
    return true
  })
})

async function fetchInstances() {
  loading.value = true
  error.value = null
  try {
    const data = await instancesApi.listInstances({
      region: selectedRegion.value !== 'ALL' ? selectedRegion.value : undefined
    })
    instances.value = data
  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e?.message || 'Failed to load instances'
  } finally {
    loading.value = false
  }
}

// Lifecycle actions
async function handleStart(instance: Instance) {
  if (instance.status === 'RUNNING' || instance.status === 'MIGRATING') return
  actionLoading.value = true
  try {
    await instancesApi.startInstance(instance.id)
    showToast(`Instance ${instance.name} (${instance.id}) started successfully`, 'success')
    await fetchInstances()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || `Failed to start ${instance.name}`, 'error')
  } finally {
    actionLoading.value = false
  }
}

async function handleStop(instance: Instance) {
  if (instance.status === 'STOPPED' || instance.status === 'MIGRATING') return
  actionLoading.value = true
  try {
    await instancesApi.stopInstance(instance.id)
    showToast(`Instance ${instance.name} (${instance.id}) stopped successfully`, 'success')
    await fetchInstances()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || `Failed to stop ${instance.name}`, 'error')
  } finally {
    actionLoading.value = false
  }
}

async function handleRestart(instance: Instance) {
  if (instance.status !== 'RUNNING') return
  actionLoading.value = true
  try {
    await instancesApi.restartInstance(instance.id)
    showToast(`Instance ${instance.name} (${instance.id}) restarted successfully`, 'success')
    await fetchInstances()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || `Failed to restart ${instance.name}`, 'error')
  } finally {
    actionLoading.value = false
  }
}

// Delete Confirmation Modal
const showDeleteConfirm = ref(false)
const instanceToDelete = ref<Instance | null>(null)

function confirmDelete(instance: Instance) {
  instanceToDelete.value = instance
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!instanceToDelete.value) return
  actionLoading.value = true
  try {
    await instancesApi.deleteInstance(instanceToDelete.value.id)
    showToast(`Instance ${instanceToDelete.value.name} deleted successfully`, 'success')
    showDeleteConfirm.value = false
    instanceToDelete.value = null
    await fetchInstances()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || 'Failed to delete instance', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Fast Migrate Info Modal
const showMigrateModal = ref(false)
const instanceToMigrate = ref<Instance | null>(null)

function openMigrateModal(instance: Instance) {
  instanceToMigrate.value = instance
  showMigrateModal.value = true
}

onMounted(() => {
  fetchInstances()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Notification Toast Banner -->
    <div
      v-if="toastMessage"
      class="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm transition-all duration-200"
      :class="
        toastMessage.type === 'success'
          ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-400'
          : 'bg-slate-900/95 border-rose-500/40 text-rose-400'
      "
    >
      <UIcon
        :name="
          toastMessage.type === 'success' ? 'i-lucide-check-circle-2' : 'i-lucide-alert-circle'
        "
        class="w-5 h-5 shrink-0"
      />
      <span class="font-medium text-slate-200">{{ toastMessage.text }}</span>
      <button
        type="button"
        class="ml-2 text-slate-400 hover:text-white"
        @click="toastMessage = null"
      >
        <UIcon name="i-lucide-x" class="w-4 h-4" />
      </button>
    </div>

    <!-- Page Header -->
    <CommonPageHeader
      title="Compute Instances"
      description="Manage cross-region virtual machines, monitor status, and control runtime lifecycle"
    >
      <template #badge>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Deterministic Mock Mode
        </span>
      </template>

      <template #actions>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          size="sm"
          :loading="loading"
          @click="fetchInstances"
        >
          Refresh
        </UButton>

        <NuxtLink to="/instances/create">
          <UButton color="primary" variant="solid" icon="i-lucide-plus" size="sm">
            Launch Instance
          </UButton>
        </NuxtLink>
      </template>
    </CommonPageHeader>

    <!-- Error State -->
    <CommonErrorState
      v-if="error"
      title="Failed to load instances"
      :message="error"
      @retry="fetchInstances"
    />

    <template v-else>
      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CommonStatCard
          title="Total Instances"
          :value="kpiStats.total"
          icon="i-lucide-server"
          subtext="Provisioned across regions"
          color="indigo"
          :loading="loading"
        />
        <CommonStatCard
          title="Running"
          :value="kpiStats.running"
          icon="i-lucide-play-circle"
          subtext="Active workloads"
          color="emerald"
          :loading="loading"
        />
        <CommonStatCard
          title="Stopped"
          :value="kpiStats.stopped"
          icon="i-lucide-stop-circle"
          subtext="Offline or standby"
          color="amber"
          :loading="loading"
        />
        <CommonStatCard
          title="Migrating"
          :value="kpiStats.migrating"
          icon="i-lucide-arrow-right-left"
          subtext="Active data replication"
          color="cyan"
          :loading="loading"
        />
      </div>

      <!-- Filter and Search Toolbar -->
      <div
        class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40"
      >
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <UIcon
            name="i-lucide-search"
            class="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, ID, IP address, OS..."
            class="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            @click="searchQuery = ''"
          >
            <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Status Filter -->
          <div
            class="flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-lg border border-slate-700/60"
          >
            <span class="text-[11px] text-slate-400 px-2 font-medium">Status:</span>
            <button
              v-for="st in ['ALL', 'RUNNING', 'STOPPED', 'MIGRATING'] as const"
              :key="st"
              type="button"
              class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              :class="
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              "
              @click="selectedStatus = st"
            >
              {{ st }}
            </button>
          </div>

          <!-- Region Filter -->
          <div
            class="flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-lg border border-slate-700/60"
          >
            <span class="text-[11px] text-slate-400 px-2 font-medium">Region:</span>
            <select
              v-model="selectedRegion"
              class="bg-transparent text-xs text-slate-200 focus:outline-none pr-2 cursor-pointer font-medium"
              @change="fetchInstances"
            >
              <option value="ALL" class="bg-slate-900 text-slate-200">All Regions</option>
              <option value="REGION_A" class="bg-slate-900 text-emerald-400">
                Region A (Singapore)
              </option>
              <option value="REGION_B" class="bg-slate-900 text-indigo-400">
                Region B (N. Virginia)
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <CommonLoadingSkeleton v-if="loading" variant="table" :rows="6" />

      <!-- Instances Table -->
      <div
        v-else-if="filteredInstances.length > 0"
        class="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead
              class="bg-slate-800/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]"
            >
              <tr>
                <th class="py-3.5 px-4">Instance / ID</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Region</th>
                <th class="py-3.5 px-4">OS / Image</th>
                <th class="py-3.5 px-4">Specs & Flavor</th>
                <th class="py-3.5 px-4">IP Addresses</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr
                v-for="instance in filteredInstances"
                :key="instance.id"
                class="hover:bg-slate-800/40 transition-colors group"
              >
                <!-- Name & ID -->
                <td class="py-3 px-4">
                  <NuxtLink
                    :to="`/instances/${instance.id}`"
                    class="font-semibold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{{ instance.name }}</span>
                    <UIcon
                      name="i-lucide-arrow-up-right"
                      class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400"
                    />
                  </NuxtLink>
                  <div class="font-mono text-[11px] text-slate-500 mt-0.5">
                    {{ instance.id }}
                  </div>
                </td>

                <!-- Status -->
                <td class="py-3 px-4">
                  <CommonStatusBadge :status="instance.status" />
                </td>

                <!-- Region -->
                <td class="py-3 px-4">
                  <CommonRegionBadge :region="instance.region" show-details />
                </td>

                <!-- Image -->
                <td class="py-3 px-4 text-slate-300">
                  <div class="font-medium text-slate-200">
                    {{ instance.imageName || instance.imageId }}
                  </div>
                  <div class="text-[11px] text-slate-500">{{ instance.imageId }}</div>
                </td>

                <!-- Specs -->
                <td class="py-3 px-4">
                  <div class="font-medium text-slate-200">
                    {{
                      instance.flavorId ||
                      `${instance.vcpu} vCPU / ${Math.round(instance.memoryMb / 1024)}GB`
                    }}
                  </div>
                  <div class="text-[11px] text-slate-500">
                    {{ instance.vcpu }} vCPU · {{ Math.round(instance.memoryMb / 1024) }} GB RAM ·
                    {{ instance.diskGb }} GB disk
                  </div>
                </td>

                <!-- IP Addresses -->
                <td class="py-3 px-4 font-mono text-[11px]">
                  <div class="text-slate-300 flex items-center gap-1">
                    <span class="text-slate-500 font-sans text-[10px]">Priv:</span>
                    <span>{{ instance.privateIp || '—' }}</span>
                  </div>
                  <div class="text-slate-400 flex items-center gap-1 mt-0.5">
                    <span class="text-slate-500 font-sans text-[10px]">Pub:</span>
                    <span>{{ instance.publicIp || '—' }}</span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Start Action -->
                    <UButton
                      v-if="instance.status === 'STOPPED'"
                      color="primary"
                      variant="ghost"
                      icon="i-lucide-play"
                      size="xs"
                      title="Start Instance"
                      :loading="actionLoading"
                      @click="handleStart(instance)"
                    />

                    <!-- Stop Action -->
                    <UButton
                      v-if="instance.status === 'RUNNING'"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-square"
                      size="xs"
                      title="Stop Instance"
                      :loading="actionLoading"
                      @click="handleStop(instance)"
                    />

                    <!-- Restart Action -->
                    <UButton
                      v-if="instance.status === 'RUNNING'"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-rotate-cw"
                      size="xs"
                      title="Restart Instance"
                      :loading="actionLoading"
                      @click="handleRestart(instance)"
                    />

                    <!-- Fast Migrate Action -->
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-arrow-right-left"
                      size="xs"
                      title="Fast Migrate"
                      @click="openMigrateModal(instance)"
                    />

                    <!-- Delete Action -->
                    <UButton
                      color="error"
                      variant="ghost"
                      icon="i-lucide-trash-2"
                      size="xs"
                      title="Delete Instance"
                      :disabled="instance.status === 'MIGRATING'"
                      @click="confirmDelete(instance)"
                    />

                    <!-- View Details Link -->
                    <NuxtLink :to="`/instances/${instance.id}`">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-chevron-right"
                        size="xs"
                        title="View Details"
                      />
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer -->
        <div
          class="px-4 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400"
        >
          <div>
            Showing <span class="font-semibold text-white">{{ filteredInstances.length }}</span> of
            <span class="font-semibold text-white">{{ instances.length }}</span> instances
          </div>
          <div class="flex items-center gap-2 text-[11px] text-slate-500">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Region A: ap-southeast-1</span>
            <span class="inline-block w-2 h-2 rounded-full bg-indigo-500 ml-2" />
            <span>Region B: us-east-1</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <CommonEmptyState
        v-else
        title="No instances found"
        :description="
          searchQuery || selectedStatus !== 'ALL' || selectedRegion !== 'ALL'
            ? 'No virtual machines match your active filters.'
            : 'No instances have been created yet.'
        "
        action-label="Launch Instance"
        @action="navigateTo('/instances/create')"
      />
    </template>

    <!-- Delete Confirmation Modal -->
    <CommonConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Compute Instance"
      :description="`Are you sure you want to delete ${instanceToDelete?.name} (${instanceToDelete?.id})? This will permanently terminate the mock instance and release its IP resources.`"
      confirm-label="Delete Instance"
      :danger="true"
      :loading="actionLoading"
      @confirm="executeDelete"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Fast Migrate Notice Modal -->
    <div
      v-if="showMigrateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-150"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-start gap-3">
          <div
            class="p-2.5 rounded-xl shrink-0 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
          >
            <UIcon name="i-lucide-arrow-right-left" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">
              Fast Migrate — {{ instanceToMigrate?.name }}
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              Cross-Region disaster recovery and live replication engine
            </p>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Current Region:</span>
            <CommonRegionBadge :region="instanceToMigrate?.region || 'REGION_A'" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Destination Region:</span>
            <CommonRegionBadge
              :region="instanceToMigrate?.region === 'REGION_A' ? 'REGION_B' : 'REGION_A'"
            />
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span class="text-slate-400">Target AWS Region:</span>
            <span class="font-mono text-slate-200">
              {{
                instanceToMigrate?.region === 'REGION_A'
                  ? 'us-east-1 (N. Virginia)'
                  : 'ap-southeast-1 (Singapore)'
              }}
            </span>
          </div>
        </div>

        <div
          class="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300"
        >
          <div class="font-semibold flex items-center gap-1.5 text-indigo-200 mb-1">
            <UIcon name="i-lucide-info" class="w-4 h-4" />
            Phase 5 Migration Engine Preview
          </div>
          Full snapshot synchronization, pre-checks, DNS cutover, and rollback orchestration will be
          activated in Phase 5. No cloud mutation is performed in Phase 2.
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <UButton color="neutral" variant="ghost" size="sm" @click="showMigrateModal = false">
            Close
          </UButton>
          <NuxtLink to="/migrations">
            <UButton
              color="primary"
              variant="solid"
              size="sm"
              icon="i-lucide-external-link"
              @click="showMigrateModal = false"
            >
              Go to Migrations
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
