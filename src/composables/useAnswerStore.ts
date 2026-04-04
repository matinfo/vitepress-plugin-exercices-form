import { reactive, inject } from "vue"
import type { ExercisePluginOptions } from "../types/exercise"

const answers = reactive<Record<string, string>>({})
let loaded = false
let prefix = "exercise-"

function loadFromStorage(): void {
  if (typeof window === "undefined") return
  if (loaded) return
  loaded = true

  const storageKey = prefix + "answers-"
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(storageKey)) {
      const id = key.slice(storageKey.length)
      answers[id] = localStorage.getItem(key) ?? ""
    }
  }
}

export function initAnswerStore(storagePrefix: string): void {
  prefix = storagePrefix
}

export function useAnswerStore() {
  loadFromStorage()

  const storageKey = prefix + "answers-"

  function getAnswer(id: string): string {
    return answers[id] ?? ""
  }

  function setAnswer(id: string, value: string): void {
    answers[id] = value
    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem(storageKey + id, value)
      } else {
        localStorage.removeItem(storageKey + id)
      }
    }
  }

  function getAnswersForExercise(exerciseId: string): Record<string, string> {
    const pfx = exerciseId + "-"
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(answers)) {
      if (key.startsWith(pfx) && value) {
        result[key] = value
      }
    }
    return result
  }

  function clearExercise(exerciseId: string): void {
    const pfx = exerciseId + "-"
    for (const key of Object.keys(answers)) {
      if (key.startsWith(pfx)) {
        delete answers[key]
        if (typeof window !== "undefined") {
          localStorage.removeItem(storageKey + key)
        }
      }
    }
  }

  return { getAnswer, setAnswer, getAnswersForExercise, clearExercise }
}
