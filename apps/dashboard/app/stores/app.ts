import { defineStore } from 'pinia'
import type { RegionId } from '@xregion/contracts'

export const useAppStore = defineStore('app', () => {
  const selectedRegion = ref<RegionId | 'ALL'>('ALL')
  const isRefreshing = ref(false)

  function setSelectedRegion(region: RegionId | 'ALL') {
    selectedRegion.value = region
  }

  return {
    selectedRegion,
    isRefreshing,
    setSelectedRegion
  }
})
