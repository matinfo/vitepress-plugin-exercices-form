<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { parseAnswer, useAnswerStore } from '../composables/useAnswerStore'

const props = defineProps<{
  id: string
  items: string[]
}>()

const { getAnswer, setAnswer } = useAnswerStore()

const checked = ref<boolean[]>(props.items.map(() => false))

onMounted(() => {
  const saved = parseAnswer<boolean[]>(getAnswer(props.id))
  if (Array.isArray(saved))
    checked.value = props.items.map((_, i) => saved[i] === true)
})

watch(checked, (val) => {
  setAnswer(props.id, val.some(Boolean) ? JSON.stringify(val) : '')
}, { deep: true })
</script>

<template>
  <div :id="id" class="vpe-answer-box vpe-checkbox-box" data-vpe-type="checkbox">
    <label v-for="(item, i) in items" :key="i" class="vpe-checkbox-item">
      <input v-model="checked[i]" type="checkbox">
      <span>{{ item }}</span>
    </label>
  </div>
</template>
