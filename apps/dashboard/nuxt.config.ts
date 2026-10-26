// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: (() => {
        const envUrl = process.env.NUXT_PUBLIC_API_BASE_URL
        const isMock = (process.env.XREGION_PROVIDER_MODE || 'mock').toLowerCase() === 'mock'
        // In mock mode or when pointing to the legacy 8787 port or unset, use same-origin /api/v1
        if (
          isMock ||
          !envUrl ||
          envUrl.includes('localhost:8787') ||
          envUrl.includes('127.0.0.1:8787')
        ) {
          return '/api/v1'
        }
        return envUrl
      })(),
      providerMode: process.env.XREGION_PROVIDER_MODE || 'mock'
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: false
    }
  }
})
