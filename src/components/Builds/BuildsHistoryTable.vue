<script setup lang="ts">
import { IHistoryItem } from "@/API/models/users";
import { IColumnKey } from "./types";
import { COLUMNS } from "./constants";
import BuildsHistoryTableRow from "./BuildsHistoryTableRow.vue";
import TableDatePicker from "../Table/TableDatePicker.vue";
import AppPagination from "../UI/AppPagination.vue";

defineProps<{
  historyItems: IHistoryItem[];
  isShowMore: boolean;
  isBuildsLength: boolean;
}>();
const emit = defineEmits<{
  (e: "update", value: boolean): void;
  (e: "load-more", value: boolean): void;
}>();
const modelValue = defineModel();
</script>
<template>
  <a-table
    :columns="COLUMNS"
    :data-source="historyItems"
    class="history-table"
    :pagination="false"
  >
    <template #headerCell="{ column }: { column: IColumnKey }">
      <template v-if="['user', 'install_id', 'ip'].includes(column?.key)">
        <a-input
          v-model:value="modelValue[column.key]"
          :placeholder="column.title"
          class="search"
          @input="emit('update', true)"
        />
      </template>
      <template v-if="column?.key === 'date'">
        <TableDatePicker
          v-model="modelValue[column.key]"
          :title="column.title"
          @change="emit('update', true)"
        />
      </template>
    </template>
    <template #bodyCell="{ column, record, index }">
      <BuildsHistoryTableRow :column="column" :record="record" :index="index" />
    </template>
    <template #footer>
      <AppPagination
        v-if="isShowMore && isBuildsLength"
        center
        @intersect="emit('load-more', false)"
      />
    </template>
  </a-table>
</template>
<style scoped lang="scss">
.history-table {
  overflow: auto;
  height: calc(100vh - 200px);
  @include custom-scroll(8px, 4px);

  .search {
    border: none;
    border-bottom: 1px solid #e3e3e3;
    box-shadow: none;
    color: #999;
  }
  :deep(th) {
    color: #999;
  }
  :deep(.ant-table-cell) {
    padding: 10px;
    &:nth-child(n + 3) {
      min-width: 200px;
      max-width: 350px;
    }
    &:nth-child(n + 6) {
      width: auto;
      min-width: 100px;
    }
  }
}
</style>
