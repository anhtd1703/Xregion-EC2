<script setup lang="ts">
import type { CreateInstanceRequest, RegionId } from '@xregion/contracts'
import { useInstancesApi } from '../../composables/useInstancesApi.js'

useHead({ title: 'Launch Instance — XRegion-EC2' })

const router = useRouter()
const instancesApi = useInstancesApi()

// Form Data State
const form = reactive({
  name: '',
  region: 'REGION_A' as RegionId,
  imageId: 'img-ubuntu-24',
  flavorId: 't4g.medium',
  diskGb: 30,
  subnetId: 'subnet-priv-01',
  securityGroupId: 'sg-web-default'
})

// Validation & UI State
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

// Mock Images catalog
const images = [
  {
    id: 'img-ubuntu-24',
    name: 'Ubuntu 24.04 LTS',
    osType: 'ubuntu',
    version: 'Noble Numbat',
    minDiskGb: 20,
    icon: 'i-lucide-box',
    badge: 'Recommended',
    description: 'Latest Ubuntu LTS release with Kernel 6.8 & systemd 255'
  },
  {
    id: 'img-ubuntu-22',
    name: 'Ubuntu 22.04 LTS',
    osType: 'ubuntu',
    version: 'Jammy Jellyfish',
    minDiskGb: 20,
    icon: 'i-lucide-box',
    description: 'Stable long-term support release for production workloads'
  },
  {
    id: 'img-debian-12',
    name: 'Debian 12 Bookworm',
    osType: 'debian',
    version: 'Bookworm 12.5',
    minDiskGb: 15,
    icon: 'i-lucide-server',
    description: 'Universal operating system known for rock-solid stability'
  },
  {
    id: 'img-cirros-06',
    name: 'CirrOS 0.6.2',
    osType: 'cirros',
    version: 'Minimal 0.6.2',
    minDiskGb: 5,
    icon: 'i-lucide-cpu',
    description: 'Ultra-lightweight Linux test image for rapid DR validation'
  }
]

// Mock Flavors catalog
const flavors = [
  {
    id: 't4g.small',
    name: 't4g.small',
    vcpu: 1,
    memoryMb: 2048,
    hourlyPrice: 0.0168,
    arch: 'Arm64 Graviton2',
    description: 'Burstable general-purpose compute for microservices'
  },
  {
    id: 't4g.medium',
    name: 't4g.medium',
    vcpu: 2,
    memoryMb: 4096,
    hourlyPrice: 0.0336,
    arch: 'Arm64 Graviton2',
    isPopular: true,
    description: 'Balanced performance for web servers and caches'
  },
  {
    id: 'm6i.large',
    name: 'm6i.large',
    vcpu: 2,
    memoryMb: 8192,
    hourlyPrice: 0.096,
    arch: 'x86_64 Intel Xeon',
    description: 'Dedicated compute for standard enterprise workloads'
  },
  {
    id: 'm6i.xlarge',
    name: 'm6i.xlarge',
    vcpu: 4,
    memoryMb: 16384,
    hourlyPrice: 0.192,
    arch: 'x86_64 Intel Xeon',
    description: 'High-throughput compute for intensive data pipelines'
  },
  {
    id: 'c6g.large',
    name: 'c6g.large',
    vcpu: 2,
    memoryMb: 4096,
    hourlyPrice: 0.068,
    arch: 'Arm64 Compute-Optimized',
    description: 'Compute-optimized for batch processing and transcoding'
  }
]

// Networking options by region
const subnetOptions = computed(() => {
  if (form.region === 'REGION_A') {
    return [
      { id: 'subnet-priv-01', label: 'subnet-priv-01 (10.0.1.0/24) — Private AZ-1a' },
      { id: 'subnet-pub-01', label: 'subnet-pub-01 (10.0.2.0/24) — Public Gateway AZ-1a' },
      { id: 'subnet-priv-02', label: 'subnet-priv-02 (10.0.3.0/24) — Private AZ-1b' }
    ]
  }
  return [
    { id: 'subnet-dr-01', label: 'subnet-dr-01 (10.1.1.0/24) — DR Standby AZ-1a' },
    { id: 'subnet-dr-pub', label: 'subnet-dr-pub (10.1.2.0/24) — DR Ingress AZ-1a' },
    { id: 'subnet-dr-02', label: 'subnet-dr-02 (10.1.3.0/24) — DR Standby AZ-1b' }
  ]
})

