<template>
  <div>
    <a-table
      :columns="COLUMNS"
      :data-source="items"
      class="caches-table"
      :loading="isLoading"
      :pagination="false"
    >
      <template #headerCell="{ column }">
        <div
          class="caches-table__header-cell"
          :class="`caches-table__cell_${column.class}`"
        >
          <template v-if="column.key === 'show-remove'">
            <AppCloseIcon v-if="isShowRemove" @click="emit('clear')" />
          </template>

          <template v-if="column.key === 'id'">
            <AppSelect
              v-if="queryId"
              v-model:value="modelValue[column.key]"
              :items="queryId"
              placeholder="id"
              color="#999999"
              clearable
              mode="multiple"
              size="small"
              :max-tag-count="1"
              @change="emit('upload')"
            />
            <a-input
              v-else
              v-model:value="modelValue[column.key]"
              :placeholder="column.title"
              class="caches-table__header-input"
              allow-clear
              :bordered="false"
              :type="'number'"
              @input="emit('upload')"
            />
          </template>
          <template
            v-else-if="['name', 'host', 'ip_address'].includes(column.key)"
          >
            <a-input
              v-model:value="modelValue[column.key]"
              :placeholder="column.title"
              class="caches-table__header-input"
              :bordered="false"
              :type="
                column.key === 'id' || column.key === 'ip_address'
                  ? 'number'
                  : 'text'
              "
              @input="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'type'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="types"
              class="caches-table__select"
              color="#999999"
              item-name="shortname"
              clearable
              placeholder="cache type"
              @change="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'builds_count'">
            <TableRange
              v-model="modelValue[column.key]"
              :title="column.title"
              from="from"
              to="to"
              @input="emit('upload')"
            >
              <template #icon>
                <FilterCogIcon
                  class="select-icon"
                  :class="{
                    active:
                      modelValue[column.key] &&
                      modelValue[column.key].from &&
                      modelValue[column.key].to,
                  }"
                />
              </template>
            </TableRange>
          </template>

          <template v-else-if="column.key === 'size'">
            <TableRange
              v-model="modelValue[column.key]"
              :title="column.title"
              @input="emit('upload')"
            >
              <template #icon>
                <FilterCogIcon
                  class="select-icon"
                  :class="{
                    active:
                      modelValue[column.key] &&
                      modelValue[column.key].from &&
                      modelValue[column.key].to,
                  }"
                />
              </template>
            </TableRange>
          </template>

          <template
            v-else-if="
              column.key === 'created_at' || column.key === 'updated_at'
            "
          >
            <TableDatePicker
              v-model="modelValue[column.key]"
              :title="column.title"
              @change="emit('upload')"
            >
              <template #icon>
                <FilterCogIcon
                  class="select-icon"
                  :class="{
                    active:
                      modelValue[column.key]?.length === 2 &&
                      modelValue[column.key][0] &&
                      modelValue[column.key][1],
                  }"
                />
              </template>
            </TableDatePicker>
          </template>

          <template v-else-if="column.key === 'status'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="statuses"
              class="caches-table__select"
              color="#999999"
              placeholder="status"
              clearable
              item-value="value"
              item-name="label"
              @change="emit('upload')"
            />
          </template>

          <template v-else>
            {{ column.title }}
          </template>
        </div>
      </template>
      <template #bodyCell="{ column, record }">
        <CachesRow :column="column" :record="record" />
      </template>

      <template #footer="{}">
        <AppPagination
          v-if="isShowMore && isCachesLength"
          center
          @intersect="emit('upload', false)"
        />
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppPagination from "@/components/UI/AppPagination.vue";
import AppSelect from "@/components/UI/AppSelect.vue";
import TableDatePicker from "@/components/Table/TableDatePicker.vue";
import TableRange from "@/components/Table/TableRange.vue";
import AppCloseIcon from "@/components/UI/AppCloseIcon.vue";
import CachesRow from "@/components/Caches/CachesRow.vue";
import { FilterCogIcon } from "mdi-vue3";
import { ICache } from "@/API/models/caches";
import { useRoute } from "vue-router";

const props = defineProps<{
  isLoading: boolean;
  isShowRemove: number;
  items: ICache[];
  params: {
    total: number;
    limit: number;
    page: number;
  };
  types: string[];
  statuses: {
    id: number;
    label: string;
    value: string;
  }[];
}>();
const route = useRoute();

const emit = defineEmits<{
  (e: "upload", value?: boolean): void;
  (e: "clear"): void;
}>();
const modelValue = defineModel();

const COLUMNS = [
  { title: "", key: "show-remove", class: "" },
  { title: "ID", key: "id", class: "id" },
  { title: "name/description", key: "name", class: "name" },
  { title: "host", key: "host", class: "host" },
  { title: "IP", key: "ip_address", class: "ip-address" },
  { title: "cache type", key: "type", class: "type" },
  { title: "free space", key: "free_space", class: "free-space" },
  { title: "current/depth", key: "depth", class: "depth" },
  { title: "pre-created users", key: "pre_create_users", class: "pre-create-users",},
  { title: "last commit", key: "last_commit", class: "last-commit" },
  { title: "cache online date", key: "ping_at", class: "ping-at" },
  { title: "token", key: "token", class: "token" },
  { title: "error logs", key: "error_logs", class: "error-logs" },
  { title: "status", key: "status", class: "status" },
  { title: "", key: "edit", class: "edit" },
];

const isShowMore = computed(
  () => props.params.limit * props.params.page < props.params.total
);
const isCachesLength = computed(() => props.items?.length);

const queryId = computed(() => {
  if (route.query.id) {
    return Array.isArray(route.query.id)
      ? route.query.id
      : Array.isArray(JSON.parse(route.query.id))
        ? JSON.parse(route.query.id)
        : null
  }
  return null
})
</script>

<style lang="scss" scoped>
.caches-table {
  padding-right: 38px;
  height: calc(100vh - 167px);
  overflow: auto;
  @include custom-scroll();

  & :deep(.ant-table-footer) {
    background-color: transparent;
  }

  & :deep(.ant-table-cell) {
    background-color: transparent;
    border: none;
    padding: 9px;

    &:before {
      content: none !important;
    }
  }

  & :deep(.ant-table-thead) {
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 1;
    box-shadow: 0 2px 1px #e3e3e3;
  }

  & :deep(.ant-table-cell.status) {
    padding-left: 0;
  }

  & :deep(.ant-table-cell.id) {
    max-width: 90px;
    min-width: 90px;
  }

  & :deep(.ant-table-cell.name) {
    width: 250px;
    padding-right: 20px;
  }

  & :deep(.ant-table-cell.token) {
    width: 40px;
  }

  & :deep(th.ant-table-cell) {
    color: #999;
  }

  & :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: transparent;
  }

  &__select {
    & :deep(.ant-select-selector) {
      font-size: 14px;
    }
  }

  &__header-input {
    padding-left: 0;
    padding-bottom: 0;
    border-bottom: 1px solid #e3e3e3;
  }

  &__header-cell {
    white-space: nowrap;
  }

  &__cell {
    &_error-logs {
      text-align: center;
    }
  }
}
</style>
