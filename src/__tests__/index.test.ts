import { describe, expect, it } from 'vitest'

describe('index exports', () => {
  it('exports exerciseMarkdownPlugin', async () => {
    const mod = await import('../index')
    expect(mod.exerciseMarkdownPlugin).toBeDefined()
    expect(typeof mod.exerciseMarkdownPlugin).toBe('function')
  })

  it('exports exerciceVitePlugin', async () => {
    const mod = await import('../index')
    expect(mod.exerciceVitePlugin).toBeDefined()
    expect(typeof mod.exerciceVitePlugin).toBe('function')
  })

  it('exports enhanceAppWithExercises', async () => {
    const mod = await import('../index')
    expect(mod.enhanceAppWithExercises).toBeDefined()
    expect(typeof mod.enhanceAppWithExercises).toBe('function')
  })

  it('exports getLocale and locales', async () => {
    const mod = await import('../index')
    expect(mod.getLocale).toBeDefined()
    expect(mod.locales).toBeDefined()
  })

  it('exports useAnswerStore', async () => {
    const mod = await import('../index')
    expect(mod.useAnswerStore).toBeDefined()
  })

  it('exports AnswerBox and ExercisePdfButton components', async () => {
    const mod = await import('../index')
    expect(mod.AnswerBox).toBeDefined()
    expect(mod.ExercisePdfButton).toBeDefined()
  })

  it('exerciceVitePlugin returns a Vite plugin with ssr config', async () => {
    const { exerciceVitePlugin } = await import('../index')
    const plugin = exerciceVitePlugin()
    expect(plugin.name).toBe('vitepress-plugin-exercices-form')
    const config = plugin.config()
    expect(config.ssr.noExternal).toContain('html2pdf.js')
    expect(config.optimizeDeps.exclude).toContain('html2pdf.js')
  })
})
