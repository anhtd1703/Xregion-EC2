import type { OsImage } from '@xregion/contracts'
import { useApi } from './useApi.js'

export function useImagesApi() {
  const api = useApi()

  async function listImages(): Promise<OsImage[]> {
    return api.get<OsImage[]>('/images')
  }

  return {
    listImages
  }
}
