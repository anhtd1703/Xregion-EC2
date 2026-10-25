import { defineStore } from 'pinia'
import type { Migration } from '@xregion/contracts'

export const useMigrationStore = defineStore('migration', () => {
  const activeMigration = ref<Migration | null>(null)
  const isPolling = ref(false)

  function setActiveMigration(migration: Migration | null) {
    activeMigration.value = migration
  }

  function setPolling(polling: boolean) {
    isPolling.value = polling
  }

  return {
    activeMigration,
    isPolling,
    setActiveMigration,
    setPolling
  }
})
