<template>
  <a-modal
    v-model:visible="modelValue"
    class="custom-modal"
    :closable="closable ?? false"
    :cancelText="cancelText ?? 'cancel'"
    :okText="okText ?? 'confirm'"
    :centered="centered ?? false"
    :width="width ?? '540px'"
    @cancel="emit('cancel')"
    @ok="emit('ok')"
  >
    <slot name="default"></slot>
    <template v-if="!slots.default">
      <h3>{{ title }}</h3>
      <span>{{ description }}</span>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue'

const slots = useSlots();
defineProps<{
  title?: string,
  description?: string,
  closable?: boolean,
  width?: string,
  cancelText?: string,
  okText?: string,
  centered?: boolean,
}>()

const emit = defineEmits<{
  (e: 'cancel'): void,
  (e: 'ok'): void,
}>()

const modelValue = defineModel<boolean>()

</script>

<style lang="scss" scoped>

</style>
