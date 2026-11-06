<script setup lang="ts">
import type { Instance, Snapshot } from '@xregion/contracts'
import { useInstancesApi } from '../../composables/useInstancesApi.js'
import { useSnapshotsApi } from '../../composables/useSnapshotsApi.js'
import CopySnapshotModal from '../../components/snapshots/CopySnapshotModal.vue'
import CreateSnapshotModal from '../../components/snapshots/CreateSnapshotModal.vue'

const route = useRoute()
const router = useRouter()
const instancesApi = useInstancesApi()
const snapshotsApi = useSnapshotsApi()

const instanceId = computed(() => route.params.id as string)
useHead({ title: computed(() => `Instance ${instanceId.value} — XRegion-EC2`) })

// State
const instance = ref<Instance | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<
  'overview' | 'monitoring' | 'storage' | 'networking' | 'snapshots' | 'activity'
>('overview')

// Snapshots State for this instance
const snapshots = ref<Snapshot[]>([])
const loadingSnapshots = ref(false)
const showCreateSnapshotModal = ref(false)
const showCopySnapshotModal = ref(false)
const activeSnapshotToCopy = ref<Snapshot | null>(null)
const showDeleteSnapshotConfirm = ref(false)
const activeSnapshotToDelete = ref<Snapshot | null>(null)
const snapshotActionLoading = ref(false)

// Notification toast
const toastMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(text: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = { text, type }
  toastTimer = setTimeout(() => {
    toastMessage.value = null
  }, 4000)
}

// Fetch instance
async function fetchInstance() {
  loading.value = true
  error.value = null
  try {
    const data = await instancesApi.getInstance(instanceId.value)
    instance.value = data
  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e?.message || `Instance ${instanceId.value} not found`
  } finally {
    loading.value = false
  }
}

// Fetch snapshots for this instance
async function fetchSnapshots() {
  if (!instanceId.value) return
  loadingSnapshots.value = true
  try {
    const data = await snapshotsApi.listSnapshots({ instanceId: instanceId.value })
    snapshots.value = data
  } catch {
    // Non-blocking for instance view
  } finally {
    loadingSnapshots.value = false
  }
}

// Snapshot Actions
function handleSnapshotCreated(created: Snapshot) {
  showToast(`Snapshot ${created.name} created successfully`, 'success')
  fetchSnapshots()
}

function handleOpenCopySnapshot(snap: Snapshot) {
  activeSnapshotToCopy.value = snap
  showCopySnapshotModal.value = true
}

function handleSnapshotCopied(copied: Snapshot) {
  showToast(
    `Snapshot replicated to ${copied.region === 'REGION_A' ? 'Singapore' : 'N. Virginia'} successfully`,
    'success'
  )
  fetchSnapshots()
}

function handleOpenDeleteSnapshot(snap: Snapshot) {
  activeSnapshotToDelete.value = snap
  showDeleteSnapshotConfirm.value = true
}

async function executeSnapshotDelete() {
  if (!activeSnapshotToDelete.value) return
  snapshotActionLoading.value = true
  try {
    await snapshotsApi.deleteSnapshot(activeSnapshotToDelete.value.id)
    showToast(`Snapshot ${activeSnapshotToDelete.value.name} deleted successfully`, 'success')
    showDeleteSnapshotConfirm.value = false
    await fetchSnapshots()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || 'Failed to delete snapshot', 'error')
  } finally {
    snapshotActionLoading.value = false
  }
}

// Watch active tab to refresh snapshots on demand
watch(activeTab, (tab) => {
  if (tab === 'snapshots' || tab === 'storage') {
    fetchSnapshots()
  }
})