const securityGroupOptions = [
  { id: 'sg-web-default', label: 'sg-web-default (Inbound: 80, 443, 22)' },
  { id: 'sg-backend-internal', label: 'sg-backend-internal (VPC Only: 8080, 5432)' },
  { id: 'sg-database-restricted', label: 'sg-database-restricted (Restricted Postgres/Redis)' }
]

// Selected flavor details
const selectedFlavor = computed(() => {
  return flavors.find((f) => f.id === form.flavorId) || flavors[1]
})

// Selected image details
const selectedImage = computed(() => {
  return images.find((img) => img.id === form.imageId) || images[0]
})

// Cost calculations
const estimatedMonthlyCost = computed(() => {
  const computeCost = selectedFlavor.value.hourlyPrice * 730
  const storageCost = form.diskGb * 0.08 // gp3 storage standard
  return Math.round((computeCost + storageCost) * 100) / 100
})

// Validation
const nameError = computed(() => {
  if (!form.name.trim()) return null
  if (!/^[a-zA-Z0-9-_]{3,64}$/.test(form.name.trim())) {
    return 'Name must be 3-64 characters containing only letters, numbers, dashes, and underscores.'
  }
  return null
})

const isFormValid = computed(() => {
  return (
    form.name.trim().length >= 3 &&
    !nameError.value &&
    form.diskGb >= selectedImage.value.minDiskGb &&
    form.diskGb <= 1000
  )
})

