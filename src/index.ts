import type { App } from "vue"
import type { Plugin } from "vite"
import { ensureStylesInjected } from "./styleManager"
import { initAnswerStore } from "./composables/useAnswerStore"
import { getLocale as _getLocale } from "./locales"
import type { ExercisePluginOptions, ExerciseLocale } from "./types/exercise"

export { exerciseMarkdownPlugin } from "./md-plugin"
export { getLocale, locales } from "./locales"
export { useAnswerStore } from "./composables/useAnswerStore"
export type { ExerciseLocale, ExercisePluginOptions } from "./types/exercise"

import AnswerBox from "./components/AnswerBox.vue"
import ExercisePdfButton from "./components/ExercisePdfButton.vue"

export { AnswerBox, ExercisePdfButton }

/**
 * Vite plugin that handles SSR externalization for html2pdf.js.
 * Add this to `.vitepress/config.ts` vite.plugins array.
 *
 * @example
 * vite: { plugins: [exerciceVitePlugin()] }
 */
export function exerciceVitePlugin(): Plugin {
  return {
    name: "vitepress-plugin-exercices",
    config() {
      return {
        ssr: {
          noExternal: ["html2pdf.js"],
        },
        optimizeDeps: {
          exclude: ["html2pdf.js"],
        },
      }
    },
  }
}

/**
 * Register exercise components and options in a VitePress `enhanceApp` hook.
 *
 * @example
 * // .vitepress/theme/index.ts
 * import { enhanceAppWithExercises } from '@matinfo/vitepress-plugin-exercices'
 * export default {
 *   enhanceApp({ app }) {
 *     enhanceAppWithExercises(app, { lang: 'fr' })
 *   }
 * }
 */
export function enhanceAppWithExercises(app: App, options: ExercisePluginOptions = {}): void {
  const {
    lang = "en",
    storagePrefix = "exercise-",
    defaultMode = "text",
    enableModeToggle = true,
    tabSize = 2,
    dateLocale,
  } = options

  ensureStylesInjected()
  initAnswerStore(storagePrefix)

  const locale = _getLocale(lang)

  // Provide options to components via Vue provide/inject
  app.provide("exercise-locale", locale)
  app.provide("exercise-storage-prefix", storagePrefix)
  app.provide("exercise-default-mode", defaultMode)
  app.provide("exercise-enable-mode-toggle", enableModeToggle)
  app.provide("exercise-tab-size", tabSize)
  app.provide("exercise-date-locale", dateLocale ?? lang)

  // Register components globally
  app.component("AnswerBox", AnswerBox)
  app.component("ExercisePdfButton", ExercisePdfButton)
}
