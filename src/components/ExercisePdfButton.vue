<script setup lang="ts">
import type { ExerciseLocale } from '../types/exercise'
import { inject, ref } from 'vue'
import { useAnswerStore } from '../composables/useAnswerStore'

const props = defineProps<{
  exerciseId: string
  title: string
  answerCount: number
}>()
const RE_H12 = /^h[12]$/
const RE_H13 = /^h[1-3]$/
const RE_BODY = /<body[^>]*>([\s\S]*)<\/body>/i
const RE_STYLE = /<style>([\s\S]*?)<\/style>/i

const locale = inject<ExerciseLocale>('exercise-locale')!
const dateLocale = inject<string>('exercise-date-locale', 'en')
const storagePrefix = inject<string>('exercise-storage-prefix', 'exercise-')

const studentName = ref('')
const studentClass = ref('')
const generating = ref(false)
const showValidation = ref(false)

const { getAnswersForExercise, clearExercise } = useAnswerStore()

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPdfHtml(): string {
  const answers = getAnswersForExercise(props.exerciseId)
  const date = new Date().toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const contentEl = document.querySelector('.vp-doc')
  if (!contentEl)
    return ''

  const clone = contentEl.cloneNode(true) as HTMLElement

  // Strip VitePress scoped classes
  clone.className = ''
  clone.querySelectorAll('[class]').forEach((el) => {
    const keep = Array.from(el.classList).filter(c =>
      c.startsWith('vpe-') || c === 'exercise-pdf-section',
    )
    el.className = keep.join(' ')
  })

  // Remove the PDF button itself
  clone.querySelectorAll('.exercise-pdf-section').forEach(el => el.remove())

  // Replace answer box components with printed answers
  clone.querySelectorAll('.vpe-answer-box').forEach((el) => {
    const textarea = el.querySelector('textarea')
    if (!textarea)
      return

    const id = textarea.id
    const answer = answers[id] ?? ''
    const isCode = textarea.dataset.mode === 'code'
      || (typeof window !== 'undefined' && localStorage.getItem(`${storagePrefix}mode-${id}`) === 'code')

    const answerDiv = document.createElement('div')
    answerDiv.className = isCode ? 'answer-printed answer-code' : 'answer-printed'
    answerDiv.textContent = answer || locale.noAnswer

    el.replaceWith(answerDiv)
  })

  // Filter: keep only questions + answers
  const keepSet = new WeakSet<Node>()

  clone.querySelectorAll('.answer-printed').forEach((answerEl) => {
    keepSet.add(answerEl)
    let prev = answerEl.previousElementSibling
    while (prev) {
      const tag = prev.tagName.toLowerCase()
      if (RE_H12.test(tag) || prev.classList.contains('answer-printed'))
        break
      keepSet.add(prev)
      prev = prev.previousElementSibling
    }
    let parent = answerEl.parentElement
    while (parent && parent !== clone) {
      keepSet.add(parent)
      parent = parent.parentElement
    }
  })

  function pruneNode(node: Element): void {
    Array.from(node.children).forEach(child => pruneNode(child))
    if (!keepSet.has(node) && node !== clone) {
      node.remove()
    }
  }
  pruneNode(clone)

  // Wrap question + answer into qa-blocks for page break avoidance
  clone.querySelectorAll('.answer-printed').forEach((answerEl) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'qa-block'

    const siblings: Element[] = []
    let cur = answerEl.previousElementSibling
    while (cur) {
      if (cur.classList.contains('answer-printed') || cur.classList.contains('qa-block'))
        break
      siblings.unshift(cur)
      cur = cur.previousElementSibling
    }

    const questionEls: Element[] = []
    for (let i = siblings.length - 1; i >= 0; i--) {
      const tag = siblings[i].tagName.toLowerCase()
      if (RE_H13.test(tag))
        break
      questionEls.unshift(siblings[i])
    }

    if (questionEls.length > 0) {
      answerEl.parentNode?.insertBefore(wrapper, questionEls[0])
      for (const qe of questionEls) wrapper.appendChild(qe)
    }
    else {
      answerEl.parentNode?.insertBefore(wrapper, answerEl)
    }
    wrapper.appendChild(answerEl)
  })

  const bodyHtml = clone.innerHTML

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escHtml(props.title)}</title>
  <style>
    @page { size: A4 portrait; margin: 18mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11pt; line-height: 1.6; color: #111; padding: 0;
    }
    .pdf-header {
      border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px;
    }
    .pdf-header h1 { font-size: 16pt; margin-bottom: 8px; }
    .pdf-header .meta { font-size: 10pt; color: #555; }
    .pdf-header .meta span { margin-right: 24px; }
    h1 { font-size: 16pt; font-weight: 700; margin: 10pt 0 6pt; }
    h2 { font-size: 13pt; font-weight: 600; margin: 14pt 0 6pt; }
    h3 { font-size: 11pt; font-weight: 600; margin: 10pt 0 4pt; }
    p { margin: 4pt 0; }
    code {
      background: #f3f3f3; padding: 2px 5px; border-radius: 3px;
      font-family: "JetBrains Mono", "Fira Code", monospace; font-size: 10pt;
    }
    pre { background: #f6f6f6; padding: 10px; border-radius: 4px; margin: 8px 0; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; margin: 8px 0; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 10pt; }
    th { background: #f0f0f0; font-weight: 600; }
    ul, ol { margin: 4pt 0; padding-left: 20pt; }
    li { margin: 2pt 0; }
    img { max-width: 100%; height: auto; }
    .answer-printed {
      border: 1.5px solid #bbb; border-radius: 4px;
      padding: 10px; margin: 8px 0; min-height: 40px;
      white-space: pre-wrap; font-size: 11pt; line-height: 1.5;
      break-inside: avoid; page-break-inside: avoid;
    }
    .answer-printed.answer-code {
      background: #f6f6f6;
      font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
      font-size: 10pt; white-space: pre; tab-size: 2;
    }
    .qa-block { break-inside: avoid; page-break-inside: avoid; }
    pre { break-inside: avoid; page-break-inside: avoid; }
  </style>
</head>
<body>
  <div class="pdf-header">
    <h1>${escHtml(props.title)}</h1>
    <div class="meta">
      <span><strong>${escHtml(locale.nameLabel)}:</strong> ${escHtml(studentName.value.trim())}</span>
      <span><strong>${escHtml(locale.classLabel)}:</strong> ${escHtml(studentClass.value.trim())}</span>
      <span><strong>${escHtml(locale.dateLabel)}:</strong> ${escHtml(date)}</span>
    </div>
  </div>
  ${bodyHtml}
</body>
</html>`
}

async function generatePdf(): Promise<void> {
  showValidation.value = true
  if (!studentName.value.trim() || !studentClass.value.trim())
    return

  generating.value = true
  try {
    // Dynamic import - html2pdf.js must be in consumer's dependencies (resolved by the consumer's bundler)
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default

    const htmlContent = buildPdfHtml()
    const bodyMatch = htmlContent.match(RE_BODY)
    const styleMatch = htmlContent.match(RE_STYLE)

    const container = document.createElement('div')
    if (styleMatch) {
      const style = document.createElement('style')
      style.textContent = styleMatch[1]
      container.appendChild(style)
    }
    const content = document.createElement('div')
    content.innerHTML = bodyMatch ? bodyMatch[1] : htmlContent
    container.appendChild(content)

    container.style.cssText = 'position: fixed; left: 0; top: 0; width: 210mm; z-index: -9999; opacity: 0; pointer-events: none;'
    document.body.appendChild(container)

    await new Promise(r => setTimeout(r, 100))

    const opt = {
      margin: [15, 15, 15, 15] as [number, number, number, number],
      filename: `${props.exerciseId}-${studentName.value.trim().replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css'], avoid: ['.qa-block', '.answer-printed'] },
    }

    const worker = html2pdf().set(opt).from(content)
    const pdf = await worker.toPdf().get('pdf')
    const blob = pdf.output('blob')

    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')

    document.body.removeChild(container)
  }
  catch (err) {
    console.error('PDF generation failed:', err)
    // eslint-disable-next-line no-alert
    alert(locale.pdfError)
  }
  finally {
    generating.value = false
  }
}

function handleClear(): void {
  // eslint-disable-next-line no-alert
  if (confirm(locale.clearConfirm)) {
    clearExercise(props.exerciseId)
    window.location.reload()
  }
}
</script>

<template>
  <div class="exercise-pdf-section">
    <hr>
    <h3>{{ locale.pdfTitle }}</h3>
    <div class="vpe-student-fields">
      <div class="vpe-field">
        <label for="student-name">{{ locale.nameLabel }} <span class="vpe-required">{{ locale.required }}</span></label>
        <input
          id="student-name"
          v-model="studentName"
          type="text"
          :placeholder="locale.namePlaceholder"
          :class="{ invalid: showValidation && !studentName.trim() }"
          required
        >
        <span v-if="showValidation && !studentName.trim()" class="vpe-error-msg">{{ locale.requiredField }}</span>
      </div>
      <div class="vpe-field">
        <label for="student-class">{{ locale.classLabel }} <span class="vpe-required">{{ locale.required }}</span></label>
        <input
          id="student-class"
          v-model="studentClass"
          type="text"
          :placeholder="locale.classPlaceholder"
          :class="{ invalid: showValidation && !studentClass.trim() }"
          required
        >
        <span v-if="showValidation && !studentClass.trim()" class="vpe-error-msg">{{ locale.requiredField }}</span>
      </div>
    </div>
    <div class="vpe-actions">
      <button
        class="vpe-btn-pdf"
        :disabled="generating"
        @click="generatePdf"
      >
        {{ generating ? locale.generating : locale.generatePdf }}
      </button>
      <button
        class="vpe-btn-clear"
        @click="handleClear"
      >
        {{ locale.clearAnswers }}
      </button>
    </div>
  </div>
</template>
