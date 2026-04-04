import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ insertTypesEntry: true }),
  ],
  test: {
    environment: 'jsdom',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VitepressPluginExercices',
      fileName: (format) => {
        if (format === 'es')
          return 'vitepress-plugin-exercices-form.js'
        if (format === 'umd')
          return 'vitepress-plugin-exercices-form.umd.cjs'
        return `vitepress-plugin-exercices-form.${format}`
      },
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue', 'html2pdf.js'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
})
