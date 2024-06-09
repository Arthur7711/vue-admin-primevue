<template>
  <div>
    <a-table
      :columns="COLUMNS"
      :data-source="branches"
      class="branches-table"
      :loading="isLoading"
      :pagination="false"
    >
      <template #headerCell="{ column }">
        <div
          class="branches-table__header-cell"
          :class="`branches-table__cell_${column.class}`"
        >
          <template v-if="column.key === 'show-remove'">
            <AppCloseIcon
              v-if="isShowRemove"
              @click="
                clearFields();
                getBranches();
              "
            />
          </template>
          <template v-else-if="column.key === 'id'">
            <AppSelect
              v-if="queryId"
              v-model:value="modelValue[column.key]"
              :items="queryId"
              class="branches-table__select"
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
              class="branches-table__header-input"
              :allow-clear="false"
              :bordered="false"
              :type="'number'"
              @input="emit('upload')"
            />
          </template>
          <template v-else-if="['name', 'role_name'].includes(column.key)">
            <a-input
              v-model:value="modelValue[column.key]"
              :placeholder="column.title"
              class="branches-table__header-input"
              allow-clear
              :bordered="false"
              :type="'text'"
              @input="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'is_manual_uploader'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="manualUploaders"
              class="branches-table__select"
              color="#999999"
              item-name="name"
              item-value="value"
              clearable
              max-width="80px"
              placeholder="manual"
              @change="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'storage_id'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="storages"
              class="branches-table__select"
              color="#999999"
              item-name="shortname"
              clearable
              max-width="130px"
              placeholder="storage"
              @change="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'storage_time'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="utils.storageTime"
              class="branches-table__select"
              clearable
              color="#999999"
              placeholder="storage time"
              @change="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'project_id'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="projects"
              class="branches-table__select"
              placeholder="project"
              item-value="project_id"
              color="#999999"
              clearable
              min-width="100px"
              show-search
              mode="multiple"
              :max-tag-count="1"
              @search="searchProject = $event"
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

          <template v-else-if="column.key === 'cacheStorages'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="caches"
              class="branches-table__select"
              color="#999999"
              placeholder="caches"
              clearable
              item-value="id"
              min-width="80px"
              item-name="name"
              mode="multiple"
              :max-tag-count="1"
              @change="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'status'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="utils.statusBranches"
              class="branches-table__select"
              color="#999999"
              placeholder="status"
              clearable
              item-value="value"
              item-name="label"
              @change="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'loader'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="utils.statusDeliveryBranches"
              class="branches-table__select"
              color="#999999"
              :placeholder="column.title"
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
        <BranchesRow :column="column" :record="record" :storages-branche="storagesBranches.filter((el) => el?.id === record.id)" />
      </template>
      <template #footer="{}">
        <AppPagination
          v-if="isShowMore && isBranchesLength"
          center
          @intersect="emit('upload', false)"
        />
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import utils from '@/utils';
import BranchesRow from '@/components/Branches/BranchesRow.vue';
import AppPagination from '@/components/UI/AppPagination.vue';
import AppSelect from '@/components/UI/AppSelect.vue';
import TableRange from '@/components/Table/TableRange.vue';
import AppCloseIcon from '@/components/UI/AppCloseIcon.vue';
import { IStorage, IStorageBranch } from '@/API/models/storages';
import { IBranch } from '@/API/models/branches';
import { IProject } from '@/API/models/projects';
import { ICache } from '@/API/models/caches';
import { FilterCogIcon } from 'mdi-vue3';
import { useRoute } from 'vue-router';

const props = defineProps<{
  isLoading: boolean;
  isShowRemove: number;
  storages: IStorage[];
  projects: IProject[];
  branches: IBranch[];
  caches: ICache[];
  storagesBranches: IStorageBranch[];
  params: {
    total: number;
    limit: number;
    page: number;
  };
  clearFields: () => void;
  getBranches: (isReload?: boolean) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: 'upload', value?: boolean): void;
  (e: 'search-project', value?: string): void;
}>();

const route = useRoute();
const modelValue = defineModel();
const searchProject = ref('');
const COLUMNS = [
  { title: '', key: 'show-remove', class: '' },
  { title: 'ID', key: 'id', class: 'id' },
  { title: 'name', key: 'name', class: 'name' },
  { title: 'manual build', key: 'is_manual_uploader', class: 'manual-build' },
  { title: 'storage', key: 'storage_id', class: 'storage-id' },
  { title: 'builds amount', key: 'builds_count', class: 'builds-amount' },
  { title: 'size', key: 'size', class: 'size' },
  { title: 'storage time', key: 'storage_time', class: 'storage-time' },
  { title: 'project', key: 'project_id', class: 'project-id' },
  { title: 'role name', key: 'role_name', class: 'role-name' },
  { title: 'token', key: 'token', class: 'token' },
  { title: 'delivery method', key: 'loader', class: 'delivery-method' },
  { title: 'caches', key: 'cacheStorages', class: 'caches' },
  { title: 'builder logs', key: 'builder', class: 'builder' },
  { title: 'status', key: 'status', class: 'status' },
  { title: '', key: 'edit', class: 'edit' },
];
const manualUploaders = [
  { id: 1, name: 'manual uploader', value: '1' },
  { id: 2, name: 'no manual uploader', value: '0' },
];

const isShowMore = computed(
  () => props.params.limit * props.params.page < props.params.total
);
const isBranchesLength = computed(() => props.branches?.length);

const queryId = computed(() => {
  if (route.query.id) {
    return Array.isArray(route.query.id)
      ? route.query.id
      : Array.isArray(JSON.parse(route.query.id))
        ? JSON.parse(route.query.id)
        : null;
  }
  return null;
});

watch(searchProject, () => {
  emit('search-project', searchProject.value);
});
</script>

<style lang="scss" scoped>
.branches-table {
  margin-right: -40px;
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
    max-height: 30px;
  }

  & :deep(.ant-table-cell.manual-build),
  & :deep(.ant-table-cell.storage-id),
  & :deep(.ant-table-cell.project-id),
  & :deep(.ant-table-cell.status),
  & :deep(.ant-table-cell.storage-time),
  & :deep(.ant-table-cell.caches),
  & :deep(.ant-table-cell.delivery-method) {
    padding-left: 0;
  }

  & :deep(.ant-table-cell.id) {
    width: 100px;
    min-width: 100px;
  }

  & :deep(.ant-table-cell.name) {
    width: 250px;
    padding-right: 20px;
  }

  & :deep(.ant-table-cell.token) {
    width: 40px;
  }

  & :deep(.ant-table-cell.role-name) {
    width: 150px;
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

    &:deep(.ant-input-borderless::placeholder) {
      color: #999;
    }
  }

  &__header-cell {
    white-space: nowrap;
  }

  & .branches-table__cell {
    &_storage-id {
      max-width: 150px;
    }
  }
}
</style>
