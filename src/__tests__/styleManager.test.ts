import { afterEach, describe, expect, it } from 'vitest'
import { ensureStylesInjected, resetStylesInjectionForTest } from '../styleManager'

describe('ensureStylesInjected', () => {
  afterEach(() => {
    const el = document.getElementById('vitepress-plugin-exercices-form-styles')
    el?.remove()
    resetStylesInjectionForTest()
  })

  it('injects a <style> element into <head>', () => {
    ensureStylesInjected()
    const style = document.getElementById('vitepress-plugin-exercices-form-styles')
    expect(style).not.toBeNull()
    expect(style?.tagName.toLowerCase()).toBe('style')
  })

  it('injects only once on multiple calls', () => {
    ensureStylesInjected()
    ensureStylesInjected()
    const styles = document.querySelectorAll('#vitepress-plugin-exercices-form-styles')
    expect(styles.length).toBe(1)
  })
})
