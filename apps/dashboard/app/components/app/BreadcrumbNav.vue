<script setup lang="ts">
const route = useRoute()

interface BreadcrumbItem {
  label: string
  to?: string
}

const items = computed<BreadcrumbItem[]>(() => {
  const path = route.path
  if (path === '/') {
    return [{ label: 'Overview' }]
  }

  const segments = path.split('/').filter(Boolean)
  const crumbs: BreadcrumbItem[] = [{ label: 'Overview', to: '/' }]

  let accumulated = ''
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    accumulated += `/${seg}`
    const isLast = i === segments.length - 1

    let label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
    if (seg === 'scenarios') label = 'Migration Scenarios'
    if (seg === 'history') label = 'Migration History'
    if (seg === 'dns') label = 'DNS Routing'

    crumbs.push({
      label,
      to: isLast ? undefined : accumulated
    })
  }

  return crumbs
})
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
    <template v-for="(item, idx) in items" :key="idx">
      <span v-if="idx > 0" class="text-slate-600">/</span>
      <NuxtLink v-if="item.to" :to="item.to" class="hover:text-slate-200 transition-colors">
        {{ item.label }}
      </NuxtLink>
      <span v-else class="text-slate-200 font-medium">
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
