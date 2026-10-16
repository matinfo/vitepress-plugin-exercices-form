import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import { exerciseMarkdownPlugin } from '../md-plugin'

function render(src: string, env: Record<string, unknown> = {}): string {
  const md = new MarkdownIt()
  md.use(exerciseMarkdownPlugin)
  return md.render(src, env)
}

describe('exerciseMarkdownPlugin', () => {
  describe('answer-box rule', () => {
    it('renders a text AnswerBox component', () => {
      const html = render(':::answer-box\n:::', { relativePath: 'test.md' })
      expect(html).toContain('<AnswerBox')
      expect(html).not.toContain('default-mode="code"')
    })

    it('renders a code AnswerBox component', () => {
      const html = render(':::answer-box code\n:::', { relativePath: 'test.md' })
      expect(html).toContain('<AnswerBox')
      expect(html).toContain('default-mode="code"')
    })

    it('generates sequential IDs per file', () => {
      const src = ':::answer-box\n:::\n\n:::answer-box\n:::'
      const html = render(src, { relativePath: 'multi.md' })
      expect(html).toContain('multi-q1')
      expect(html).toContain('multi-q2')
    })

    it('does not match unclosed blocks', () => {
      const html = render(':::answer-box\nno close', { relativePath: 'test.md' })
      expect(html).not.toContain('<AnswerBox')
    })
  })

  describe('checklist and table types', () => {
    it('renders AnswerCheckbox with parsed items', () => {
      const html = render(':::answer-box checklist\n[] One\n[ ] Two "q"\nignored\n:::', { relativePath: 'c.md' })
      expect(html).toContain('<AnswerCheckbox')
      expect(html).toContain('id="c-q1"')
      expect(html).toContain(':items="[&quot;One&quot;,&quot;Two \\&quot;q\\&quot;&quot;]"')
    })

    it('renders AnswerTable with headers and default rows', () => {
      const html = render(':::answer-box table Name | Role | Notes\n:::', { relativePath: 't.md' })
      expect(html).toContain('<AnswerTable')
      expect(html).toContain(':headers="[&quot;Name&quot;,&quot;Role&quot;,&quot;Notes&quot;]"')
      expect(html).toContain(':rows="3"')
    })

    it('reads rows=N and clamps it', () => {
      expect(render(':::answer-box table A | B\nrows=5\n:::', { relativePath: 't.md' })).toContain(':rows="5"')
      expect(render(':::answer-box table A | B\nrows=999\n:::', { relativePath: 't.md' })).toContain(':rows="50"')
    })

    it('rejects table without headers and unclosed blocks', () => {
      expect(render(':::answer-box table\n:::', { relativePath: 't.md' })).not.toContain('<AnswerTable')
      expect(render(':::answer-box checklist\n[] a', { relativePath: 't.md' })).not.toContain('<AnswerCheckbox')
    })

    it('shares counter and triggers PDF button', () => {
      const src = '# T\n\n:::answer-box\n:::\n\n:::answer-box checklist\n[] a\n:::\n\n:::answer-box table A\n:::'
      const html = render(src, { relativePath: 'mix.md' })
      expect(html).toContain('id="mix-q2"')
      expect(html).toContain('id="mix-q3"')
      expect(html).toContain(':answer-count="3"')
    })
  })

  describe('answer-box-off rule', () => {
    it('strips answer-box-off blocks (produces empty output)', () => {
      const html = render(':::answer-box-off\nsome hidden content\n:::', { relativePath: 'test.md' })
      expect(html).not.toContain('some hidden content')
    })
  })

  describe('exercisePdfButton auto-append', () => {
    it('appends ExercisePdfButton when answer boxes exist', () => {
      const src = '# My Exercise\n\n:::answer-box\n:::'
      const html = render(src, { relativePath: 'ex1.md' })
      expect(html).toContain('<ExercisePdfButton')
      expect(html).toContain('title="My Exercise"')
      expect(html).toContain(':answer-count="1"')
    })

    it('does not append ExercisePdfButton when no answer boxes', () => {
      const html = render('# Just a heading\n\nSome text', { relativePath: 'test.md' })
      expect(html).not.toContain('<ExercisePdfButton')
    })

    it('uses filename as exercise-id', () => {
      const src = ':::answer-box\n:::'
      const html = render(src, { relativePath: 'exercices/122-Commands.md' })
      expect(html).toContain('exercise-id="122-Commands"')
    })

    it('counts multiple answer boxes', () => {
      const src = '# Ex\n\n:::answer-box\n:::\n\n:::answer-box\n:::\n\n:::answer-box\n:::'
      const html = render(src, { relativePath: 'test.md' })
      expect(html).toContain(':answer-count="3"')
    })
  })

  describe('escapeAttr', () => {
    it('escapes HTML entities in attributes', () => {
      const src = '# Title with "quotes" & <special>\n\n:::answer-box\n:::'
      const html = render(src, { relativePath: 'test.md' })
      expect(html).toContain('&amp;')
      expect(html).toContain('&quot;')
      expect(html).toContain('&lt;')
    })
  })

  describe('deriveExerciseId', () => {
    it('falls back to slugified title when no env path', () => {
      const src = '# Hello World\n\n:::answer-box\n:::'
      const html = render(src, {})
      expect(html).toContain('exercise-id="hello-world"')
    })

    it('defaults to "exercise" when no title and no path', () => {
      const src = ':::answer-box\n:::'
      const html = render(src, {})
      expect(html).toContain('exercise-id="exercise"')
    })
  })
})
