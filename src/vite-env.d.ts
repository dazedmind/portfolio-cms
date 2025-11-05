/// <reference types="vite/client" />

// Fallback in case tsconfig type resolution misses vite/client
interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_API_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}


