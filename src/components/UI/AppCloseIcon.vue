<template>
  <a-tooltip placement="topLeft">
    <template #title>clear all filters</template>
    <a-button
      type="text"
      class="close"
      :style="{
        'position': position ?? 'relative',
        'top': top ?? 'auto',
        'left': left ?? 'auto'
      }"
      @click="emit('click')"
    >
      <svg
        data-v-d8789ce5=""
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style="height: 18px"
      >
        <path
          d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z"
        ></path>
      </svg>
    </a-button>
  </a-tooltip>
</template>

<script lang="ts" setup>
const props = defineProps<{
  top?: string;
  left?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<style lang="scss" scoped>
.close {
  padding: 0;
  height: auto;
  line-height: 1;

  svg {
    fill: $main-grey;
    width: 20px;
  }
}
</style>
