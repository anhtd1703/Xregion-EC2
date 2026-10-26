<script setup lang="ts">
import ErrorState from '../components/common/ErrorState.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import PageHeader from '../components/common/PageHeader.vue'
import RegionBadge from '../components/common/RegionBadge.vue'
import StatCard from '../components/common/StatCard.vue'
import StatusBadge from '../components/common/StatusBadge.vue'
import { useOverviewApi } from '../composables/useOverviewApi.js'
import { useAppStore } from '../stores/app.js'

useHead({ title: 'Overview — Cross-Region Control Plane' })

const appStore = useAppStore()
const { data, pending, error, fetchOverview, refresh } = useOverviewApi()

onMounted(() => {
  fetchOverview()
})

const filteredInstances = computed(() => {
  if (!data.value?.recentInstances) return []
  if (appStore.selectedRegion === 'ALL') {
    return data.value.recentInstances
  }
  return data.value.recentInstances.filter((i) => i.region === appStore.selectedRegion)
})
</script>

<template>
  <div class="space-y-8">
    <!-- Top Page Header -->
    <PageHeader
      title="Overview"
      description="Multi-region cloud infrastructure status, automated migration control, and resource cost breakdown"
    >
      <template #badge>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Systems Operational
        </span>
      </template>

      <template #actions>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-rotate-cw"
          :loading="pending"
          @click="refresh"
        >
          Refresh Data
        </UButton>
        <NuxtLink
          to="/instances/create"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
        >
          <UIcon name="i-lucide-plus" class="w-4 h-4" />
          <span>Launch Instance</span>
        </NuxtLink>
      </template>
    </PageHeader>

    <!-- Error State -->
    <ErrorState
      v-if="error"
      title="Failed to load dashboard overview"
      :message="error"
      @retry="refresh"
    />

    <!-- Loading State -->
    <LoadingSkeleton v-else-if="pending && !data" type="cards" :count="4" />

    <!-- Loaded Dashboard Content -->
    <template v-else-if="data">
      <!-- 4 Top KPI Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Instances"
          :value="data.stats.totalInstances"
          icon="i-lucide-server"
          subtext="across 2 active regions"
          change-text="+3 configured"
          trend="up"
          color="indigo"
        />

        <StatCard
          title="Running Instances"
          :value="data.stats.runningInstances"
          icon="i-lucide-play-circle"
          :subtext="`${data.stats.stoppedInstances} stopped, ${data.stats.migratingInstances} migrating`"
          change-text="62.5% active"
          trend="up"
          color="emerald"
        />

        <StatCard
          title="Migration Success Rate"
          :value="`${data.stats.migrationSuccessRate}%`"
          icon="i-lucide-arrow-left-right"
          :subtext="`${data.stats.totalMigrations} recorded operations`"
          change-text="Zero downtime"
          trend="neutral"
          color="cyan"
        />

        <StatCard
          title="Estimated Monthly Cost"
          :value="`$${data.stats.estimatedMonthlyCost.toFixed(2)}`"
          icon="i-lucide-dollar-sign"
          subtext="USD / month total"
          :change-text="`-$${data.costOverview.potentialCrossRegionSavingsMonthly.toFixed(2)} potential`"
          trend="down"
          color="amber"
        />
      </section>

      <!-- Region Overview & DNS Status Grid -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Region A Card -->
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs"
              >
                A
              </div>
              <div>
                <h3 class="text-sm font-semibold text-white">Region A (Primary)</h3>
                <p class="text-[11px] text-slate-400 font-mono">ap-southeast-1 (Singapore)</p>
              </div>
            </div>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              Active Traffic
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center">
            <div class="p-2 rounded-lg bg-slate-800/40">
              <div class="text-[10px] text-slate-400">Total</div>
              <div class="text-base font-bold text-white">{{ data.regions.regionA.total }}</div>
            </div>
            <div class="p-2 rounded-lg bg-slate-800/40">
              <div class="text-[10px] text-slate-400">Running</div>
              <div class="text-base font-bold text-emerald-400">
                {{ data.regions.regionA.running }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-slate-800/40">
              <div class="text-[10px] text-slate-400">Migrating</div>
              <div class="text-base font-bold text-amber-400">
                {{ data.regions.regionA.migrating }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Est. Region Monthly:</span>
            <span class="font-semibold text-white"
              >${{ data.regions.regionA.monthlyCost.toFixed(2) }}</span
            >
          </div>
        </div>

        <!-- Region B Card -->
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs"
              >
                B
              </div>
              <div>
                <h3 class="text-sm font-semibold text-white">Region B (Secondary)</h3>
                <p class="text-[11px] text-slate-400 font-mono">us-east-1 (N. Virginia)</p>
              </div>
            </div>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
            >
              Standby / Cost-Save
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center">
            <div class="p-2 rounded-lg bg-slate-800/40">
              <div class="text-[10px] text-slate-400">Total</div>
              <div class="text-base font-bold text-white">{{ data.regions.regionB.total }}</div>
            </div>
            <div class="p-2 rounded-lg bg-slate-800/40">
              <div class="text-[10px] text-slate-400">Running</div>
              <div class="text-base font-bold text-emerald-400">
                {{ data.regions.regionB.running }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-slate-800/40">
              <div class="text-[10px] text-slate-400">Stopped</div>
              <div class="text-base font-bold text-slate-400">
                {{ data.regions.regionB.stopped }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Est. Region Monthly:</span>
            <span class="font-semibold text-white"
              >${{ data.regions.regionB.monthlyCost.toFixed(2) }}</span
            >
          </div>
        </div>

        <!-- System Health & DNS Status Card -->
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-activity" class="w-5 h-5 text-indigo-400" />
              <h3 class="text-sm font-semibold text-white">System Health & DNS</h3>
            </div>
            <span class="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Optimal
            </span>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
              <span class="text-slate-400">Route 53 Domain:</span>
              <span class="font-mono text-slate-200">{{ data.systemHealth.dns.domain }}</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
              <span class="text-slate-400">Active Routing Target:</span>
              <span class="font-medium text-emerald-400"
                >Region A ({{ data.systemHealth.dns.targetIp }})</span
              >
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
              <span class="text-slate-400">Auto Cutover Mode:</span>
              <span class="font-semibold text-indigo-400">Enabled</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Migrations Table Section -->
      <section class="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-arrow-left-right" class="w-5 h-5 text-indigo-400" />
            <h3 class="text-sm font-semibold text-white">Cross-Region Migrations</h3>
          </div>
          <NuxtLink
            to="/migrations/history"
            class="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>View All History</span>
            <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/60 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th class="px-5 py-3">Migration ID</th>
                <th class="px-5 py-3">Target Instance</th>
                <th class="px-5 py-3">Route Path</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3">Step Progress</th>
                <th class="px-5 py-3">Trigger</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr
                v-for="m in data.recentMigrations"
                :key="m.id"
                class="hover:bg-slate-800/30 transition-colors"
              >
                <td class="px-5 py-3.5 font-mono text-slate-200 font-medium">
                  {{ m.id }}
                </td>
                <td class="px-5 py-3.5 font-medium text-white">
                  {{ m.instanceId }}
                </td>
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-1.5 font-mono text-[11px]">
                    <RegionBadge :region="m.sourceRegion" />
                    <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 text-slate-500" />
                    <RegionBadge :region="m.destinationRegion" />
                  </div>
                </td>
                <td class="px-5 py-3.5">
                  <StatusBadge :status="m.status" />
                </td>
                <td class="px-5 py-3.5">
                  <div class="space-y-1 w-32">
                    <div class="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{{ m.step }}</span>
                      <span>{{ m.progress }}%</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        class="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        :style="{ width: `${m.progress}%` }"
                      />
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5 text-slate-400">
                  <span
                    class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] uppercase font-mono"
                  >
                    {{ m.trigger }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Instances Table Section -->
      <section class="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-server" class="w-5 h-5 text-indigo-400" />
            <h3 class="text-sm font-semibold text-white">Compute Instances Overview</h3>
            <span class="text-xs text-slate-400">({{ filteredInstances.length }} displayed)</span>
          </div>
          <NuxtLink
            to="/instances"
            class="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Manage All Instances</span>
            <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/60 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th class="px-5 py-3">Instance Name</th>
                <th class="px-5 py-3">Region</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3">Flavor (vCPU / RAM)</th>
                <th class="px-5 py-3">Public IP</th>
                <th class="px-5 py-3">Est. Hourly</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr
                v-for="inst in filteredInstances"
                :key="inst.id"
                class="hover:bg-slate-800/30 transition-colors"
              >
                <td class="px-5 py-3.5">
                  <div class="font-medium text-white">{{ inst.name }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">
                    {{ inst.id }} • {{ inst.imageName }}
                  </div>
                </td>
                <td class="px-5 py-3.5">
                  <RegionBadge :region="inst.region" :show-details="true" />
                </td>
                <td class="px-5 py-3.5">
                  <StatusBadge :status="inst.status" />
                </td>
                <td class="px-5 py-3.5 text-slate-300 font-mono">
                  {{ inst.vcpu }} vCPU • {{ (inst.memoryMb / 1024).toFixed(1) }} GB
                </td>
                <td class="px-5 py-3.5 font-mono text-slate-400">
                  {{ inst.publicIp || '—' }}
                </td>
                <td class="px-5 py-3.5 font-mono text-slate-200">
                  ${{ inst.estimatedHourlyCost?.toFixed(3) || '0.050' }}/hr
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
