import type { OsImage } from '../models/instance.js'

export const DEFAULT_OS_IMAGES: OsImage[] = [
  {
    id: 'img-ubuntu-24',
    name: 'Ubuntu 24.04 LTS',
    osType: 'ubuntu',
    version: 'Noble Numbat 24.04',
    architecture: 'x86_64 / arm64',
    minDiskGb: 20,
    regions: ['REGION_A', 'REGION_B'],
    icon: 'i-lucide-box',
    badge: 'Recommended',
    description: 'Latest Ubuntu LTS release with Kernel 6.8 & systemd 255'
  },
  {
    id: 'img-ubuntu-22',
    name: 'Ubuntu 22.04 LTS',
    osType: 'ubuntu',
    version: 'Jammy Jellyfish 22.04',
    architecture: 'x86_64 / arm64',
    minDiskGb: 20,
    regions: ['REGION_A', 'REGION_B'],
    icon: 'i-lucide-box',
    description: 'Stable long-term support release for production workloads'
  },
  {
    id: 'img-debian-12',
    name: 'Debian 12 Bookworm',
    osType: 'debian',
    version: 'Bookworm 12.5',
    architecture: 'x86_64',
    minDiskGb: 15,
    regions: ['REGION_A', 'REGION_B'],
    icon: 'i-lucide-server',
    description: 'Universal operating system known for rock-solid stability'
  },
  {
    id: 'img-cirros-06',
    name: 'CirrOS 0.6.2',
    osType: 'cirros',
    version: 'Minimal 0.6.2',
    architecture: 'x86_64',
    minDiskGb: 5,
    regions: ['REGION_A', 'REGION_B'],
    icon: 'i-lucide-cpu',
    description: 'Ultra-lightweight Linux test image for rapid DR validation'
  }
]
