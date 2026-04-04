import type { Theme } from 'vitepress'
import { enhanceAppWithExercises } from 'vitepress-plugin-exercices-form'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithExercises(app, { lang: 'fr' })
  },
} satisfies Theme
