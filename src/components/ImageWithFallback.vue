<template>
  <component :is="tag" v-bind="attrs" @error="handleError" v-if="!errored" />
  <div v-else :class="['fallback', className]" :style="styleObj">
    <div class="fallback-inner">
      <img :src="placeholder" alt="fallback" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  tag: { type: String, default: 'img' },
  className: { type: String, default: '' },
  style: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['error'])
const errored = ref(false)

const attrs = computed(() => ({
  src: props.src,
  alt: props.alt,
  class: props.className,
  style: props.style,
}))
const styleObj = props.style

const placeholder =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

function handleError(e) {
  errored.value = true
  emit('error', e)
}
</script>

<style scoped>
.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f3f3;
}
.fallback-inner img {
  width: 64px;
  height: 64px;
  opacity: 0.6;
}
</style>
