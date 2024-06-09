<template>
  <LoadingIcon
    class="loader"
    :style="`
    width: ${width ?? 16}px;
    fill: ${fill ?? '#1565C0FF'};
    `"
  />
</template>

<script lang="ts" setup>
import { LoadingIcon } from 'mdi-vue3'

const props = defineProps<{
  width?: number
  fill?: string
}>()
</script>

<style lang="scss" scoped>
.loader {
  animation: loading 2s linear infinite;
}

@keyframes loading {
  100% {
    transform: rotate(360deg);
  }
}
</style>
