<template>
  <router-link
    :to="link"
    class="link"
  >
    <PencilIcon style="width: 15px" />
    edit
  </router-link>
</template>

<script lang="ts" setup>
import { PencilIcon } from "mdi-vue3";

defineProps<{
  link: string
}>()
</script>

<style lang="scss" scoped>
.link {
  display: flex;
  gap: 5px;
  color: $main-blue;
  fill: $main-blue;
  font-weight: 600;
}
</style>
