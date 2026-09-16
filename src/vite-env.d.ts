/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEET_ENDPOINT?: string;
  readonly VITE_RESULTS_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
