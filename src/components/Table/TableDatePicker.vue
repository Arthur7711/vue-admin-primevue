<template>
  <div ref="headerRef" class="table-header-date">
    <div v-show="inputFocused" class="table-header-date__wrapper">
      <a-range-picker
        v-model:value="modelValue"
        format="YYYY-MM-DD"
        allow-clear
        @change="onChange"
      />
    </div>
    <div class="table-header-date__placeholder" @click="toggleSearch">
      {{ props.title }}
      <svg
v-if="!slots.icon" xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none"
        :class="{ 'upside-down': inputFocused }">
        <path d="M4 6L7.4641 0H0.535898L4 6Z" fill="#999999" />
      </svg>
      <slot name="icon"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, useSlots, Ref } from 'vue'

const props = defineProps<{
  title?: string
}>()
const emit = defineEmits<{
  (e: 'change'): void
}>()
const modelValue = defineModel()
const slots = useSlots()

const headerRef: Ref< HTMLDivElement | null> = ref(null)
const inputFocused = ref(false)

const toggleSearch = () => {
  inputFocused.value = !inputFocused.value
}
const visibleListener = (event: any) => {
  if (!headerRef.value?.contains(event.target) && event.target.closest('.main-content')) toggleSearch()
}

const onChange = () => {
  emit('change')
  toggleSearch()
}

watch(inputFocused, (value) => {
  if (value) document.addEventListener('click', visibleListener)
  else document.removeEventListener('click', visibleListener)
})
</script>

<style lang="scss" scoped>
.table-header-date {
  position: relative;

  &:deep(.ant-picker-input input::placeholder) {
    text-transform: lowercase;
  }

  &__placeholder {
    display: flex;
    cursor: pointer;
    align-items: center;
    gap: 5px;

    svg {
      transition: transform 200ms;
    }
  }

  &__input+&__input {
    margin-left: 6px;
  }

  &__input {
    height: 21px;
    padding: 8px 15px;
    box-shadow: none;
    width: calc(50% - 3px);

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &__wrapper {
    position: absolute;
    width: max-content;
    top: 100%;

    background: white;
    z-index: 1;
    padding: 20px;
    box-shadow: 0 0 22px 7px rgba(129, 131, 136, 0.20), 0 0 22px 7px rgba(129, 131, 136, 0.20);
    backdrop-filter: blur(2.5px);
    border-radius: 10px;
  }

  &__buttons {
    padding-top: 10px;
  }

  &__button {
    width: calc(50% - 3px)
  }

  &__button+&__button {
    margin-left: 6px;
  }

  &__close {
    width: 14px;
    height: 14px;
    position: absolute;
    top: 22px;
    right: 6px;
    cursor: pointer;
  }
}
</style>
