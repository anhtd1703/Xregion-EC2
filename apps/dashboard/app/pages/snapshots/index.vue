<script setup lang="ts">
import type { Instance, OsImage, RegionId, Snapshot, SnapshotStatus } from '@xregion/contracts'
import { useImagesApi } from '../../composables/useImagesApi.js'
import { useInstancesApi } from '../../composables/useInstancesApi.js'
import { useSnapshotsApi } from '../../composables/useSnapshotsApi.js'
import CopySnapshotModal from '../../components/snapshots/CopySnapshotModal.vue'
import CreateSnapshotModal from '../../components/snapshots/CreateSnapshotModal.vue'
import SnapshotDetailModal from '../../components/snapshots/SnapshotDetailModal.vue'

useHead({ title: 'Images & Snapshots — XRegion-EC2' })

const snapshotsApi = useSnapshotsApi()
const imagesApi = useImagesApi()
const instancesApi = useInstancesApi()

// Tabs
const activeTab = ref<'snapshots' | 'images'>('snapshots')

// Snapshots State
const snapshots = ref<Snapshot[]>([])
const loadingSnapshots = ref(true)
const snapshotError = ref<string | null>(null)

// Images State
const images = ref<OsImage[]>([])
const loadingImages = ref(false)
const imageError = ref<string | null>(null)

// Instances State (for Create Snapshot dropdown)
const instances = ref<Instance[]>([])

// Filter State
const search = ref('')
const selectedRegion = ref<RegionId | 'ALL'>('ALL')
const selectedStatus = ref<SnapshotStatus | 'ALL'>('ALL')

// Toast Notification
const toastMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(text: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = { text, type }
  toastTimer = setTimeout(() => {
    toastMessage.value = null
  }, 4000)
}

// Modals State
const showCreateModal = ref(false)
const showCopyModal = ref(false)
const showDetailModal = ref(false)
const showDeleteConfirm = ref(false)
const activeSnapshot = ref<Snapshot | null>(null)
const actionLoading = ref(false)

// Fetch Snapshots
async function fetchSnapshots() {
  loadingSnapshots.value = true
  snapshotError.value = null
  try {
    const data = await snapshotsApi.listSnapshots({
      region: selectedRegion.value !== 'ALL' ? selectedRegion.value : undefined,
      status: selectedStatus.value !== 'ALL' ? selectedStatus.value : undefined,
      search: search.value.trim() || undefined
    })
    snapshots.value = data
  } catch (err: unknown) {
    const e = err as { message?: string }
    snapshotError.value = e?.message || 'Failed to load snapshots'
  } finally {
    loadingSnapshots.value = false
  }
}

// Fetch Images
async function fetchImages() {
  loadingImages.value = true
  imageError.value = null
  try {
    const data = await imagesApi.listImages()
    images.value = data
  } catch (err: unknown) {
    const e = err as { message?: string }
    imageError.value = e?.message || 'Failed to load OS images catalog'
  } finally {
    loadingImages.value = false
  }
}

// Fetch Instances for creation dropdown
async function fetchInstances() {
  try {
    const data = await instancesApi.listInstances({ pageSize: 100 })
    instances.value = data
  } catch {
    // Non-fatal for snapshots view
  }
}

// Derived Metrics
const totalCount = computed(() => snapshots.value.length)
const availableCount = computed(
  () => snapshots.value.filter((s) => s.status === 'AVAILABLE').length
)
const transientCount = computed(
  () => snapshots.value.filter((s) => s.status === 'CREATING' || s.status === 'COPYING').length
)
const totalStoredSizeGb = computed(() =>
  snapshots.value.reduce((acc, s) => acc + (s.sizeGb || 0), 0)
)

// Actions handlers
function handleOpenCopy(snap: Snapshot) {
  activeSnapshot.value = snap
  showCopyModal.value = true
}

function handleOpenDetail(snap: Snapshot) {
  activeSnapshot.value = snap
  showDetailModal.value = true
}

function handleOpenDelete(snap: Snapshot) {
  activeSnapshot.value = snap
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!activeSnapshot.value) return
  actionLoading.value = true
  try {
    await snapshotsApi.deleteSnapshot(activeSnapshot.value.id)
    showToast(`Snapshot ${activeSnapshot.value.name} deleted successfully`, 'success')
    showDeleteConfirm.value = false
    await fetchSnapshots()
  } catch (err: unknown) {
    const e = err as { message?: string }
    showToast(e?.message || 'Failed to delete snapshot', 'error')
  } finally {
    actionLoading.value = false
  }
}

function handleSnapshotCreated(created: Snapshot) {
  showToast(`Snapshot ${created.name} created successfully`, 'success')
  fetchSnapshots()
}

function handleSnapshotCopied(copied: Snapshot) {
  showToast(
    `Snapshot copied to ${copied.region === 'REGION_A' ? 'Singapore' : 'N. Virginia'} successfully`,
    'success'
  )
  fetchSnapshots()
}

// Debounced search watcher
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchSnapshots()
  }, 250)
})

watch([selectedRegion, selectedStatus], () => {
  fetchSnapshots()
})

