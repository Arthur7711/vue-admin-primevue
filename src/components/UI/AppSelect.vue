<template>
  <div :class="['custom-select', { 'clear': modelValue && clearable }]">
    <a-select
      v-model:value="modelValue"
      :open="isOpenSelect"
      :bordered="bordered"
      :mode="mode"
      :dropdown-match-select-width="autoWidth"
      show-arrow
      :show-search="showSearch"
      :filter-option="showSearch ? filterOption : false"
      :style="`min-width: ${minWidth ?? 'auto'}; --max-width: ${
        maxWidth ?? 'auto'
      }; border-bottom: ${showSearch && !bordered? '1px solid #e3e3e3' : 'none'}`"
      :max-tag-count="maxTagCount"
      :options="options"
      :size="size"
      :disabled="props.disabled"
      @click="toggleOpenSelect"
      @focusout="isOpenSelect = false"
      @change="emit('change')"
      @search="(e: string) => { emit('search', e); }"
      @deselect="(event: any) => emit('deselect', event)"
    >
      <template #placeholder>
        <span>
          <SearchOutlined v-if="showSearch" />
          {{ placeholder }}
        </span>
      </template>
      <template #suffixIcon>
        <span
          v-if="!clearable || (!modelValue && !slots.icon)"
          :class="[
            'triangle',
            { open: isOpenSelect },
            { disabled: props.disabled }
          ]"
          :style="{
            'border-color': `${color ?? '#000'} transparent transparent transparent`,
          }"
        ></span>
        <slot v-else-if="!modelValue" name="icon" :open="isOpenSelect" />
      </template>

      <slot
        name="items"
        :items="items"
        :item-value="itemValue ?? 'id'"
        :item-name="itemName ?? 'name'"
      />

      <template v-if="!slots.items">
        <a-select-option
          v-for="item in items"
          :key="typeof item === 'object' ? item.id : item"
          :value="typeof item === 'object' ? item[itemValue ?? 'id'] : item"
          :name="typeof item === 'object' ? item[itemName ?? 'name'] : item"
          :disabled="disabledFunc ? disabledFunc(item) : false"
        >
          <template v-if="!slots.item">
            {{ typeof item === "object" ? item[itemName ?? "name"] : item }}
          </template>
          <slot v-else name="item" :item="item"></slot>
        </a-select-option>
      </template>
    </a-select>
    <CloseCircleIcon
      v-if="modelValue && clearable"
      class="custom-select__icon"
      @click="clear"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, useSlots, watch } from "vue";
import { CloseCircleIcon } from "mdi-vue3";
import { LabeledValue } from "ant-design-vue/es/select";
import { SearchOutlined } from "@ant-design/icons-vue";

type RawValue = string | number;

const props = defineProps<{
  items?: { [key: string]: unknown }[] | string[];
  itemValue?: string;
  itemName?: string;
  bordered?: boolean;
  placeholder?: string;
  autoWidth?: boolean;
  minWidth?: string;
  maxWidth?: string;
  showSearch?: boolean;
  color?: string;
  clearable?: boolean;
  disabledFunc?: (item: { [key: string]: unknown } | string) => boolean;
  mode?: "multiple" | "tags";
  maxTagCount?: number;
  options?: { value: string | null }[];
  size?: "small" | "middle" | "large";
  disabled?: boolean
}>();
const modelValue = defineModel<
  RawValue | RawValue[] | LabeledValue | LabeledValue[]
>("value");

const emit = defineEmits<{
  (e: "change"): void;
  (e: "search", value: string): void;
  (e: "deselect", value: number): void;
}>();

const slots = useSlots();

const isOpenSelect = ref(false);

const filterOption = (input: string, option: any) => option.name.toLowerCase().includes(input.toLowerCase());

const clear = () => {
  modelValue.value = undefined;
  emit("change");
};

const toggleOpenSelect = () => {
  if (!props.disabled) isOpenSelect.value = !isOpenSelect.value
}

watch(modelValue, () => {
  if (
    props.mode &&
    props.mode === "multiple" &&
    Array.isArray(modelValue.value) &&
    modelValue.value.length === 0
  ) {
    modelValue.value = undefined;
  }
  isOpenSelect.value = false;
});
</script>

<style lang="scss" scoped>
.custom-select {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  & :deep(.ant-select-selector) {
    padding-bottom: 0 !important;
  }

  &.clear {
    & :deep(.ant-select-selection-item) {
      padding-right: 0 !important;
    }

    .custom-select__icon {
      margin-left: -8px;
    }
  }

  & :deep(.ant-select-multiple .ant-select-selector:after) {
    // fix symbol Â
    content: "";
    line-height: 1;
  }

  &__icon {
    position: relative;
    z-index: 1;
    width: 14px;
    cursor: pointer;
  }

  & :deep(.ant-select-selection-item) {
    max-width: var(--max-width);
    display: flex;
    align-items: center;
  }

  & :deep(.ant-select-multiple .ant-select-selector) {
    padding: 0 5px;
    border-radius: 10px;
    // min-height: 49px;
  }
  &:deep(.ant-select-selection-placeholder) {
    display: flex;
    align-items: center;
    color: #999;
  }
  &:deep(.anticon-search svg) {
    height: 0.75em;
  }

  .triangle {
    &.disabled {
      pointer-events: none;
      border-color: #e3e3e3 transparent transparent transparent !important;
    }
  }
}
</style>

<style lang="scss">
.rc-virtual-list-holder {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 102, 102, 0.2);
    border-radius: 5px;
  }
}
</style>
