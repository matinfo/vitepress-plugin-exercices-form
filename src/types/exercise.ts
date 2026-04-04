export interface ExerciseLocale {
  textMode: string
  codeMode: string
  textPlaceholder: string
  codePlaceholder: string
  generatePdf: string
  generating: string
  nameLabel: string
  classLabel: string
  dateLabel: string
  namePlaceholder: string
  classPlaceholder: string
  required: string
  requiredField: string
  clearAnswers: string
  clearConfirm: string
  noAnswer: string
  pdfError: string
  pdfTitle: string
}

export interface ExercisePluginOptions {
  /** UI language code (default: 'en') */
  lang?: string
  /** localStorage key prefix (default: 'exercise-') */
  storagePrefix?: string
  /** Default editor mode for answer boxes */
  defaultMode?: "text" | "code"
  /** Show mode toggle buttons (default: true) */
  enableModeToggle?: boolean
  /** Tab size in code mode (default: 2) */
  tabSize?: number
  /** Date locale for PDF (default: same as lang) */
  dateLocale?: string
}