async function handleLaunch() {
  if (!isFormValid.value) return
  submitting.value = true
  errorMessage.value = null

  try {
    const payload: CreateInstanceRequest = {
      name: form.name.trim(),
      region: form.region,
      imageId: form.imageId,
      vcpu: selectedFlavor.value.vcpu,
      memoryMb: selectedFlavor.value.memoryMb,
      diskGb: form.diskGb,
      flavorId: form.flavorId,
      subnetId: form.subnetId,
      securityGroupId: form.securityGroupId
    }

    const created = await instancesApi.createInstance(payload)
    router.push(`/instances/${created.id}`)
  } catch (err: unknown) {
    const e = err as { message?: string }
    errorMessage.value = e?.message || 'Failed to launch instance'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <CommonPageHeader
      title="Launch Compute Instance"
      description="Configure and provision a new cross-region capable virtual machine in mock cloud environment"
    >
      <template #badge>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Cross-Region Ready
        </span>
      </template>

      <template #actions>
        <NuxtLink to="/instances">
          <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" size="sm">
            Cancel
          </UButton>
        </NuxtLink>
      </template>
    </CommonPageHeader>

    <!-- Error Alert Banner -->
    <div
      v-if="errorMessage"
      class="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-3"
    >
      <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
      <div>
        <div class="font-semibold text-rose-200">Instance Launch Failed</div>
        <p class="text-xs text-rose-300/90 mt-0.5">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Main Layout: Form Steps (Left) + Sticky Summary (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Form Sections (2 Columns) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Section 1: Basic Information & Region -->
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <span
              class="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/40"
            >
              1
            </span>
            <h2 class="text-sm font-semibold text-white tracking-wide uppercase">
              Basic Details & Placement Region
            </h2>
          </div>

          <!-- Instance Name -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-slate-300">
              Instance Name <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. order-processing-api"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
              :class="
                nameError
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              "
            />
            <p v-if="nameError" class="text-[11px] text-rose-400">
              {{ nameError }}
            </p>
            <p v-else class="text-[11px] text-slate-500">
              Unique identifier for identifying this workload across regions.
            </p>
          </div>

          <!-- Region Selection Cards -->
          <div class="space-y-2 pt-2">
            <label class="block text-xs font-medium text-slate-300">
              Initial Deployment Region <span class="text-rose-400">*</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Region A -->
              <button
                type="button"
                class="p-4 rounded-xl border text-left transition-all duration-150 relative"
                :class="
                  form.region === 'REGION_A'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/40 shadow-lg'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                "
                @click="form.region = 'REGION_A'"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="font-semibold text-xs text-white flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400" />
                    Region A (Primary)
                  </span>
                  <span
                    class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300"
                  >
                    ap-southeast-1
                  </span>
                </div>
                <div class="text-[11px] text-slate-400">Singapore Datacenter</div>
                <div class="text-[10px] text-emerald-400/90 mt-2 font-medium">
                  Active Production Workload Zone
                </div>
              </button>

              <!-- Region B -->
              <button
                type="button"
                class="p-4 rounded-xl border text-left transition-all duration-150 relative"
                :class="
                  form.region === 'REGION_B'
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-lg'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
                "
                @click="form.region = 'REGION_B'"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="font-semibold text-xs text-white flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-indigo-400" />
                    Region B (Secondary / DR)
                  </span>
                  <span
                    class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300"
                  >
                    us-east-1
                  </span>
                </div>
                <div class="text-[11px] text-slate-400">N. Virginia Datacenter</div>
                <div class="text-[10px] text-indigo-400/90 mt-2 font-medium">
                  Disaster Recovery & Hot Standby Zone
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Section 2: Operating System Image -->
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <span
              class="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/40"
            >
              2
            </span>
            <h2 class="text-sm font-semibold text-white tracking-wide uppercase">
              Operating System Image
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="img in images"
              :key="img.id"
              type="button"
              class="p-4 rounded-xl border text-left transition-all duration-150 space-y-1.5 relative"
              :class="
                form.imageId === img.id
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
              "
              @click="form.imageId = img.id"
            >
              <div class="flex items-center justify-between">
                <span class="font-semibold text-xs text-white flex items-center gap-2">
                  <UIcon :name="img.icon" class="w-4 h-4 text-indigo-400" />
                  {{ img.name }}
                </span>
                <span
                  v-if="img.badge"
                  class="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                >
                  {{ img.badge }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 line-clamp-2">
                {{ img.description }}
              </p>
              <div class="text-[10px] text-slate-500 pt-1">Min Storage: {{ img.minDiskGb }} GB</div>
            </button>
          </div>
        </div>

        <!-- Section 3: Compute Flavor -->
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <span
              class="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/40"
            >
              3
            </span>
            <h2 class="text-sm font-semibold text-white tracking-wide uppercase">
              Compute Flavor & Specifications
            </h2>
          </div>

          <div class="space-y-2.5">
            <button
              v-for="fl in flavors"
              :key="fl.id"
              type="button"
              class="w-full p-3.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-4"
              :class="
                form.flavorId === fl.id
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70'
              "
              @click="form.flavorId = fl.id"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  :class="
                    form.flavorId === fl.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  "
                >
                  <UIcon name="i-lucide-cpu" class="w-4 h-4" />
                </div>
                <div>
                  <div class="font-semibold text-xs text-white flex items-center gap-2">
                    <span>{{ fl.name }}</span>
                    <span
                      v-if="fl.isPopular"
                      class="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    >
                      Popular
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    {{ fl.vcpu }} vCPU · {{ Math.round(fl.memoryMb / 1024) }} GB RAM · {{ fl.arch }}
                  </div>
                </div>
              </div>

              <div class="text-right shrink-0">
                <div class="font-mono text-xs font-semibold text-indigo-400">
                  ${{ fl.hourlyPrice.toFixed(4) }}/hr
                </div>
                <div class="text-[10px] text-slate-500">
                  ~${{ (fl.hourlyPrice * 730).toFixed(2) }}/mo
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Section 4: Storage -->
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <span
              class="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/40"
            >
              4
            </span>
            <h2 class="text-sm font-semibold text-white tracking-wide uppercase">
              Root Storage Configuration
            </h2>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-medium text-slate-300">Root Volume Size (GB)</span>
                <p class="text-[11px] text-slate-500">
                  General Purpose SSD (gp3) with 3,000 IOPS baseline
                </p>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="form.diskGb"
                  type="number"
                  min="10"
                  max="500"
                  class="w-20 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white text-right font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span class="text-xs text-slate-400">GB</span>
              </div>
            </div>

            <!-- Slider -->
            <input
              v-model.number="form.diskGb"
              type="range"
              :min="selectedImage.minDiskGb"
              max="200"
              step="5"
              class="w-full accent-indigo-500 cursor-pointer"
            />

            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{{ selectedImage.minDiskGb }} GB (Min)</span>
              <span>50 GB</span>
              <span>100 GB</span>
              <span>200 GB</span>
            </div>
          </div>
        </div>

        <!-- Section 5: Networking & Security -->
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <span
              class="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/40"
            >
              5
            </span>
            <h2 class="text-sm font-semibold text-white tracking-wide uppercase">
              Networking & Security Groups
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Subnet -->
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-slate-300">VPC Subnet</label>
              <select
                v-model="form.subnetId"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option v-for="sub in subnetOptions" :key="sub.id" :value="sub.id">
                  {{ sub.label }}
                </option>
              </select>
            </div>

            <!-- Security Group -->
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-slate-300">Security Group</label>
              <select
                v-model="form.securityGroupId"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option v-for="sg in securityGroupOptions" :key="sg.id" :value="sg.id">
                  {{ sg.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Review / Summary Panel (Right Column) -->
      <div class="sticky top-20 space-y-4">
        <div
          class="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur shadow-2xl space-y-5"
        >
          <h3
            class="text-sm font-semibold text-white tracking-wide uppercase pb-3 border-b border-slate-800 flex items-center gap-2"
          >
            <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-emerald-400" />
            Launch Specification
          </h3>

          <div class="space-y-3 text-xs divide-y divide-slate-800/60">
            <!-- Name -->
            <div class="flex items-center justify-between pt-1">
              <span class="text-slate-400">Instance Name:</span>
              <span class="font-semibold text-white font-mono">
                {{ form.name.trim() || '—' }}
              </span>
            </div>

            <!-- Region -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-slate-400">Region:</span>
              <CommonRegionBadge :region="form.region" show-details />
            </div>

            <!-- OS Image -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-slate-400">Image:</span>
              <span class="font-medium text-slate-200 text-right">{{ selectedImage.name }}</span>
            </div>

            <!-- Flavor -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-slate-400">Flavor:</span>
              <span class="font-mono font-medium text-slate-200">{{ selectedFlavor.name }}</span>
            </div>

            <!-- Specs -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-slate-400">vCPU / RAM:</span>
              <span class="text-slate-200 font-medium">
                {{ selectedFlavor.vcpu }} vCPU · {{ Math.round(selectedFlavor.memoryMb / 1024) }} GB
              </span>
            </div>

            <!-- Storage -->
            <div class="flex items-center justify-between pt-2">
              <span class="text-slate-400">Root Storage:</span>
              <span class="font-mono text-slate-200">{{ form.diskGb }} GB gp3</span>
            </div>
          </div>

          <!-- Cost Estimate Box -->
          <div class="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
            <div class="text-[11px] text-indigo-300 font-medium">Estimated Monthly Cost:</div>
            <div class="text-2xl font-bold font-mono text-white flex items-baseline gap-1">
              <span>${{ estimatedMonthlyCost.toFixed(2) }}</span>
              <span class="text-xs font-normal text-slate-400">/ mo</span>
            </div>
            <div class="text-[10px] text-slate-400">
              ~${{ (estimatedMonthlyCost / 730).toFixed(4) }} / hr in
              {{ form.region === 'REGION_A' ? 'Singapore' : 'N. Virginia' }}
            </div>
          </div>

          <!-- Submit Button -->
          <div class="space-y-2 pt-2">
            <UButton
              color="primary"
              variant="solid"
              block
              size="md"
              icon="i-lucide-rocket"
              :loading="submitting"
              :disabled="!isFormValid"
              @click="handleLaunch"
            >
              Launch Instance
            </UButton>

            <NuxtLink to="/instances" class="block">
              <UButton color="neutral" variant="ghost" block size="sm"> Cancel </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
