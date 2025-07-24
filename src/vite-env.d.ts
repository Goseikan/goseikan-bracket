/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_DATABASE?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
