import DefaultTheme from "vitepress/theme"
import { enhanceAppWithExercises } from "vitepress-plugin-exercices"
import type { Theme } from "vitepress"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithExercises(app, { lang: "fr" })
  },
} satisfies Theme
