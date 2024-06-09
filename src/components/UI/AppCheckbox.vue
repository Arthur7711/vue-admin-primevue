<template>
  <label :class="['custom-checkbox', { disabled: disabled }]" :title="title">
    <input
      v-model="modelValue"
      type="checkbox"
      :value="value"
      class="custom-checkbox__input"
      :checked="checked"
      @change="emit('change')"
      @click="emit('click')"
    />
    <span
      ref="customCheckBox"
      :class="[
        'custom-checkbox__field',
        { small: small }
      ]"
    ></span>
    <span v-if="name" :class="['custom-checkbox__name', { small: small }]">
      {{ name }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  title?: string;
  name?: string;
  value?: string | number;
  small?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
}>();

const modelValue = defineModel();
const emit = defineEmits<{
  (e: "change"): void;
  (e: "click"): void;
}>();

watch(() => props.indeterminate, (val) => {
  if (val) {
    document.querySelector('.custom-checkbox__field')?.classList.add('indeterminate')
  } else if (document.querySelector('.custom-checkbox__field')?.classList.contains('indeterminate')) {
    document.querySelector('.custom-checkbox__field')?.classList.remove('indeterminate')
  }
})
</script>

<style lang="scss" scoped>
.custom-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  &.disabled {
    pointer-events: none;
    color: #e3e3e3 !important;

    .custom-checkbox__field {
      background-color: #e3e3e3 !important;
      border-color: #e3e3e3 !important;
    }
  }

  &__input {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    visibility: hidden;

    &:checked ~ .custom-checkbox__field {
      background-color: $main-blue;
      border-color: $main-blue;
    }

    &:checked ~ .custom-checkbox__field.indeterminate {
      background-color: #fff;
      border-color: #e3e3e3;

      &:before {
        background: none;
      }

      &:after {
        display: block;
      }
    }
  }

  &__field {
    position: relative;
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    border: 1px solid #e3e3e3;
    color: #fff;
    transition: background-color 0.35s, border-color 0.35s;

    &:before {
      content: "";
      position: absolute;
      top: calc(50% - 3.85px);
      left: calc(50% - 5.5px);
      width: 11px;
      height: 100%;
      line-height: 1;
      background: url("/images/check.svg") no-repeat;
    }

    &:after {
      content: "";
      display: none;
      position: absolute;
      width: 8px;
      height: 8px;
      top: calc(50% - 4px);
      left: calc(50% - 4px);
      background-color: $main-blue;
    }

    &.small {
      width: 16px;
      height: 16px;

      &:before {
        width: 10px;
      }
    }
  }

  &__name {
    display: block;
    margin: 0;
    font-size: 16px;

    &.small {
      font-size: 14px;
    }
  }
}
</style>