onMounted(() => {
  fetchSnapshots()
  fetchImages()
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
      title="Images & Snapshots"
      description="Manage OS machine images and EBS volume snapshots across Singapore and N. Virginia regions"
    >
      <template #badge>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Mock Storage Provider
        </span>
      </template>

      <template #actions>
        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            size="sm"
            :loading="loadingSnapshots || loadingImages"
            @click="activeTab === 'snapshots' ? fetchSnapshots() : fetchImages()"
          >
            Refresh
          </UButton>
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-camera"
            size="sm"
            @click="showCreateModal = true"
          >
            Create Snapshot
          </UButton>
        </div>
      </template>
    </CommonPageHeader>

    <!-- Top Tab Navigation -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
        :class="
          activeTab === 'snapshots'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        "
        @click="activeTab = 'snapshots'"
      >
        <UIcon name="i-lucide-camera" class="w-4 h-4" />
        <span>Snapshots</span>
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px]"
          :class="
            activeTab === 'snapshots'
              ? 'bg-indigo-700/80 text-white'
              : 'bg-slate-800 text-slate-400'
          "
        >
          {{ totalCount }}
        </span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
        :class="
          activeTab === 'images'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        "
        @click="activeTab = 'images'"
      >
        <UIcon name="i-lucide-disc" class="w-4 h-4" />
        <span>Machine Images</span>
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px]"
          :class="
            activeTab === 'images' ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400'
          "
        >
          {{ images.length }}
        </span>
      </button>
    </div>

    <!-- TAB 1: SNAPSHOTS TAB -->
    <div v-if="activeTab === 'snapshots'" class="space-y-6">
      <!-- Derived Stat KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CommonStatCard
          title="Total Snapshots"
          :value="totalCount"
          icon="i-lucide-layers"
          subtitle="Provisioned EBS images"
        />
        <CommonStatCard
          title="Available"
          :value="availableCount"
          icon="i-lucide-check-circle"
          subtitle="Ready for recovery"
        />
        <CommonStatCard
          title="Creating / Copying"
          :value="transientCount"
          icon="i-lucide-rotate-cw"
          subtitle="In-flight operations"
        />
        <CommonStatCard
          title="Total Stored Size"
          :value="`${totalStoredSizeGb} GB`"
          icon="i-lucide-hard-drive"
          subtitle="Mock gp3 storage footprint"
        />
      </div>

      <!-- Search & Filters Control Bar -->
      <div
        class="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs"
      >
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <UIcon
            name="i-lucide-search"
            class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            v-model="search"
            type="text"
            placeholder="Search snapshots by name, ID, or instance..."
            class="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Region Filter -->
          <div
            class="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700"
          >
            <button
              v-for="r in [
                { id: 'ALL', label: 'All Regions' },
                { id: 'REGION_A', label: 'Singapore' },
                { id: 'REGION_B', label: 'N. Virginia' }
              ] as const"
              :key="r.id"
              type="button"
              class="px-2.5 py-1 rounded-lg font-medium transition-colors"
              :class="
                selectedRegion === r.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              "
              @click="selectedRegion = r.id"
            >
              {{ r.label }}
            </button>
          </div>

          <!-- Status Filter -->
          <select
            v-model="selectedStatus"
            class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="COPYING">COPYING</option>
            <option value="CREATING">CREATING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
      </div>

      <!-- Snapshot Content Area -->
      <!-- Error State -->
      <CommonErrorState
        v-if="snapshotError"
        title="Failed to Load Snapshots"
        :message="snapshotError"
        @retry="fetchSnapshots"
      />

      <!-- Loading Skeleton -->
      <CommonLoadingSkeleton v-else-if="loadingSnapshots" variant="table" :rows="4" />

      <!-- Empty State -->
      <CommonEmptyState
        v-else-if="snapshots.length === 0"
        title="No Snapshots Found"
        description="No point-in-time volume backups match your search filters. Take a snapshot of an active instance to get started."
        action-label="Create Snapshot"
        icon="i-lucide-camera"
        @action="showCreateModal = true"
      />

      <!-- Snapshots Data Table -->
      <div
        v-else
        class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs divide-y divide-slate-800">
            <thead
              class="bg-slate-800/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
            >
              <tr>
                <th class="px-5 py-3.5">Snapshot Name & ID</th>
                <th class="px-5 py-3.5">Source Instance</th>
                <th class="px-5 py-3.5">Region</th>
                <th class="px-5 py-3.5">Status</th>
                <th class="px-5 py-3.5">Size</th>
                <th class="px-5 py-3.5">Created</th>
                <th class="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr
                v-for="snap in snapshots"
                :key="snap.id"
                class="hover:bg-slate-800/30 transition-colors group"
              >
                <!-- Name & ID -->
                <td class="px-5 py-3.5">
                  <div class="space-y-0.5">
                    <button
                      type="button"
                      class="font-semibold text-white group-hover:text-indigo-300 transition-colors text-left flex items-center gap-1.5"
                      @click="handleOpenDetail(snap)"
                    >
                      <span>{{ snap.name }}</span>
                      <UIcon
                        v-if="snap.copiedFromSnapshotId"
                        name="i-lucide-copy"
                        class="w-3 h-3 text-indigo-400"
                        title="Cross-region copy"
                      />
                    </button>
                    <div class="font-mono text-[11px] text-slate-500">{{ snap.id }}</div>
                  </div>
                </td>

                <!-- Source Instance -->
                <td class="px-5 py-3.5">
                  <NuxtLink
                    :to="`/instances/${snap.instanceId}`"
                    class="font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <UIcon name="i-lucide-server" class="w-3.5 h-3.5 text-slate-400" />
                    <span>{{ snap.instanceName || snap.instanceId }}</span>
                  </NuxtLink>
                </td>

                <!-- Region -->
                <td class="px-5 py-3.5">
                  <CommonRegionBadge :region="snap.region" show-details />
                </td>

                <!-- Status -->
                <td class="px-5 py-3.5">
                  <CommonStatusBadge :status="snap.status" size="sm" />
                </td>

                <!-- Size -->
                <td class="px-5 py-3.5">
                  <span class="font-mono font-medium text-emerald-400">{{ snap.sizeGb }} GB</span>
                </td>

                <!-- Created -->
                <td class="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                  {{ new Date(snap.createdAt).toLocaleDateString() }}
                </td>

                <!-- Actions -->
                <td class="px-5 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Copy Snapshot -->
                    <UButton
                      color="neutral"
                      variant="outline"
                      size="xs"
                      icon="i-lucide-copy"
                      :disabled="snap.status !== 'AVAILABLE'"
                      @click="handleOpenCopy(snap)"
                    >
                      Copy
                    </UButton>

                    <!-- View Details -->
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-eye"
                      @click="handleOpenDetail(snap)"
                    >
                      Details
                    </UButton>

                    <!-- Delete -->
                    <UButton
                      color="error"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-trash-2"
                      :disabled="snap.status === 'COPYING' || snap.status === 'CREATING'"
                      @click="handleOpenDelete(snap)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: MACHINE IMAGES TAB -->
    <div v-else-if="activeTab === 'images'" class="space-y-6">
      <!-- Error State -->
      <CommonErrorState
        v-if="imageError"
        title="Failed to Load OS Images"
        :message="imageError"
        @retry="fetchImages"
      />

      <!-- Loading Skeleton -->
      <CommonLoadingSkeleton v-else-if="loadingImages" variant="card" />

      <!-- Images Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="img in images"
          :key="img.id"
          class="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-2">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-2.5">
                <div
                  class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                >
                  <UIcon :name="img.icon || 'i-lucide-box'" class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-white text-sm">{{ img.name }}</h3>
                  <div class="font-mono text-[11px] text-slate-500">ID: {{ img.id }}</div>
                </div>
              </div>
              <span
                v-if="img.badge"
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              >
                {{ img.badge }}
              </span>
            </div>

            <!-- Description -->
            <p class="text-xs text-slate-400 leading-relaxed">
              {{ img.description }}
            </p>

            <!-- Metadata Specs -->
            <div class="grid grid-cols-2 gap-2 pt-2 text-[11px]">
              <div class="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <span class="text-slate-500 block">Version:</span>
                <span class="text-slate-200 font-medium">{{ img.version }}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <span class="text-slate-500 block">Architecture:</span>
                <span class="text-slate-200 font-mono">{{ img.architecture || 'x86_64' }}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <span class="text-slate-500 block">Min Root Storage:</span>
                <span class="text-emerald-400 font-mono">{{ img.minDiskGb }} GB</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <span class="text-slate-500 block">Availability:</span>
                <span class="text-slate-200">Both Regions (A & B)</span>
              </div>
            </div>
          </div>

          <!-- Card Action Footer -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <CommonRegionBadge region="REGION_A" />
              <CommonRegionBadge region="REGION_B" />
            </div>

            <NuxtLink :to="`/instances/create?imageId=${img.id}`">
              <UButton color="primary" variant="outline" size="xs" icon="i-lucide-rocket">
                Launch with this Image
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Create Snapshot Modal -->
    <CreateSnapshotModal
      v-model="showCreateModal"
      :available-instances="instances"
      @created="handleSnapshotCreated"
    />

    <!-- Copy Snapshot Modal -->
    <CopySnapshotModal
      v-model="showCopyModal"
      :snapshot="activeSnapshot"
      @copied="handleSnapshotCopied"
    />

    <!-- Snapshot Detail Modal -->
    <SnapshotDetailModal
      v-model="showDetailModal"
      :snapshot="activeSnapshot"
      @request-copy="handleOpenCopy"
      @request-delete="handleOpenDelete"
    />

    <!-- Delete Confirmation Dialog -->
    <CommonConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Storage Snapshot"
      :description="`Are you sure you want to permanently delete snapshot '${activeSnapshot?.name}' (${activeSnapshot?.id})? This action cannot be undone.`"
      confirm-label="Delete Snapshot"
      :danger="true"
      :loading="actionLoading"
      @confirm="executeDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