// Lifecycle actions
async function handleStart() {
  if (
    !instance.value ||
    instance.value.status === 'RUNNING' ||
    instance.value.status === 'MIGRATING'
  )
    return
  actionLoading.value = true
  try {
    await instancesApi.startInstance(instance.value.id)
    showToast(`Instance ${instance.value.name} started successfully`, 'success')
    await fetchInstance()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || 'Failed to start instance', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function handleStop() {
  if (
    !instance.value ||
    instance.value.status === 'STOPPED' ||
    instance.value.status === 'MIGRATING'
  )
    return
  actionLoading.value = true
  try {
    await instancesApi.stopInstance(instance.value.id)
    showToast(`Instance ${instance.value.name} stopped successfully`, 'success')
    await fetchInstance()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || 'Failed to stop instance', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function handleRestart() {
  if (!instance.value || instance.value.status !== 'RUNNING') return
  actionLoading.value = true
  try {
    await instancesApi.restartInstance(instance.value.id)
    showToast(`Instance ${instance.value.name} restarted successfully`, 'success')
    await fetchInstance()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || 'Failed to restart instance', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Delete Confirmation Modal
const showDeleteConfirm = ref(false)

async function executeDelete() {
  if (!instance.value) return
  actionLoading.value = true
  try {
    await instancesApi.deleteInstance(instance.value.id)
    showDeleteConfirm.value = false
    router.push('/instances')
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || 'Failed to delete instance', 'error')
  } finally {
    actionLoading.value = false
  }
}

// Fast Migrate Info Modal
const showMigrateModal = ref(false)

onMounted(() => {
  fetchInstance()
  fetchSnapshots()
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

    <!-- Error State (e.g. Instance Not Found) -->
    <div v-if="error" class="p-8">
      <CommonErrorState
        title="Instance Not Found"
        :message="error"
        @retry="router.push('/instances')"
      />
      <div class="text-center mt-4">
        <NuxtLink to="/instances">
          <UButton color="neutral" variant="outline" icon="i-lucide-arrow-left" size="sm">
            Back to Instances List
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <CommonLoadingSkeleton v-else-if="loading" variant="card" />

    <!-- Instance Detail View -->
    <template v-else-if="instance">
      <!-- Top Breadcrumbs & Header Bar -->
      <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl space-y-4">
        <!-- Back Navigation -->
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <NuxtLink
            to="/instances"
            class="hover:text-white flex items-center gap-1 transition-colors"
          >
            <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5" />
            <span>Instances</span>
          </NuxtLink>
          <span class="text-slate-600">/</span>
          <span class="font-mono text-slate-300">{{ instance.id }}</span>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <!-- Title & Badges -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-white tracking-tight">
                {{ instance.name }}
              </h1>
              <CommonStatusBadge :status="instance.status" />
              <CommonRegionBadge :region="instance.region" show-details />
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-400">
              <span class="font-mono text-slate-500">ID: {{ instance.id }}</span>
              <span>·</span>
              <span>{{ instance.imageName || instance.imageId }}</span>
              <span>·</span>
              <span class="font-mono text-indigo-400">{{
                instance.flavorId ||
                `${instance.vcpu} vCPU / ${Math.round(instance.memoryMb / 1024)}GB`
              }}</span>
            </div>
          </div>

          <!-- Action Buttons Bar -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Start -->
            <UButton
              v-if="instance.status === 'STOPPED'"
              color="primary"
              variant="solid"
              icon="i-lucide-play"
              size="sm"
              :loading="actionLoading"
              @click="handleStart"
            >
              Start
            </UButton>

            <!-- Stop -->
            <UButton
              v-if="instance.status === 'RUNNING'"
              color="neutral"
              variant="outline"
              icon="i-lucide-square"
              size="sm"
              :loading="actionLoading"
              @click="handleStop"
            >
              Stop
            </UButton>

            <!-- Restart -->
            <UButton
              v-if="instance.status === 'RUNNING'"
              color="neutral"
              variant="outline"
              icon="i-lucide-rotate-cw"
              size="sm"
              :loading="actionLoading"
              @click="handleRestart"
            >
              Restart
            </UButton>

            <!-- Fast Migrate -->
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-arrow-right-left"
              size="sm"
              @click="showMigrateModal = true"
            >
              Fast Migrate
            </UButton>

            <!-- Delete -->
            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="sm"
              :disabled="instance.status === 'MIGRATING'"
              @click="showDeleteConfirm = true"
            >
              Delete
            </UButton>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1 pt-4 border-t border-slate-800 overflow-x-auto text-xs">
          <button
            v-for="t in [
              { id: 'overview', label: 'Overview', icon: 'i-lucide-layout-dashboard' },
              { id: 'monitoring', label: 'Monitoring', icon: 'i-lucide-activity' },
              { id: 'storage', label: 'Storage', icon: 'i-lucide-hard-drive' },
              { id: 'networking', label: 'Networking', icon: 'i-lucide-network' },
              { id: 'snapshots', label: 'Snapshots', icon: 'i-lucide-camera' },
              { id: 'activity', label: 'Activity', icon: 'i-lucide-clock' }
            ] as const"
            :key="t.id"
            type="button"
            class="flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors shrink-0"
            :class="
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            "
            @click="activeTab = t.id"
          >
            <UIcon :name="t.icon" class="w-4 h-4" />
            <span>{{ t.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <!-- 1. OVERVIEW TAB (Fully Implemented) -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- Quick Stat Metric Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <span class="text-[11px] font-medium text-slate-400">Current Status</span>
            <div class="pt-1">
              <CommonStatusBadge :status="instance.status" />
            </div>
          </div>

          <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <span class="text-[11px] font-medium text-slate-400">Current Region</span>
            <div class="pt-1">
              <CommonRegionBadge :region="instance.region" show-details />
            </div>
          </div>

          <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <span class="text-[11px] font-medium text-slate-400">Compute Allocation</span>
            <div class="text-sm font-semibold text-white font-mono pt-0.5">
              {{ instance.vcpu }} vCPU · {{ Math.round(instance.memoryMb / 1024) }} GB
            </div>
          </div>

          <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-1">
            <span class="text-[11px] font-medium text-slate-400">Est. Hourly Cost</span>
            <div class="text-sm font-semibold text-emerald-400 font-mono pt-0.5">
              ${{ (instance.estimatedHourlyCost || 0.05).toFixed(4) }} / hr
            </div>
          </div>
        </div>

        <!-- Detail Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Compute & System Specifications -->
          <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-800">
              <UIcon name="i-lucide-cpu" class="w-5 h-5 text-indigo-400" />
              <h3 class="text-sm font-semibold text-white uppercase tracking-wider">
                Compute & System Specifications
              </h3>
            </div>

            <div class="space-y-3 text-xs divide-y divide-slate-800/60">
              <div class="flex items-center justify-between pt-1">
                <span class="text-slate-400">Instance ID:</span>
                <span class="font-mono text-slate-200">{{ instance.id }}</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">Instance Flavor:</span>
                <span class="font-mono font-medium text-indigo-400">{{
                  instance.flavorId || 'Standard Custom'
                }}</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">Virtual CPU:</span>
                <span class="text-slate-200">{{ instance.vcpu }} vCPU (Dedicated Core Slices)</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">RAM:</span>
                <span class="text-slate-200"
                  >{{ Math.round(instance.memoryMb / 1024) }} GB ({{ instance.memoryMb }} MB)</span
                >
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">Root Storage:</span>
                <span class="text-slate-200">{{ instance.diskGb }} GB (gp3 SSD baseline)</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">OS Image:</span>
                <span class="text-slate-200">{{ instance.imageName || instance.imageId }}</span>
              </div>
            </div>
          </div>

          <!-- Networking & Endpoints -->
          <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-800">
              <UIcon name="i-lucide-network" class="w-5 h-5 text-emerald-400" />
              <h3 class="text-sm font-semibold text-white uppercase tracking-wider">
                Networking & Endpoints
              </h3>
            </div>

            <div class="space-y-3 text-xs divide-y divide-slate-800/60">
              <div class="flex items-center justify-between pt-1">
                <span class="text-slate-400">Private IP (VPC):</span>
                <span class="font-mono text-slate-200">{{ instance.privateIp || '10.0.1.x' }}</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">Public IP (Elastic):</span>
                <span class="font-mono text-slate-200">{{
                  instance.publicIp || 'None Assigned'
                }}</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">Internal DNS Endpoint:</span>
                <span class="font-mono text-indigo-400 text-[11px] truncate max-w-[240px]">
                  {{ instance.endpoint || `https://${instance.name}.internal` }}
                </span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">Subnet:</span>
                <span class="font-mono text-slate-200">{{
                  instance.subnetId || 'subnet-priv-01 (10.0.1.0/24)'
                }}</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">Security Group:</span>
                <span class="font-mono text-slate-200">{{
                  instance.securityGroup || 'sg-web-default'
                }}</span>
              </div>
              <div class="flex items-center justify-between pt-2">
                <span class="text-slate-400">DR Failover Policy:</span>
                <span class="text-emerald-400 font-medium">Route 53 Latency / Failover Ready</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Timestamps & Provider Lifecycle Card -->
        <div
          class="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400"
        >
          <div>
            Created at:
            <span class="font-mono text-slate-300">{{
              new Date(instance.createdAt).toLocaleString()
            }}</span>
            <span class="mx-2">·</span>
            Last updated:
            <span class="font-mono text-slate-300">{{
              new Date(instance.updatedAt).toLocaleString()
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Driver: MockComputeProvider (Zero Cloud Mutation)</span>
          </div>
        </div>
      </div>

      <!-- 2. MONITORING TAB (Placeholder connected to Phase 6) -->
      <div
        v-else-if="activeTab === 'monitoring'"
        class="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-4"
      >
        <div
          class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto"
        >
          <UIcon name="i-lucide-activity" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-white">
            Instance Monitoring & CloudWatch Telemetry
          </h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Real-time CPU utilization, memory pressure, disk I/O benchmarks, and cross-region
            network latency metrics are scheduled for full implementation in Phase 6.
          </p>
        </div>
        <div
          class="p-4 rounded-xl bg-slate-800/40 border border-slate-800 max-w-sm mx-auto text-xs text-slate-400"
        >
          <span class="text-indigo-400 font-medium">Scheduled:</span> Phase 6 Monitoring & Network
          Configuration
        </div>
      </div>

      <!-- 3. STORAGE TAB (Phase 3 Implemented) -->
      <div v-else-if="activeTab === 'storage'" class="space-y-6">
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-hard-drive" class="w-5 h-5 text-indigo-400" />
              <h3 class="text-sm font-semibold text-white uppercase tracking-wider">
                Root Block Device & Storage Configuration
              </h3>
            </div>
            <UButton
              color="primary"
              variant="outline"
              size="xs"
              icon="i-lucide-camera"
              @click="showCreateSnapshotModal = true"
            >
              Take Snapshot
            </UButton>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div class="text-slate-400 font-medium">Volume Identification</div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Device ID:</span>
                <span class="font-mono text-slate-200">vol-root-{{ instance.id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Device Name:</span>
                <span class="font-mono text-slate-200">/dev/xvda (Root / OS)</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Attachment:</span>
                <span class="text-emerald-400 font-medium">Attached (Root Volume)</span>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div class="text-slate-400 font-medium">Volume Performance & Characteristics</div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Storage Size:</span>
                <span class="font-mono text-emerald-400 font-semibold"
                  >{{ instance.diskGb }} GB</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Volume Type:</span>
                <span class="text-slate-200 font-medium">gp3 General Purpose SSD</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Baseline IOPS / Bandwidth:</span>
                <span class="font-mono text-slate-300">3,000 IOPS / 125 MB/s</span>
              </div>
            </div>
          </div>

          <div
            class="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" class="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Encryption Status: AWS-KMS Managed Envelope Encryption (gp3 root device)</span>
            </div>
            <NuxtLink to="/snapshots">
              <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-external-link">
                View All Snapshots
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 4. NETWORKING TAB (Placeholder connected to Phase 6) -->
      <div
        v-else-if="activeTab === 'networking'"
        class="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-4"
      >
        <div
          class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto"
        >
          <UIcon name="i-lucide-network" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-white">VPC Topology & DNS Failover</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">
            VPC peering, Route 53 health-check routing policies, security group rules, and elastic
            load balancer endpoints will be fully configured in Phase 6.
          </p>
        </div>
        <div
          class="p-4 rounded-xl bg-slate-800/40 border border-slate-800 max-w-sm mx-auto text-xs text-slate-400"
        >
          <span class="text-indigo-400 font-medium">Scheduled:</span> Phase 6 Networking & DNS
          Failover
        </div>
      </div>

      <!-- 5. SNAPSHOTS TAB (Phase 3 Implemented) -->
      <div v-else-if="activeTab === 'snapshots'" class="space-y-6">
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800"
          >
            <div>
              <h3 class="text-sm font-semibold text-white uppercase tracking-wider">
                Instance Volume Snapshots
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                Point-in-time storage captures available for cross-region disaster recovery
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UButton
                color="neutral"
                variant="outline"
                size="xs"
                icon="i-lucide-refresh-cw"
                :loading="loadingSnapshots"
                @click="fetchSnapshots"
              >
                Refresh
              </UButton>
              <UButton
                color="primary"
                variant="solid"
                size="xs"
                icon="i-lucide-camera"
                @click="showCreateSnapshotModal = true"
              >
                Create Snapshot
              </UButton>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <CommonLoadingSkeleton v-if="loadingSnapshots" variant="table" :rows="2" />

          <!-- Empty State -->
          <CommonEmptyState
            v-else-if="snapshots.length === 0"
            title="No Snapshots for this Instance"
            description="Take a snapshot of this instance root volume to enable fast restore and cross-region replication."
            action-label="Create Snapshot"
            icon="i-lucide-camera"
            @action="showCreateSnapshotModal = true"
          />

          <!-- Snapshots Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs divide-y divide-slate-800">
              <thead class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th class="py-2.5 px-3">Name & ID</th>
                  <th class="py-2.5 px-3">Region</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3">Size</th>
                  <th class="py-2.5 px-3">Created</th>
                  <th class="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr
                  v-for="snap in snapshots"
                  :key="snap.id"
                  class="hover:bg-slate-800/30 transition-colors"
                >
                  <td class="py-3 px-3">
                    <div class="font-medium text-white">{{ snap.name }}</div>
                    <div class="font-mono text-[11px] text-slate-500">{{ snap.id }}</div>
                  </td>
                  <td class="py-3 px-3">
                    <CommonRegionBadge :region="snap.region" show-details />
                  </td>
                  <td class="py-3 px-3">
                    <CommonStatusBadge :status="snap.status" size="sm" />
                  </td>
                  <td class="py-3 px-3 font-mono text-emerald-400">{{ snap.sizeGb }} GB</td>
                  <td class="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    {{ new Date(snap.createdAt).toLocaleString() }}
                  </td>
                  <td class="py-3 px-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <UButton
                        color="neutral"
                        variant="outline"
                        size="xs"
                        icon="i-lucide-copy"
                        :disabled="snap.status !== 'AVAILABLE'"
                        @click="handleOpenCopySnapshot(snap)"
                      >
                        Copy
                      </UButton>
                      <UButton
                        color="error"
                        variant="ghost"
                        size="xs"
                        icon="i-lucide-trash-2"
                        :disabled="snap.status === 'COPYING' || snap.status === 'CREATING'"
                        @click="handleOpenDeleteSnapshot(snap)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 6. ACTIVITY TAB -->
      <div
        v-else-if="activeTab === 'activity'"
        class="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4"
      >
        <h3
          class="text-sm font-semibold text-white uppercase tracking-wider pb-2 border-b border-slate-800"
        >
          Recent Instance Activity
        </h3>

        <div class="space-y-3">
          <div
            class="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <div class="space-y-0.5">
              <div class="font-medium text-slate-200">
                Instance Current Status: {{ instance.status }}
              </div>
              <div class="text-[11px] text-slate-500">
                Last state synchronization recorded at
                {{ new Date(instance.updatedAt).toLocaleTimeString() }}
              </div>
            </div>
          </div>

          <div
            class="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs"
          >
            <span class="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            <div class="space-y-0.5">
              <div class="font-medium text-slate-200">Instance Initial Provisioning Completed</div>
              <div class="text-[11px] text-slate-500">
                Virtual machine initialized at {{ new Date(instance.createdAt).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete Confirmation Dialog -->
    <CommonConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Compute Instance"
      :description="`Are you sure you want to delete ${instance?.name} (${instance?.id})? This will permanently terminate the mock instance and release all associated resources.`"
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
            <h3 class="text-base font-semibold text-white">Fast Migrate — {{ instance?.name }}</h3>
            <p class="text-xs text-slate-400 mt-1">
              Cross-Region disaster recovery and live replication engine
            </p>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Current Region:</span>
            <CommonRegionBadge :region="instance?.region || 'REGION_A'" />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Destination Region:</span>
            <CommonRegionBadge
              :region="instance?.region === 'REGION_A' ? 'REGION_B' : 'REGION_A'"
            />
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span class="text-slate-400">Target AWS Region:</span>
            <span class="font-mono text-slate-200">
              {{
                instance?.region === 'REGION_A'
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

    <!-- Create Snapshot Modal for this instance -->
    <CreateSnapshotModal
      v-model="showCreateSnapshotModal"
      :instance="instance"
      @created="handleSnapshotCreated"
    />

    <!-- Copy Snapshot Modal -->
    <CopySnapshotModal
      v-model="showCopySnapshotModal"
      :snapshot="activeSnapshotToCopy"
      @copied="handleSnapshotCopied"
    />

    <!-- Delete Snapshot Confirmation Dialog -->
    <CommonConfirmDialog
      v-model="showDeleteSnapshotConfirm"
      title="Delete Snapshot"
      :description="`Are you sure you want to permanently delete snapshot '${activeSnapshotToDelete?.name}' (${activeSnapshotToDelete?.id})?`"
      confirm-label="Delete Snapshot"
      :danger="true"
      :loading="snapshotActionLoading"
      @confirm="executeSnapshotDelete"
      @cancel="showDeleteSnapshotConfirm = false"
    />
  </div>
</template>
