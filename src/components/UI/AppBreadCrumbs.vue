<template>
  <div class="breadcrumbs">
    <a-breadcrumb :routes="items" separator=">">
      <template #itemRender="{ route }">
        <router-link :class="{ '--disabled': route.disabled }" :to="route.to">
          {{ route.name }}
        </router-link>
      </template>
    </a-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
interface ICrumb {
  name: string;
  to: string;
  disabled?: boolean;
}

defineProps<{
  items?: ICrumb[];
}>();
</script>

<style lang="scss" scoped>
.breadcrumbs {
  display: inline-block;
  margin-left: 20px;
  padding: 5px 20px;
  background-color: #fff;
  border-radius: 20px 20px 0 0;

  & :deep(.ant-breadcrumb a) {
    color: #666;
    font-size: 16px;

    &:hover {
      color: $main-grey;
    }
  }

  & :deep(.ant-breadcrumb a.--disabled) {
    color: $main-green;
    pointer-events: none;
  }
}
</style>
