<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { isEmptyAnswer, parseAnswer, useAnswerStore } from '../composables/useAnswerStore'

const props = withDefaults(defineProps<{
  id: string
  headers: string[]
  rows?: number
  firstColumn?: string[]
}>(), {
  rows: 3,
  firstColumn: () => [],
})

const { getAnswer, setAnswer } = useAnswerStore()

function emptyGrid(): string[][] {
  return Array.from({ length: props.rows }, (_, r) => props.headers.map((_, c) => (c === 0 ? String(props.firstColumn[r] ?? '') : '')))
}

const cells = ref<string[][]>(emptyGrid())

function autoGrowCell(el: HTMLTextAreaElement): void {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function autoGrowAll(): void {
  if (typeof document === 'undefined')
    return
  const root = document.getElementById(props.id)
  root?.querySelectorAll<HTMLTextAreaElement>('.vpe-table-cell-input').forEach(autoGrowCell)
}

function handleCellInput(e: Event): void {
  const target = e.target
  if (target instanceof HTMLTextAreaElement)
    autoGrowCell(target)
}

onMounted(() => {
  const current = getAnswer(props.id, 'table')
  const saved = parseAnswer<string[][]>(current)
  if (Array.isArray(saved)) {
    cells.value = emptyGrid().map((row, r) =>
      row.map((_, c) => {
        if (c === 0 && props.firstColumn[r] != null)
          return String(props.firstColumn[r])
        return String(saved[r]?.[c] ?? row[c] ?? '')
      }),
    )
  }
  if (!current && props.firstColumn.some(v => String(v).trim()))
    setAnswer(props.id, JSON.stringify(cells.value), 'table')
  nextTick(autoGrowAll)
})

watch(cells, (val) => {
  const json = JSON.stringify(val)
  setAnswer(props.id, isEmptyAnswer('table', json) ? '' : json, 'table')
  nextTick(autoGrowAll)
}, { deep: true })
</script>

<template>
  <div :id="id" class="vpe-answer-box vpe-table-box" data-vpe-type="table">
    <table class="vpe-answer-table">
      <thead>
        <tr>
          <th v-for="(h, c) in headers" :key="c">
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, r) in cells" :key="r">
          <td v-for="(_, c) in row" :key="c">
            <div v-if="c === 0 && firstColumn[r] != null" class="vpe-table-cell-fixed">
              {{ firstColumn[r] }}
            </div>
            <textarea
              v-else
              v-model="cells[r][c]"
              class="vpe-table-cell-input"
              rows="1"
              :aria-label="headers[c]"
              @input="handleCellInput"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
