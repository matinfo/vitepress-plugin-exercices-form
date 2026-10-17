<script setup lang="ts">
import type { ExerciseLocale } from '../types/exercise'
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { useAnswerStore } from '../composables/useAnswerStore'

const props = withDefaults(defineProps<{
  id: string
  defaultMode?: 'text' | 'code'
}>(), {
  defaultMode: 'text',
})

const locale = inject<ExerciseLocale>('exercise-locale')!
const enableModeToggle = inject<boolean>('exercise-enable-mode-toggle', true)
const tabSize = inject<number>('exercise-tab-size', 2)
const storagePrefix = inject<string>('exercise-storage-prefix', 'exercise-')

const { getAnswer, setAnswer } = useAnswerStore()

const text = ref('')
const mode = ref<'text' | 'code'>(props.defaultMode)
const textarea = ref<HTMLTextAreaElement | null>(null)

const STORAGE_MODE_PREFIX = `${storagePrefix}mode-`

function autoGrow() {
  const el = textarea.value
  if (!el)
    return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function loadMode() {
  if (typeof window === 'undefined')
    return
  const saved = localStorage.getItem(STORAGE_MODE_PREFIX + props.id)
  if (saved === 'code' || saved === 'text')
    mode.value = saved
}

function saveMode() {
  if (typeof window === 'undefined')
    return
  localStorage.setItem(STORAGE_MODE_PREFIX + props.id, mode.value)
}

const lineCount = computed(() => {
  if (mode.value !== 'code')
    return 0
  return Math.max((text.value || '').split('\n').length, 3)
})

const tabSpaces = ' '.repeat(tabSize)

function handleKeydown(e: KeyboardEvent) {
  if (mode.value !== 'code')
    return
  const el = textarea.value
  if (!el)
    return

  if (e.key === 'Tab') {
    e.preventDefault()
    const start = el.selectionStart
    const end = el.selectionEnd
    const val = text.value

    if (e.shiftKey) {
      const before = val.slice(0, start)
      const lineStart = before.lastIndexOf('\n') + 1
      const line = val.slice(lineStart)
      if (line.startsWith(tabSpaces)) {
        text.value = val.slice(0, lineStart) + val.slice(lineStart + tabSize)
        nextTick(() => {
          el.selectionStart = el.selectionEnd = Math.max(start - tabSize, lineStart)
        })
      }
    }
    else {
      text.value = val.slice(0, start) + tabSpaces + val.slice(end)
      nextTick(() => {
        el.selectionStart = el.selectionEnd = start + tabSize
      })
    }
  }
}

onMounted(() => {
  loadMode()
  text.value = getAnswer(props.id, 'text')
  nextTick(autoGrow)
})

watch(text, (val) => {
  setAnswer(props.id, val)
  nextTick(autoGrow)
})

watch(mode, () => {
  saveMode()
  nextTick(autoGrow)
})
</script>

<template>
  <div class="vpe-answer-box" :class="{ 'vpe-code-mode': mode === 'code' }">
    <div v-if="enableModeToggle" class="vpe-answer-toolbar">
      <button
        class="vpe-mode-btn"
        :class="{ active: mode === 'text' }"
        :title="locale.textMode"
        @click="mode = 'text'"
      >
        {{ locale.textMode }}
      </button>
      <button
        class="vpe-mode-btn"
        :class="{ active: mode === 'code' }"
        :title="locale.codeMode"
        @click="mode = 'code'"
      >
        {{ locale.codeMode }}
      </button>
    </div>
    <div class="vpe-editor-wrapper">
      <div v-if="mode === 'code'" class="vpe-line-numbers" aria-hidden="true">
        <span v-for="n in lineCount" :key="n">{{ n }}</span>
      </div>
      <textarea
        :id="id"
        ref="textarea"
        v-model="text"
        :placeholder="mode === 'code' ? locale.codePlaceholder : locale.textPlaceholder"
        rows="3"
        :data-mode="mode"
        @keydown="handleKeydown"
      />
    </div>
  </div>
</template>
