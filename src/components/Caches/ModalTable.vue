<script setup lang="ts">
import { ICacheUser } from "@/API/models/caches";
import { format } from "date-fns";
import { ArrowTopRightIcon } from "mdi-vue3";

defineProps<{ tableValues: ICacheUser[] }>();
const COLUMNS = [
  { title: "id", key: "id", class: "id" },
  { title: "login", key: "login", class: "login" },
  { title: "build id", key: "build_id", class: "build_id" },
  { title: "created at", key: "created_at", class: "created_at" },
  { title: "updated at", key: "updated_at", class: "updated_at" },
];
</script>
<template>
  <a-table
    class="modal-table"
    :columns="COLUMNS"
    :data-source="tableValues"
    :pagination="false"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'id'"> {{ record?.id }} </template>
      <template v-else-if="column.key === 'login'">
        {{ record?.login }}
      </template>
      <template v-else-if="column.key === 'build_id'">
        <router-link
          v-if="record?.build"
          :to="`/builds?id=${record?.build_id}`"
          class="caches-table__link"
        >
          {{ record?.build_id }}
          <ArrowTopRightIcon class="arrow-top-right" />
        </router-link>
        <span v-else>{{ record?.build_id }}</span>
      </template>
      <template v-else-if="column.key === 'created_at'">
        {{
          record?.created_at
            ? format(new Date(record?.created_at), "yyyy-MM-dd, HH:mm")
            : ""
        }}
      </template>
      <template v-else-if="column.key === 'updated_at'">
        {{
          record?.updated_at
            ? format(new Date(record?.updated_at), "yyyy-MM-dd, HH:mm")
            : ""
        }}
      </template>
    </template>
  </a-table>
</template>
<style scoped lang="scss">
.modal-table {
  max-height: 500px;
  overflow-y: auto;
}
:deep(th.ant-table-cell) {
  background: none !important;
  border: none;
  color: #999999;
  font-weight: 400;
  white-space: nowrap;
}
:deep(.ant-table-cell) {
  border: none;
  padding: 10px 0;
}
</style>
