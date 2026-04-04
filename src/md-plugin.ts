import type MarkdownIt from 'markdown-it'
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'

const OPEN_RE = /^:::answer-box(?:\s+(code))?\s*$/
const CLOSE_RE = /^:::\s*$/
const OPEN_OFF_RE = /^:::answer-box-off\s*$/
const RE_MD_EXT = /\.md$/i

/**
 * Register the exercise answer-box block rule on a markdown-it instance.
 *
 * Transforms `:::answer-box` / `:::answer-box code` fenced blocks into
 * `<AnswerBox>` Vue components, and auto-appends `<ExercisePdfButton>`
 * at the end of pages containing answer boxes.
 *
 * Usage in VitePress config:
 *   markdown: { config(md) { md.use(exerciseMarkdownPlugin) } }
 */
export function exerciseMarkdownPlugin(md: MarkdownIt): void {
  md.block.ruler.before(
    'fence',
    'answer_box',
    (state, startLine, endLine, silent) =>
      answerBoxRule(state, startLine, endLine, silent),
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  )

  md.block.ruler.before(
    'fence',
    'answer_box_off',
    (state, startLine, endLine, silent) =>
      answerBoxOffRule(state, startLine, endLine, silent),
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  )

  md.renderer.rules.answer_box = (tokens, idx) => tokens[idx].content
  md.renderer.rules.answer_box_off = () => ''

  // Auto-append ExercisePdfButton when answer boxes exist
  md.core.ruler.push('exercise_pdf_button', (state) => {
    let answerCount = 0
    for (const t of state.tokens) {
      if (t.type === 'answer_box')
        answerCount++
    }
    if (answerCount === 0)
      return

    // Extract page title from first h1
    let title = 'Exercise'
    for (const t of state.tokens) {
      if (t.type === 'heading_open' && t.tag === 'h1') {
        const idx = state.tokens.indexOf(t)
        const inline = state.tokens[idx + 1]
        if (inline?.type === 'inline') {
          title = inline.content
        }
        break
      }
    }

    // Derive exercise ID from page env (filename) or title
    const exerciseId = deriveExerciseId(state.env, title)

    const close = new state.Token('html_block', '', 0)
    close.content = `<ExercisePdfButton exercise-id="${escapeAttr(exerciseId)}" title="${escapeAttr(title)}" :answer-count="${answerCount}" />\n`
    close.block = true
    state.tokens.push(close)
  })
}

/* ── answer-box block rule ───────────────────────────────────────────── */

let boxCounter = 0
let lastFile = ''

function answerBoxRule(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  const startPos = state.bMarks[startLine] + state.tShift[startLine]
  const startMax = state.eMarks[startLine]
  const lineText = state.src.slice(startPos, startMax)

  const match = OPEN_RE.exec(lineText)
  if (!match)
    return false
  if (silent)
    return true

  // Find closing :::
  let nextLine = startLine + 1
  let found = false
  while (nextLine < endLine) {
    const pos = state.bMarks[nextLine] + state.tShift[nextLine]
    const max = state.eMarks[nextLine]
    const line = state.src.slice(pos, max)
    if (CLOSE_RE.test(line)) {
      found = true
      break
    }
    nextLine++
  }
  if (!found)
    return false

  // Track box counter per file for unique IDs
  const currentFile = state.env?.relativePath ?? state.env?.path ?? ''
  if (currentFile !== lastFile) {
    boxCounter = 0
    lastFile = currentFile
  }
  boxCounter++

  const isCode = match[1] === 'code'
  const exerciseId = deriveExerciseId(state.env, '')
  const boxId = `${exerciseId}-q${boxCounter}`

  const token = state.push('answer_box', '', 0)
  token.content = `<AnswerBox id="${escapeAttr(boxId)}"${isCode ? ' default-mode="code"' : ''} />\n`
  token.map = [startLine, nextLine + 1]
  token.block = true

  state.line = nextLine + 1
  return true
}

/* ── answer-box-off block rule (correction-only, stripped) ───────────── */

function answerBoxOffRule(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  const startPos = state.bMarks[startLine] + state.tShift[startLine]
  const startMax = state.eMarks[startLine]
  const lineText = state.src.slice(startPos, startMax)

  if (!OPEN_OFF_RE.test(lineText))
    return false
  if (silent)
    return true

  // Find closing :::
  let nextLine = startLine + 1
  let found = false
  while (nextLine < endLine) {
    const pos = state.bMarks[nextLine] + state.tShift[nextLine]
    const max = state.eMarks[nextLine]
    const line = state.src.slice(pos, max)
    if (CLOSE_RE.test(line)) {
      found = true
      break
    }
    nextLine++
  }
  if (!found)
    return false

  const token = state.push('answer_box_off', '', 0)
  token.map = [startLine, nextLine + 1]
  token.block = true

  state.line = nextLine + 1
  return true
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function deriveExerciseId(env: Record<string, unknown> | undefined, title: string): string {
  // Try to derive from VitePress file path: e.g. "exercices/122-2-Commandes.md" → "122-2-Commandes"
  const relPath = (env?.relativePath as string) ?? (env?.path as string) ?? ''
  if (relPath) {
    const filename = relPath.split('/').pop() ?? ''
    const base = filename.replace(RE_MD_EXT, '')
    if (base)
      return base
  }
  // Fallback: slugify title
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'exercise'
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
