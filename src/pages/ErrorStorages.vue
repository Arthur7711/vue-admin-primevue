<script setup lang="ts">
import { ref } from "vue";
import DropdownIcon from '@/components/icons/DropdownIcon.vue'
import ErrorTable from '@/components/ErrorPage/table/ErrorTable.vue'

const options = [
  { id: "App\\Models\\CacheStorage", title: "cache storages" },
  { id: "App\\Models\\ProxyStorage", title: "proxy storages" },
  { id: "", title: "all" },
];
const selectedOption = ref("");
document.querySelector("body")?.addEventListener("scroll", () => {
  if (isOpen.value) {
    isOpen.value = false;
  }
});
const clearFilters = () => {
  selectedOption.value = "";
};
const isOpen = ref(false);
</script>
<template>
  <div class="main-content">
    <div class="head">
      <h2 class="title" @click="clearFilters">error logs</h2>
      <a-select
        v-model:value="selectedOption"
        :bordered="false"
        :open="isOpen"
        class="error_page"
        dropdown-class-name="error_dropdown"
        @change="() => (isOpen = !isOpen)"
        @click="() => (isOpen = !isOpen)"
      >
        <template #suffixIcon>
          <DropdownIcon
            :style="{ transform: !isOpen ? 'rotate(180deg)' : '' }"
          />
        </template>
        <a-select-option
          v-for="item in options"
          :value="item.id"
          :key="item.id"
          >
          {{ item.title }}
        </a-select-option>
      </a-select>
    </div>
    <ErrorTable :filter-by="selectedOption" />
  </div>
</template>
<style scoped lang="scss">
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .title {
    font-size: 24px;
    font-weight: 700;
    line-height: 30px;
    color: #1a1a1a;
  }
}
:deep(.ant-select-selection-item) {
  min-width: 100px;
}
:global(.error_dropdown) {
  padding: 5px 10px;
  border-radius: 7px !important;
  width: auto !important;
}
:global(.error_dropdown .ant-select-item-option) {
  border-radius: 10px !important;
  margin-bottom: 5px;
}
:global(.error_dropdown .ant-select-item-option-selected) {
  background: rgba(102, 102, 102, 0.2) !important;
}
</style>
