<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign In' })
</script>

<template>
  <div class="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl space-y-6">
    <div class="text-center space-y-2">
      <div
        class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-lg shadow-indigo-500/30"
      >
        XR
      </div>
      <h1 class="text-xl font-bold text-white">Sign in to XRegion-EC2</h1>
      <p class="text-xs text-slate-400">Control plane administrator console</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1">Username</label>
        <input
          type="text"
          value="admin"
          disabled
          class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1">Password</label>
        <input
          type="password"
          value="••••••••"
          disabled
          class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none"
        />
      </div>
      <button
        type="button"
        class="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-sm transition-colors shadow-lg shadow-indigo-600/30"
      >
        Sign In (Mock Mode)
      </button>
    </div>
  </div>
</template>
