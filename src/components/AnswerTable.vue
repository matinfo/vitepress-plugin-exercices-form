<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { isEmptyAnswer, parseAnswer, useAnswerStore } from '../composables/useAnswerStore'

const props = withDefaults(defineProps<{
  id: string
  headers: string[]
  rows?: number
}>(), {
  rows: 3,
})

const { getAnswer, setAnswer } = useAnswerStore()

function emptyGrid(): string[][] {
  return Array.from({ length: props.rows }, () => props.headers.map(() => ''))
}

const cells = ref<string[][]>(emptyGrid())

onMounted(() => {
  const saved = parseAnswer<string[][]>(getAnswer(props.id))
  if (Array.isArray(saved)) {
    cells.value = emptyGrid().map((row, r) =>
      row.map((_, c) => String(saved[r]?.[c] ?? '')),
    )
  }
})

watch(cells, (val) => {
  const json = JSON.stringify(val)
  setAnswer(props.id, isEmptyAnswer('table', json) ? '' : json)
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
            <input v-model="cells[r][c]" type="text" :aria-label="headers[c]">
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
