import { defineConfig } from 'vitepress'
import { exerciceVitePlugin, exerciseMarkdownPlugin } from 'vitepress-plugin-exercices-form'

export default defineConfig({
  title: 'Exercise Test Project',
  description: 'Local test harness for vitepress-plugin-exercices-form',

  markdown: {
    config(md) {
      md.use(exerciseMarkdownPlugin)
    },
  },

  vite: {
    plugins: [exerciceVitePlugin()],
  },

  themeConfig: {
    nav: [
      { text: 'Sample Exercise', link: '/sample-exercise' },
    ],
    sidebar: [
      { text: 'Home', link: '/' },
      { text: 'Sample Exercise', link: '/sample-exercise' },
    ],
  },
})
