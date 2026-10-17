import { reactive } from 'vue'

const answers = reactive<Record<string, string>>({})
// Box type that wrote each answer; absent for answers saved before type tagging.
const types: Record<string, AnswerType> = {}
let loaded = false
let prefix = 'exercise-'

function loadFromStorage(): void {
  if (typeof window === 'undefined')
    return
  if (loaded)
    return
  loaded = true

  const storageKey = `${prefix}answers-`
  const typeKey = `${prefix}type-`
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(storageKey)) {
      const id = key.slice(storageKey.length)
      answers[id] = localStorage.getItem(key) ?? ''
    }
    else if (key?.startsWith(typeKey)) {
      const type = localStorage.getItem(key)
      if (type === 'text' || type === 'checkbox' || type === 'radio' || type === 'table')
        types[key.slice(typeKey.length)] = type
    }
  }
}

export function initAnswerStore(storagePrefix: string): void {
  prefix = storagePrefix
}

export function useAnswerStore() {
  loadFromStorage()

  const storageKey = `${prefix}answers-`
  const typeKey = `${prefix}type-`

  function removeStored(id: string): void {
    delete answers[id]
    delete types[id]
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey + id)
      localStorage.removeItem(typeKey + id)
    }
  }

  /**
   * Box ids are positional, so an id can outlive the box type that wrote it.
   * When `type` is given, an answer written by another type is discarded.
   * Untagged (legacy) answers are only discarded for text boxes when they
   * look like structured JSON.
   */
  function getAnswer(id: string, type?: AnswerType): string {
    const value = answers[id] ?? ''
    if (!type || !value)
      return value
    const tag = types[id]
    const stale = tag
      ? tag !== type
      : type === 'text' && Array.isArray(parseAnswer<unknown>(value))
    if (stale) {
      removeStored(id)
      return ''
    }
    return value
  }

  function setAnswer(id: string, value: string, type: AnswerType = 'text'): void {
    if (!value) {
      removeStored(id)
      return
    }
    answers[id] = value
    types[id] = type
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey + id, value)
      localStorage.setItem(typeKey + id, type)
    }
  }

  function getAnswersForExercise(exerciseId: string): Record<string, string> {
    const pfx = `${exerciseId}-`
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(answers)) {
      if (key.startsWith(pfx) && value) {
        result[key] = value
      }
    }
    return result
  }

  function clearExercise(exerciseId: string): void {
    const pfx = `${exerciseId}-`
    for (const key of Object.keys(answers)) {
      if (key.startsWith(pfx)) {
        removeStored(key)
      }
    }
  }

  return { getAnswer, setAnswer, getAnswersForExercise, clearExercise }
}

export type AnswerType = 'text' | 'checkbox' | 'radio' | 'table'

/** Parse a JSON-encoded structured answer; returns null if invalid. */
export function parseAnswer<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  }
  catch {
    return null
  }
}

/** True when a stored answer holds no user input (unchecked list, empty grid, blank text). */
export function isEmptyAnswer(type: AnswerType, value: string): boolean {
  if (!value)
    return true
  if (type === 'checkbox') {
    const v = parseAnswer<boolean[]>(value)
    return !Array.isArray(v) || !v.some(Boolean)
  }
  if (type === 'radio') {
    const v = parseAnswer<number>(value)
    return !(typeof v === 'number' && Number.isInteger(v) && v >= 0)
  }
  if (type === 'table') {
    const v = parseAnswer<string[][]>(value)
    return !Array.isArray(v) || !v.some(r => Array.isArray(r) && r.some(c => String(c ?? '').trim()))
  }
  return !value.trim()
}
