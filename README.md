# @matinfo/vitepress-plugin-exercices-form

A VitePress plugin that adds interactive exercise pages with answer boxes and client-side PDF generation.

## Features

- **Answer Boxes** — Text or code editor areas with localStorage persistence
- **PDF Generation** — Client-side PDF export with student name, class, and date
- **Markdown Syntax** — Simple `:::answer-box` fenced syntax in your `.md` files
- **Internationalization** — Built-in locales for English, French, and German
- **Mode Toggle** — Switch between text and code editing modes per answer box

## Installation

```bash
npm install @matinfo/vitepress-plugin-exercices-form html2pdf.js
```

> `html2pdf.js` is a required peer dependency for PDF generation.

## Usage

### 1. VitePress Config

In `.vitepress/config.ts`:

```ts
import { defineConfig } from "vitepress"
import { exerciseMarkdownPlugin, exerciceVitePlugin } from "@matinfo/vitepress-plugin-exercices-form"

export default defineConfig({
  markdown: {
    config(md) {
      md.use(exerciseMarkdownPlugin)
    },
  },
  vite: {
    plugins: [exerciceVitePlugin()],
  },
})
```

### 2. Theme Integration

In `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from "vitepress/theme"
import { enhanceAppWithExercises } from "@matinfo/vitepress-plugin-exercices-form"

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithExercises(app, { lang: "fr" })
  },
}
```

### 3. Write Exercises

In any `.md` file:

```md
# My Exercise

## Question 1

What is the capital of Switzerland?

:::answer-box

## Question 2

Write a PowerShell script that lists all files:

:::answer-box code
```

- `:::answer-box` — Renders a text answer area
- `:::answer-box code` — Renders a code editor area (monospace, tab support)

### Correction Mode

Use `:::answer-box-off` to mark content that should only appear in correction documents (stripped from student-facing pages):

```md
:::answer-box-off
The answer is Bern.
:::
```

## Options

`enhanceAppWithExercises(app, options)` accepts:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lang` | `"en" \| "fr" \| "de"` | `"en"` | UI language |
| `storagePrefix` | `string` | `"exercise-"` | localStorage key prefix |
| `defaultMode` | `"text" \| "code"` | `"text"` | Default editor mode |
| `enableModeToggle` | `boolean` | `true` | Show text/code toggle |
| `tabSize` | `number` | `2` | Tab width in code mode |
| `dateLocale` | `string` | same as `lang` | Date formatting locale |

## Development

```bash
# Build the plugin
npm run build

# Test with the included test project
cd test-project
npm install
npx vitepress dev
```

## License

GPL-3.0
