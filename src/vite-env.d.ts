/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Self-hosted LanguageTool /v2/check endpoint (issue #5). Unset = fallback. */
  readonly VITE_LANGUAGETOOL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
