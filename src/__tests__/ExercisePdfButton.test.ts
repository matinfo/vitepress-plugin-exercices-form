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

  it('prints checklist, radio glyphs and table cells', async () => {
    vi.stubGlobal('open', vi.fn())
    URL.createObjectURL = vi.fn(() => 'blob:x')
    const { useAnswerStore } = await import('../composables/useAnswerStore')
    const store = useAnswerStore()
    store.setAnswer('ex-q1', '[true,false]')
    store.setAnswer('ex-q2', '1')
    store.setAnswer('ex-q3', '[["a","b"],["",""]]')
    const html = await generate(
      `<p>Q1</p>
       <div id="ex-q1" class="vpe-answer-box" data-vpe-type="checkbox">
         <label class="vpe-checkbox-item"><input type="checkbox"><span>First</span></label>
         <label class="vpe-checkbox-item"><input type="checkbox"><span>Second</span></label>
       </div>
       <p>Q2</p>
       <div id="ex-q2" class="vpe-answer-box" data-vpe-type="radio">
         <label class="vpe-radio-item"><input type="radio"><span>One</span></label>
         <label class="vpe-radio-item"><input type="radio"><span>Two</span></label>
       </div>
       <p>Q2</p>
       <div id="ex-q3" class="vpe-answer-box" data-vpe-type="table"><table><thead><tr><th>H1</th><th>H2</th></tr></thead></table></div>`,
    )
    expect(html).toContain('\u2611')
    expect(html).toContain('\u2610')
    expect(html).toContain('◉')
    expect(html).toContain('◯')
    expect(html).toContain('answer-table')
    expect(html).toContain('<td>a</td>')
    expect(html).toContain('<th>H2</th>')
  })

  it('prints noAnswer for empty structured answers', async () => {
    vi.stubGlobal('open', vi.fn())
    URL.createObjectURL = vi.fn(() => 'blob:x')
    const html = await generate(
      `<p>Q1</p><div id="ex-q9" class="vpe-answer-box" data-vpe-type="checkbox"><label class="vpe-checkbox-item"><span>A</span></label></div>`,
    )
    expect(html).toContain('(no answer)')
  })
})
