import type { OverviewData } from '../../server/api/v1/overview.get.js'
import { useApi } from './useApi.js'

export function useOverviewApi() {
  const api = useApi()
  const data = ref<OverviewData | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function fetchOverview() {
    pending.value = true
    error.value = null
    try {
      const res = await api.get<OverviewData>('/overview')
      data.value = res
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e?.message || 'Failed to fetch overview data'
    } finally {
      pending.value = false
    }
  }

  return {
    data,
    pending,
    error,
    fetchOverview,
    refresh: fetchOverview
  }
}
