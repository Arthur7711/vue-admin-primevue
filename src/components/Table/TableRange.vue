<template>
  <div ref="headerRef" class="table-header-range">
    <div v-show="inputFocused" class="table-header-range__wrapper">
      <a-input
        v-model:value="modelValue.from"
        type="number"
        class="table-header-range__input"
        :placeholder="from || `${props.title} from`"
        @input="onEmit"
      />

      <a-input
        v-model:value="modelValue.to"
        type="number"
        class="table-header-range__input"
        :placeholder="to || `${props.title} to`"
        @input="onEmit"
      />

      <div v-if="modelValue.unit" class="table-header-range__buttons">
        <a-button
          class="table-header-range__button"
          :class="{ active: modelValue.unit === 2 }"
          :type="modelValue.unit === 2 ? 'primary' : 'default'"
          size="small"
          @click="setUnit(2)"
        >
          MB
        </a-button>

        <a-button
          class="table-header-range__button"
          :class="{ active: modelValue.unit === 3 }"
          :type="modelValue.unit === 3 ? 'primary' : 'default'"
          size="small"
          @click="setUnit(3)"
        >
          GB
        </a-button>
      </div>

      <div v-show="modelValue.from || modelValue.to" class="table-header-range__close">
        <WindowCloseIcon @click="clear" />
      </div>
    </div>
    <div class="table-header-range__placeholder" @click="toggleSearch(!inputFocused)">
      {{ props.title }}
      <svg
v-if="!slots.icon" xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none"
        :class="{ 'upside-down': inputFocused }">
        <path d="M4 6L7.4641 0H0.535898L4 6Z" fill="#999999" />
      </svg>
      <slot name="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useSlots, watch, Ref } from 'vue'
import { WindowCloseIcon } from 'mdi-vue3'

const props = defineProps<{
  title?: string
  from?: string
  to?: string
}>()
const modelValue = defineModel()
const emit = defineEmits<{
  (e: 'input'): void;
}>()
const slots = useSlots()

const headerRef: Ref< HTMLDivElement | null> = ref(null)
const inputFocused: Ref<boolean> = ref(false)
const timeout: Ref<any> = ref(null)

const toggleSearch = (value: boolean) => {
  inputFocused.value = value
}
const visibleListener = (event: any) => {
  if (!headerRef.value?.contains(event.target)) toggleSearch(false)
}
const clear = () => {
  if (modelValue.value.from && modelValue.value.to) {
    setTimeout(() => {
      emit('input')
    }, 0)
  }

  modelValue.value.from = undefined
  modelValue.value.to = undefined
}

const setUnit = (value: number) => {
  modelValue.value.unit = value
  onEmit()
}

const onEmit = () => {
  if (modelValue.value.from && modelValue.value.to) {
    clearTimeout(timeout.value)
    timeout.value = setTimeout(() => {
      emit('input')
      inputFocused.value = false
    }, 800)
  }
}

watch(inputFocused, (value) => {
  if (value) document.addEventListener('click', visibleListener)
  else document.removeEventListener('click', visibleListener)
})
</script>

<style lang="scss" scoped>
.table-header-range {
  position: relative;

  &__placeholder {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 22px;
    cursor: pointer;

    svg {
      transition: transform 200ms;
    }
  }

  &__input+&__input {
    margin-left: 6px;
  }

  &__input {
    border-radius: 10px;
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
    width: 220px;
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
    width: calc(50% - 3px);
    border-radius: 5px;

    &.active {
      background-color: $main-blue;
      pointer-events: none;
    }
  }

  &__button+&__button {
    margin-left: 6px;
  }

  &__close {
    width: 14px;
    height: 14px;
    position: absolute;
    top: 30px;
    right: 4px;
    cursor: pointer;
  }
}
</style>
