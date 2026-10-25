import { defineStore } from 'pinia'
import type { Instance } from '@xregion/contracts'

export const useInstancesStore = defineStore('instances', () => {
  const selectedInstanceId = ref<string | null>(null)
  const cachedInstances = ref<Instance[]>([])

  function selectInstance(id: string | null) {
    selectedInstanceId.value = id
  }

  function setCached(instances: Instance[]) {
    cachedInstances.value = instances
  }

  return {
    selectedInstanceId,
    cachedInstances,
    selectInstance,
    setCached
  }
})
