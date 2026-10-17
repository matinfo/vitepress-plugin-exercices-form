import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initAnswerStore, useAnswerStore } from '../composables/useAnswerStore'

// Mock localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  get length() { return Object.keys(store).length },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k] }),
}

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

describe('useAnswerStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    // Re-init to reset internal state
    initAnswerStore('test-')
  })

  it('returns empty string for unknown answer', () => {
    const { getAnswer } = useAnswerStore()
    expect(getAnswer('unknown-id')).toBe('')
  })

  it('sets and gets an answer', () => {
    const { setAnswer, getAnswer } = useAnswerStore()
    setAnswer('q1', 'my answer')
    expect(getAnswer('q1')).toBe('my answer')
  })

  it('persists to localStorage', () => {
    const { setAnswer } = useAnswerStore()
    setAnswer('q1', 'saved')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-answers-q1', 'saved')
  })

  it('removes from localStorage when value is empty', () => {
    const { setAnswer } = useAnswerStore()
    setAnswer('q1', 'saved')
    setAnswer('q1', '')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-answers-q1')
  })

  it('getAnswersForExercise returns only matching answers', () => {
    const { setAnswer, getAnswersForExercise } = useAnswerStore()
    setAnswer('ex1-q1', 'a1')
    setAnswer('ex1-q2', 'a2')
    setAnswer('ex2-q1', 'other')

    const result = getAnswersForExercise('ex1')
    expect(result).toEqual({ 'ex1-q1': 'a1', 'ex1-q2': 'a2' })
    expect(result).not.toHaveProperty('ex2-q1')
  })

  it('clearExercise removes all answers for an exercise', () => {
    const { setAnswer, getAnswer, clearExercise } = useAnswerStore()
    setAnswer('ex1-q1', 'a1')
    setAnswer('ex1-q2', 'a2')
    setAnswer('ex2-q1', 'keep')

    clearExercise('ex1')

    expect(getAnswer('ex1-q1')).toBe('')
    expect(getAnswer('ex1-q2')).toBe('')
    expect(getAnswer('ex2-q1')).toBe('keep')
  })
})

describe('isEmptyAnswer', () => {
  it('detects empty structured answers', async () => {
    const { isEmptyAnswer } = await import('../composables/useAnswerStore')
    expect(isEmptyAnswer('checkbox', '[false,false]')).toBe(true)
    expect(isEmptyAnswer('checkbox', '[false,true]')).toBe(false)
    expect(isEmptyAnswer('radio', '')).toBe(true)
    expect(isEmptyAnswer('radio', '0')).toBe(false)
    expect(isEmptyAnswer('radio', '-1')).toBe(true)
    expect(isEmptyAnswer('table', '[["",""]]')).toBe(true)
    expect(isEmptyAnswer('table', '[["","x"]]')).toBe(false)
    expect(isEmptyAnswer('text', '  ')).toBe(true)
  })
})

describe('answer type tagging', () => {
  beforeEach(() => {
    localStorageMock.clear()
    initAnswerStore('tag-')
  })

  it('discards an answer written by another box type', () => {
    const { setAnswer, getAnswer } = useAnswerStore()
    setAnswer('tag-ex-q1', '[["a","","",""]]', 'table')
    expect(getAnswer('tag-ex-q1', 'text')).toBe('')
    expect(store['tag-answers-tag-ex-q1']).toBeUndefined()
  })

  it('keeps an answer of the same type, even JSON-looking text', () => {
    const { setAnswer, getAnswer } = useAnswerStore()
    setAnswer('tag-ex-q2', '[1,2]', 'text')
    expect(getAnswer('tag-ex-q2', 'text')).toBe('[1,2]')
  })

  it('discards untagged legacy JSON array for a text box', () => {
    store['tag-answers-tag-ex-q3'] = '[["x"]]'
    const { getAnswer } = useAnswerStore()
    expect(getAnswer('tag-ex-q3', 'text')).toBe('')
  })
})
