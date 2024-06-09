<template>
  <div ref="headerRef" class="table-header-select select">
    <a-select
      v-model:value="modelValue"
      :placeholder="props.title"
      class="table-header-select__input"
      :class="{ 'hide-text-item': props.hideText }"
      :dropdown-match-select-width="false"
      :allow-clear="props.allowClear"
      dropdown-class-name="select__dropdown"
      @dropdown-visible-change="dropdownVisibleChange"
      @change="emit('change')"
    >
      <template #suffixIcon>
        <div
          v-if="!modelValue || props.alwaysShowShevron"
          class="table-header-select__placeholder"
        >
          <svg
            v-if="!slots.icon"
            xmlns="http://www.w3.org/2000/svg"
            width="8"
            height="6"
            viewBox="0 0 8 6"
            fill="none"
            :class="{ 'upside-down': open }"
          >
            <path d="M4 6L7.4641 0H0.535898L4 6Z" fill="#999999" />
          </svg>
          <slot name="icon" />
        </div>
      </template>

      <a-select-option
        v-for="item in props.list"
        :key="item.id"
        :value="item[itemValue ?? 'id']"
        class="select__dropdown-item"
      >
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 4px;
            flex-wrap: nowrap;
          "
        >
          <img
            v-if="item.icon"
            :src="`/images/torrent-${item.icon}.svg`"
            :alt="item.icon?.toString()"
            style="width: 14px"
          />
          <span>{{ item.title }}</span>
        </div>
      </a-select-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useSlots } from "vue";

const props = defineProps<{
  title?: string;
  list: { [key: string]: unknown }[];
  alwaysShowShevron?: boolean;
  allowClear?: boolean;
  hideText?: boolean;
  itemValue?: string;
}>();

const modelValue = defineModel();
const emit = defineEmits<{
  (e: "change"): void;
}>();
const slots = useSlots();

const headerRef = ref();
const inputFocused = ref(false);
const open = ref(false);

const inputVisible = computed(() => inputFocused.value);

const dropdownVisibleChange = (value: boolean) => {
  open.value = value;
};
const visibleListener = (event: any) => {
  inputFocused.value = headerRef.value?.contains(event.target);
};

watch(inputVisible, (value) => {
  if (value) document.addEventListener("click", visibleListener);
  else document.removeEventListener("click", visibleListener);
});
</script>

<style lang="scss" scoped>
.table-header-select {
  position: relative;
  display: inline-block;

  & :deep(.ant-select-selector) {
    box-shadow: none !important;
  }

  &__placeholder {
    position: absolute;
    top: 50%;
    right: -12px;
    cursor: pointer;
    pointer-events: none;
    line-height: 1;
    color: #999999;
    transform: translateY(-50%);

    span {
      padding: 0;
      margin: 0;
    }
    svg {
      transition: transform 200ms;
    }
  }

  &__input {
    border: none;
    border-bottom: 1px solid #e3e3e3;
    height: 21px;
    padding: 0;
    box-shadow: none;

    .hide-text {
      display: none;
    }

    &:not(.hide-text-item):deep(.ant-select-selection-item) {
      padding-right: 12px;
    }
    &:deep(.ant-select-selection-item) {
      display: flex;
    }
  }

  &:deep(.ant-select) {
    width: 100%;
  }

  &:deep(.ant-select-selector) {
    display: flex;
    align-items: center;
    border: none;
    padding: 0;
    height: 22px;
  }

  &:deep(.ant-select-selection-placeholder) {
    line-height: normal;
    color: #999;
  }

  &:deep(.ant-select-clear) {
    margin-top: 0;
    top: calc(50% - 6px);
    right: 0;
  }
}
</style>
