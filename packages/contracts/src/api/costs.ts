import type { RegionId } from '../models/instance.js'

export interface RegionCostBreakdown {
  region: RegionId
  instanceCount: number
  computeCostMonthly: number
  storageCostMonthly: number
  totalCostMonthly: number
}

export interface CostOverview {
  totalEstimatedMonthly: number
  currency: 'USD'
  regions: RegionCostBreakdown[]
  potentialCrossRegionSavingsMonthly: number
}
