<template>
  <div :class="{ center: center }">
    <button
      class="text"
      :title="title"
      @click="(e) => {
        utils.copyText(copyText || title);
        e.stopPropagation();
      }"
    >
      <slot />
      <template v-if="!slots.text">
        {{ copyText || title }}
      </template>
      <slot name="text" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from "vue";
import utils from "@/utils";

const props = defineProps<{
  title?: string;
  copyText?: string;
  center?: boolean;
}>();

const slots = useSlots();
</script>

<style lang="scss" scoped>
.center {
  text-align: center;
}

.text {
  max-width: 100%;
  margin: 0;
  padding-bottom: 1px;
  border-bottom: 1px dashed #000;
  cursor: pointer;
  line-height: 1.1;
  text-align: left;
}
</style>
