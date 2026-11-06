import { beforeEach, describe, expect, it } from 'vitest'
import { ComputeService, StorageService, resetMockProviders } from '../index.js'
import { AppError } from '../shared/errors/app-error.js'

describe('Storage & Snapshots Domain Management', () => {
  let storageService: StorageService
  let computeService: ComputeService

  beforeEach(() => {
    resetMockProviders()
    storageService = new StorageService()
    computeService = new ComputeService()
  })

  describe('Images Catalog', () => {
    it('returns the deterministic shared OS image catalog', async () => {
      const images = await storageService.listImages()
      expect(images).toBeDefined()
      expect(images.length).toBeGreaterThanOrEqual(4)

      const ids = images.map((img) => img.id)
      expect(ids).toContain('img-ubuntu-24')
      expect(ids).toContain('img-ubuntu-22')
      expect(ids).toContain('img-debian-12')
      expect(ids).toContain('img-cirros-06')

      const u24 = images.find((i) => i.id === 'img-ubuntu-24')
      expect(u24?.name).toBe('Ubuntu 24.04 LTS')
      expect(u24?.minDiskGb).toBe(20)
      expect(u24?.regions).toContain('REGION_A')
      expect(u24?.regions).toContain('REGION_B')
    })
  })

  describe('Snapshot Retrieval & Filtering', () => {
    it('lists initial deterministic seeded snapshots', async () => {
      const list = await storageService.listSnapshots()
      expect(list.length).toBeGreaterThanOrEqual(3)

      const snap001 = list.find((s) => s.id === 'snap-001')
      expect(snap001).toBeDefined()
      expect(snap001?.region).toBe('REGION_A')
      expect(snap001?.instanceId).toBe('vm-prod-01')
      expect(snap001?.status).toBe('AVAILABLE')
    })

    it('filters snapshots by instanceId', async () => {
      const forVm01 = await storageService.listSnapshots({ instanceId: 'vm-prod-01' })
      expect(forVm01.length).toBeGreaterThanOrEqual(2)
      for (const s of forVm01) {
        expect(s.instanceId).toBe('vm-prod-01')
      }
    })

    it('filters snapshots by region', async () => {
      const regionB = await storageService.listSnapshots({ region: 'REGION_B' })
      expect(regionB.length).toBeGreaterThanOrEqual(1)
      for (const s of regionB) {
        expect(s.region).toBe('REGION_B')
      }
    })

    it('filters snapshots by search query', async () => {
      const results = await storageService.listSnapshots({ search: 'payment-processor' })
      expect(results.length).toBe(1)
      expect(results[0].id).toBe('snap-002')
    })

    it('gets snapshot by ID and throws 404 for unknown snapshot', async () => {
      const s = await storageService.getSnapshot('snap-001')
      expect(s.id).toBe('snap-001')
      expect(s.sizeGb).toBe(50)

      await expect(storageService.getSnapshot('snap-nonexistent')).rejects.toThrow()
    })
  })

  describe('Create Snapshot from Instance', () => {
    it('creates snapshot from valid Singapore instance and derives region and size', async () => {
      const instance = await computeService.getInstance('vm-prod-01')
      expect(instance.region).toBe('REGION_A')
      expect(instance.diskGb).toBe(50)

      const created = await storageService.createSnapshot({
        instanceId: 'vm-prod-01',
        name: 'manual-backup-01',
        description: 'Test manual snapshot'
      })

      expect(created.id).toBeDefined()
      expect(created.id).not.toBe('snap-001')
      expect(created.name).toBe('manual-backup-01')
      expect(created.instanceId).toBe('vm-prod-01')
      expect(created.instanceName).toBe('web-api-gateway')
      expect(created.region).toBe('REGION_A')
      expect(created.sourceRegion).toBe('REGION_A')
      expect(created.sizeGb).toBe(50)
      expect(created.status).toBe('AVAILABLE')

      // Verifies persistence across subsequent reads
      const fetched = await storageService.getSnapshot(created.id)
      expect(fetched).toEqual(created)
    })

    it('creates snapshot from N. Virginia instance with derived REGION_B region', async () => {
      const instance = await computeService.getInstance('vm-prod-05')
      expect(instance.region).toBe('REGION_B')

      const created = await storageService.createSnapshot({
        instanceId: 'vm-prod-05',
        name: 'dr-standby-snap'
      })

      expect(created.region).toBe('REGION_B')
      expect(created.sourceRegion).toBe('REGION_B')
      expect(created.instanceId).toBe('vm-prod-05')
    })

    it('rejects creating snapshot for nonexistent instance', async () => {
      await expect(
        storageService.createSnapshot({
          instanceId: 'vm-phantom-999',
          name: 'invalid-snap'
        })
      ).rejects.toThrow()
    })

    it('rejects creating snapshot without instanceId', async () => {
      await expect(
        storageService.createSnapshot({
          instanceId: ''
        })
      ).rejects.toThrow()
    })
  })

  describe('Cross-Region Snapshot Copy', () => {
    it('copies snapshot from Region A (Singapore) to Region B (N. Virginia)', async () => {
      const sourceSnap = await storageService.getSnapshot('snap-002')
      expect(sourceSnap.region).toBe('REGION_A')

      const copied = await storageService.copySnapshot('snap-002', {
        destinationRegion: 'REGION_B'
      })

      expect(copied.id).toBeDefined()
      expect(copied.id).not.toBe('snap-002')
      expect(copied.region).toBe('REGION_B')
      expect(copied.sourceRegion).toBe('REGION_A')
      expect(copied.copiedFromSnapshotId).toBe('snap-002')
      expect(copied.sizeGb).toBe(sourceSnap.sizeGb)
      expect(copied.status).toBe('AVAILABLE')

      // Source snapshot must remain unchanged except for copiedRegions recording
      const sourceAfter = await storageService.getSnapshot('snap-002')
      expect(sourceAfter.region).toBe('REGION_A')
      expect(sourceAfter.id).toBe('snap-002')
      expect(sourceAfter.copiedRegions).toContain('REGION_B')
    })

    it('copies snapshot from Region B (N. Virginia) to Region A (Singapore)', async () => {
      const sourceSnap = await storageService.getSnapshot('snap-003')
      expect(sourceSnap.region).toBe('REGION_B')

      const copied = await storageService.copySnapshot('snap-003', {
        destinationRegion: 'REGION_A'
      })

      expect(copied.region).toBe('REGION_A')
      expect(copied.sourceRegion).toBe('REGION_B')
      expect(copied.copiedFromSnapshotId).toBe('snap-003')
      expect(copied.sizeGb).toBe(sourceSnap.sizeGb)
    })

    it('rejects copying to the same region as the source snapshot', async () => {
      await expect(
        storageService.copySnapshot('snap-001', {
          destinationRegion: 'REGION_A'
        })
      ).rejects.toThrowError(AppError)
    })

    it('rejects copying nonexistent snapshot', async () => {
      await expect(
        storageService.copySnapshot('snap-phantom-000', {
          destinationRegion: 'REGION_B'
        })
      ).rejects.toThrow()
    })
  })

  describe('Delete Snapshot', () => {
    it('deletes snapshot and removes it from authoritative mock state', async () => {
      const created = await storageService.createSnapshot({
        instanceId: 'vm-prod-02',
        name: 'temporary-snap'
      })

      expect(await storageService.getSnapshot(created.id)).toBeDefined()

      await storageService.deleteSnapshot(created.id)

      await expect(storageService.getSnapshot(created.id)).rejects.toThrow()
    })

    it('rejects deleting nonexistent snapshot with 404', async () => {
      await expect(storageService.deleteSnapshot('snap-does-not-exist')).rejects.toThrow()
    })
  })

  describe('Sequential Persistence & Lifecycle Verification', () => {
    it('maintains state across sequence: initial -> create -> copy -> delete copy -> verify count', async () => {
      const initialList = await storageService.listSnapshots()
      const initialCount = initialList.length

      // 1. Create snapshot
      const newSnap = await storageService.createSnapshot({
        instanceId: 'vm-prod-01',
        name: 'lifecycle-test-snap'
      })
      const listAfterCreate = await storageService.listSnapshots()
      expect(listAfterCreate.length).toBe(initialCount + 1)

      // 2. Copy snapshot to opposite region
      const copiedSnap = await storageService.copySnapshot(newSnap.id, {
        destinationRegion: 'REGION_B'
      })
      const listAfterCopy = await storageService.listSnapshots()
      expect(listAfterCopy.length).toBe(initialCount + 2)

      // 3. Delete copied snapshot
      await storageService.deleteSnapshot(copiedSnap.id)
      const listAfterDelete = await storageService.listSnapshots()
      expect(listAfterDelete.length).toBe(initialCount + 1)

      // 4. Verify original still exists and copy is gone
      const original = await storageService.getSnapshot(newSnap.id)
      expect(original.id).toBe(newSnap.id)
      await expect(storageService.getSnapshot(copiedSnap.id)).rejects.toThrow()
    })
  })
})
