export type RegionId = 'REGION_A' | 'REGION_B'

export interface Region {
  id: RegionId
  cloudRegion: string
  displayName: string
  shortName: string
  available: boolean
  hourlyCostMultiplier?: number
}

export type InstanceStatus = 'CREATING' | 'RUNNING' | 'STOPPED' | 'MIGRATING' | 'ERROR' | 'DELETING'

export interface ComputeFlavor {
  id: string
  name: string
  vcpu: number
  memoryMb: number
  hourlyPrice: number
  description: string
}

export interface OsImage {
  id: string
  name: string
  osType: 'ubuntu' | 'debian' | 'cirros'
  version: string
  minDiskGb: number
  description: string
  architecture?: string
  regions?: RegionId[]
  icon?: string
  badge?: string
}

export interface Instance {
  id: string
  name: string
  status: InstanceStatus

  region: RegionId

  imageId: string
  imageName: string

  vcpu: number
  memoryMb: number
  diskGb: number

  flavorId?: string
  subnetId?: string
  securityGroup?: string

  privateIp?: string
  publicIp?: string
  endpoint?: string

  estimatedHourlyCost?: number

  createdAt: string
  updatedAt: string
}
