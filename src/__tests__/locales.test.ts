import { describe, expect, it } from 'vitest'
import { getLocale, locales } from '../locales'

describe('locales', () => {
  it('has en, fr, de locales', () => {
    expect(Object.keys(locales)).toEqual(expect.arrayContaining(['en', 'fr', 'de']))
  })

  it('each locale has all required keys', () => {
    const requiredKeys = [
      'textMode', 'codeMode', 'textPlaceholder', 'codePlaceholder',
      'generatePdf', 'generating', 'nameLabel', 'classLabel', 'dateLabel',
      'namePlaceholder', 'classPlaceholder', 'required', 'requiredField',
      'clearAnswers', 'clearConfirm', 'noAnswer', 'pdfError', 'pdfTitle',
    ]
    for (const [lang, locale] of Object.entries(locales)) {
      for (const key of requiredKeys) {
        expect(locale, `${lang} missing "${key}"`).toHaveProperty(key)
        expect((locale as Record<string, string>)[key], `${lang}.${key} is empty`).toBeTruthy()
      }
    }
  })
})

describe('getLocale', () => {
  it('returns the correct locale for a known language', () => {
    expect(getLocale('fr')).toBe(locales.fr)
    expect(getLocale('de')).toBe(locales.de)
  })

  it('falls back to English for unknown language', () => {
    expect(getLocale('xx')).toBe(locales.en)
  })

  it('defaults to English when called without argument', () => {
    expect(getLocale()).toBe(locales.en)
  })
})
