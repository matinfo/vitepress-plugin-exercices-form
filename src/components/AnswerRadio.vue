<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { parseAnswer, useAnswerStore } from '../composables/useAnswerStore'

const props = defineProps<{
  id: string
  items: string[]
}>()

const { getAnswer, setAnswer } = useAnswerStore()

const selected = ref<number | null>(null)

onMounted(() => {
  const saved = parseAnswer<number>(getAnswer(props.id, 'radio'))
  if (typeof saved === 'number' && Number.isInteger(saved) && saved >= 0 && saved < props.items.length)
    selected.value = saved
})

watch(selected, (val) => {
  setAnswer(props.id, Number.isInteger(val) ? JSON.stringify(val) : '', 'radio')
})
</script>

<template>
  <div :id="id" class="vpe-answer-box vpe-radio-box" data-vpe-type="radio">
    <label v-for="(item, i) in items" :key="i" class="vpe-radio-item">
      <input v-model="selected" :name="id" type="radio" :value="i">
      <span>{{ item }}</span>
    </label>
  </div>
</template>
