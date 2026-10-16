import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import ExercisePdfButton from '../components/ExercisePdfButton.vue'
import { getLocale } from '../locales'

const captured: { html: string } = { html: '' }

vi.mock('html2pdf.js', () => {
  const worker = {
    set: () => worker,
    from: (el: HTMLElement) => {
      captured.html = el.innerHTML
      return worker
    },
    toPdf: () => worker,
    get: async () => ({ output: () => new Blob() }),
  }
  return { default: () => worker }
})

async function generate(pageHtml: string): Promise<string> {
  document.body.innerHTML = `<div class="vp-doc">${pageHtml}<div id="mount"></div></div>`
  const app = createApp(ExercisePdfButton, { exerciseId: 'ex', title: 'T', answerCount: 1 })
  app.provide('exercise-locale', getLocale('en'))
  app.mount('#mount')
  await nextTick()

  const inputs = document.querySelectorAll<HTMLInputElement>('input')
  inputs.forEach((i) => {
    i.value = 'x'
    i.dispatchEvent(new Event('input'))
  })
  await nextTick()
  document.querySelector<HTMLButtonElement>('.vpe-btn-pdf')!.click()
  await new Promise(r => setTimeout(r, 300))
  return captured.html
}

describe('exercisePdfButton content filtering', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    captured.html = ''
  })

  it('keeps inline formatting inside question paragraphs', async () => {
    vi.stubGlobal('open', vi.fn())
    URL.createObjectURL = vi.fn(() => 'blob:x')
    const html = await generate(
      `<p><strong>Énoncé 4.</strong> Vous décidez de <strong>prendre l'avion</strong> à Genève.</p>
       <div class="vpe-answer-box"><textarea id="ex-q1"></textarea></div>`,
    )
    expect(html).toContain('prendre l\'avion')
    expect(html).toContain('Énoncé 4.')
  })
})
