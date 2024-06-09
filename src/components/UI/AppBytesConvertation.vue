<template>
  {{ convertedBytes }}
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bytes: number
}>()

const convertedBytes = computed(() => props.bytes ? bytesConversion(props.bytes) : '0 B')

const bytesConversion = (num: number, pow: number = 3): number | string => {
  const current = num / Math.pow(1024, pow)
  return current >= 0.1
    ? (pow > 0 ? current.toFixed(2) : current) + [' B', ' kB', ' MB', ' GB', ' TB'][pow]
    : bytesConversion(num, pow - 1)
}

</script>
<style lang="scss" scoped></style>
