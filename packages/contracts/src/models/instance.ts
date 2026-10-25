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

  privateIp?: string
  publicIp?: string
  endpoint?: string

  estimatedHourlyCost?: number

  createdAt: string
  updatedAt: string
}
