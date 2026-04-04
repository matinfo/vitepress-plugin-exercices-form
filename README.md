# vitepress-plugin-exercices-form

[![npm version](https://img.shields.io/npm/v/@matinfo/vitepress-plugin-exercices-form?style=flat-square&label=npm)](https://www.npmjs.com/package/@matinfo/vitepress-plugin-exercices-form)
[![downloads](https://img.shields.io/npm/dm/@matinfo/vitepress-plugin-exercices-form?style=flat-square&label=downloads)](https://www.npmjs.com/package/@matinfo/vitepress-plugin-exercices-form)
[![CI](https://img.shields.io/github/actions/workflow/status/matinfo/vitepress-plugin-exercices-form/ci-plugin.yml?branch=main&style=flat-square&label=CI)](https://github.com/matinfo/vitepress-plugin-exercices-form/actions/workflows/ci-plugin.yml)
[![publish to npm](https://img.shields.io/github/actions/workflow/status/matinfo/vitepress-plugin-exercices-form/publish-npm.yml?style=flat-square&label=publish)](https://github.com/matinfo/vitepress-plugin-exercices-form/actions/workflows/publish-npm.yml)
[![license](https://img.shields.io/npm/l/@matinfo/vitepress-plugin-exercices-form?style=flat-square)](https://github.com/matinfo/vitepress-plugin-exercices-form/blob/main/LICENSE)

A VitePress plugin that adds interactive answer boxes to exercise pages, with localStorage persistence and client-side PDF export.

**Features:**
- ✏️ Text and code answer boxes with localStorage persistence
- 📄 Client-side PDF export (student name, class, date)
- 🌍 i18n support — English, French, German
- 🏷️ Simple `:::answer-box` fenced container syntax
- 🔄 Per-box text ↔ code mode toggle
- 🎨 Integrates with any VitePress theme

---

## Install

```bash
npm install @matinfo/vitepress-plugin-exercices-form html2pdf.js
```

> `html2pdf.js` is a required peer dependency for PDF export.

---

## Quick start

### 1. Register the markdown and Vite plugins

In `.vitepress/config.ts`:

```ts
import {
  exerciceVitePlugin,
  exerciseMarkdownPlugin,
} from '@matinfo/vitepress-plugin-exercices-form'
import { defineConfig } from 'vitepress'

export default defineConfig({
  markdown: {
    config(md) {
      md.use(exerciseMarkdownPlugin) // parses :::answer-box fences
    },
  },
  vite: {
    plugins: [exerciceVitePlugin()], // handles html2pdf.js SSR exclusion
  },
})
```

### 2. Register components in the theme

In `.vitepress/theme/index.ts`:

```ts
import { enhanceAppWithExercises } from '@matinfo/vitepress-plugin-exercices-form'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithExercises(app, { lang: 'fr' })
  },
}
```

### 3. Write exercise pages

In any `.md` file:

```md
## Question 1

What is the capital of Switzerland?

:::answer-box

## Question 2

Write a PowerShell script that lists all files:

:::answer-box code
```

### 4. Add correction-only content

```md
:::answer-box-off
This content is hidden in student documents but visible in corrections.
:::
```

---

## Markdown syntax

| Block | Description |
| --- | --- |
| `:::answer-box` | Text answer area (resizable) |
| `:::answer-box code` | Code editor (monospace, tab support) |
| `:::answer-box-off` | Correction-only block — visible in PDF corrections, hidden on student pages |

---

## Options

`enhanceAppWithExercises(app, options)` accepts:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lang` | `"en" \| "fr" \| "de"` | `"en"` | UI language |
| `storagePrefix` | `string` | `"exercise-"` | localStorage key prefix |
| `defaultMode` | `"text" \| "code"` | `"text"` | Default editor mode |
| `enableModeToggle` | `boolean` | `true` | Show text/code toggle |
| `tabSize` | `number` | `2` | Tab width in code mode |
| `dateLocale` | `string` | same as `lang` | BCP 47 locale for date formatting |

---

## API

```ts
// markdown-it plugin — parses :::answer-box fences
function exerciseMarkdownPlugin(md: MarkdownIt): void

// Vite plugin — excludes html2pdf.js from SSR
function exerciceVitePlugin(): Plugin

// registers AnswerBox and ExercisePdfButton Vue components
function enhanceAppWithExercises(app: App, options?: ExercisePluginOptions): void

// returns the locale object for a given language code
function getLocale(lang: string): ExerciseLocale

// built-in locale strings (keys: "en", "fr", "de")
declare const locales: Record<string, ExerciseLocale>

// Pinia store — per-page answer state (use inside Vue components)
function useAnswerStore(): AnswerStore
```

### Types

```ts
interface ExercisePluginOptions {
  lang?: 'en' | 'fr' | 'de'
  storagePrefix?: string
  defaultMode?: 'text' | 'code'
  enableModeToggle?: boolean
  tabSize?: number
  dateLocale?: string
}
```

// Locale data
import { locales } from "@matinfo/vitepress-plugin-exercices-form"
```

---

## Ecosystem

| Package | Description |
| --- | --- |
| [@matinfo/vitepress-plugin-exercise-parser](https://github.com/matinfo/vitepress-plugin-exercise-parser) | Shared Markdown → AST parser |
| **[@matinfo/vitepress-plugin-exercices-form](https://github.com/matinfo/vitepress-plugin-exercices-form)** | Runtime interactive answer boxes *(this package)* |
| [@matinfo/vitepress-plugin-exercices-pdf](https://github.com/matinfo/vitepress-plugin-exercices-pdf) | Build-time student + correction PDF generator |
| [@matinfo/vitepress-plugin-cards-pdf](https://github.com/matinfo/vitepress-plugin-cards-pdf) | Build-time card grid PDF generator |

---

## Contributing

Pull requests are welcome — please open an issue first for significant changes.

## License

[GPL-3.0](./LICENSE)
