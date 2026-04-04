import type { ExerciseLocale } from "./types/exercise"

export const locales: Record<string, ExerciseLocale> = {
  en: {
    textMode: "📝 Text",
    codeMode: "💻 Code",
    textPlaceholder: "Your answer…",
    codePlaceholder: "Your code…",
    generatePdf: "📄 Generate PDF",
    generating: "Generating…",
    nameLabel: "Name",
    classLabel: "Class",
    dateLabel: "Date",
    namePlaceholder: "First Last",
    classPlaceholder: "e.g. CS2a",
    required: "*",
    requiredField: "Required field",
    clearAnswers: "🗑️ Clear answers",
    clearConfirm: "Clear all answers for this exercise?",
    noAnswer: "(no answer)",
    pdfError: "PDF generation failed. Please try again.",
    pdfTitle: "Generate your answer PDF",
  },
  fr: {
    textMode: "📝 Texte",
    codeMode: "💻 Code",
    textPlaceholder: "Votre réponse…",
    codePlaceholder: "Votre code…",
    generatePdf: "📄 Générer PDF",
    generating: "Génération…",
    nameLabel: "Nom",
    classLabel: "Classe",
    dateLabel: "Date",
    namePlaceholder: "Prénom Nom",
    classPlaceholder: "ex: CIN2a",
    required: "*",
    requiredField: "Champ obligatoire",
    clearAnswers: "🗑️ Effacer les réponses",
    clearConfirm: "Effacer toutes les réponses de cet exercice ?",
    noAnswer: "(pas de réponse)",
    pdfError: "Erreur lors de la génération du PDF. Veuillez réessayer.",
    pdfTitle: "Générer le PDF de vos réponses",
  },
  de: {
    textMode: "📝 Text",
    codeMode: "💻 Code",
    textPlaceholder: "Ihre Antwort…",
    codePlaceholder: "Ihr Code…",
    generatePdf: "📄 PDF erstellen",
    generating: "Wird erstellt…",
    nameLabel: "Name",
    classLabel: "Klasse",
    dateLabel: "Datum",
    namePlaceholder: "Vorname Nachname",
    classPlaceholder: "z.B. INF2a",
    required: "*",
    requiredField: "Pflichtfeld",
    clearAnswers: "🗑️ Antworten löschen",
    clearConfirm: "Alle Antworten für diese Übung löschen?",
    noAnswer: "(keine Antwort)",
    pdfError: "PDF-Erstellung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    pdfTitle: "PDF Ihrer Antworten erstellen",
  },
}

/**
 * Get locale strings for a given language code.
 * Falls back to English if the language is not found.
 */
export function getLocale(lang = "en"): ExerciseLocale {
  return locales[lang] ?? locales.en
}
