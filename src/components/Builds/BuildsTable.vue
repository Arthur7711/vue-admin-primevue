<template>
  <div>
    <a-table
      :columns="COLUMNS"
      :data-source="builds"
      class="builds-table"
      :loading="loading"
      :pagination="false"
    >
      <template #headerCell="{ column }">
        <div
          class="builds-table__header-cell"
          :class="`builds-table__header-cell_${column.class}`"
        >
          <template v-if="column.key === 'show-remove'">
            <AppCloseIcon
              v-if="isShowRemove"
              @click="
                clearFields();
                getBuilds();
              "
            />
          </template>
          <template v-else-if="column.key === 'id'">
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
              class="builds-table__header-input"
              :allow-clear="column.key !== 'id'"
              :bordered="false"
              :type="column.key === 'id' ? 'number' : 'text'"
              @input="emit('upload')"
            />
          </template>

          <template
            v-else-if="['name', 'hash_id', 'role_name'].includes(column.key)"
          >
            <a-input
              v-model:value="modelValue[column.key]"
              :placeholder="column.title"
              class="builds-table__header-input"
              :allow-clear="column.key !== 'id'"
              :bordered="false"
              :type="column.key === 'id' ? 'number' : 'text'"
              @input="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'build_size'">
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

          <template v-else-if="column.key === 'status'">
            <TableSelect
              v-model="modelValue[column.key]"
              :title="column.title"
              :list="statusList"
              allow-clear
              hide-text
              item-value="icon"
              class="status"
              @change="emit('upload')"
            >
              <template #icon>
                <FilterCogIcon class="select-icon" />
              </template>
            </TableSelect>
          </template>

          <template v-else-if="column.key === 'branch_id'">
            <AppSelect
              v-if="branches"
              v-model:value="modelValue[column.key]"
              :items="branches"
              class="builds-table__select"
              placeholder="branch"
              show-search
              item-value="id"
              color="#999999"
              clearable
              @change="emit('upload')"
              @search="getSearch = $event"
            />
          </template>

          <template
            v-else-if="
              column.key === 'created_at' || column.key === 'expires_at'
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

          <template v-else-if="column.key === 'project_id'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="projects"
              class="builds-table__select"
              placeholder="project"
              show-search
              item-value="project_id"
              color="#999999"
              clearable
              min-width="100px"
              @change="emit('upload')"
              @search="getProjectSearch = $event"
            />
          </template>

          <template v-else-if="column.key === 'uploaded_by'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="buildsUploadedBy"
              class="builds-table__select"
              :placeholder="column.title"
              color="#999999"
              clearable
              @change="emit('upload')"
            />
          </template>

          <template v-else-if="column.title === 'storage_id'">
            <AppSelect
              v-model:value="modelValue[column.title]"
              :items="storages"
              class="builds-table__select"
              placeholder="storage"
              item-name="shortname"
              color="#999999"
              clearable
              @change="emit('upload')"
            />
          </template>

          <template v-else-if="column.key === 'is_permanent'">
            <AppSelect
              v-model:value="modelValue[column.key]"
              :items="PERMANENTS"
              class="builds-table__select"
              placeholder="is permanent"
              item-name="title"
              item-value="value"
              color="#999999"
              clearable
              @change="emit('upload')"
            />
          </template>

          <template v-else>{{ column.title }}</template>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <BuildsTableRow :column="column" :record="record" />
      </template>

      <template #footer="{}">
        <AppPagination
          v-if="isShowMore && isBuildsLength"
          center
          @intersect="emit('upload', false)"
        />
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FilterCogIcon } from 'mdi-vue3';
import AppPagination from '@/components/UI/AppPagination.vue';
import TableDatePicker from '@/components/Table/TableDatePicker.vue';
import TableRange from '@/components/Table/TableRange.vue';
import TableSelect from '@/components/Table/TableSelect.vue';
import BuildsTableRow from '@/components/Builds/BuildsTableRow.vue';
import AppSelect from '@/components/UI/AppSelect.vue';
import AppCloseIcon from '@/components/UI/AppCloseIcon.vue';
import { IStorage } from '@/API/models/storages';
import { IBranch } from '@/API/models/branches';
import { IBuild, IBuildStatus } from '@/API/models/builds';
import { IProject } from '@/API/models/projects';
import { useRoute } from 'vue-router';

const props = defineProps<{
  loading: boolean;
  isShowRemove: number;
  projects: IProject[];
  storages: IStorage[];
  branches: IBranch[];
  builds: IBuild[];
  params: {
    total: number;
    limit: number;
    page: number;
  };
  clearFields: () => void;
  getBuilds: (isReload?: boolean) => Promise<void>;
  buildsUploadedBy: string[];
  statusList: IBuildStatus[];
}>();
const modelValue = defineModel();
const emit = defineEmits<{
  (e: 'upload', value?: boolean): void;
  (e: 'search', value?: string): void;
  (e: 'search-project', value?: string): void;
}>();
const route = useRoute();
const getSearch = ref('');
const getProjectSearch = ref('');
const COLUMNS = [
  { title: '', key: 'show-remove', class: '' },
  { title: 'ID', key: 'id', class: 'id' },
  { title: 'name', key: 'name', class: 'name' },
  { title: 'hash', key: 'hash_id', class: 'hash' },
  { title: 'size', key: 'build_size', class: 'size' },
  { title: 'status', key: 'status', class: 'status' },
  { title: 'branch', key: 'branch_id', class: 'branch' },
  { title: 'created', key: 'created_at', class: 'created-at' },
  { title: 'storage_id', key: 'storage', class: 'storage' },
  { title: 'proxy', key: 'proxy', class: 'proxy' },
  { title: 'expires', key: 'expires_at', class: 'expires-at' },
  { title: 'is permanent', key: 'is_permanent', class: 'is-permanent' },
  { title: 'project', key: 'project_id', class: 'project' },
  { title: 'IP', key: 'ip', class: 'ip' },
  { title: 'hostname', key: 'hostname', class: 'hostname' },
  { title: 'uploaded by', key: 'uploaded_by', class: 'uploaded-by' },
  { title: 'downloads', key: 'downloads', class: 'downloads' },
  { title: '', key: 'edit', class: 'edit' },
];
const PERMANENTS = [
  { id: 1, title: 'is permanent', value: '1' },
  { id: 2, title: 'is not permanent', value: '0' },
];

const isBuildsLength = computed(() => props.builds?.length);
const isShowMore = computed(
  () => props.params.limit * props.params.page < props.params.total
);

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

watch(getSearch, () => {
  emit('search', getSearch.value);
});
watch(getProjectSearch, () => {
  emit('search-project', getProjectSearch.value);
});
</script>

<style lang="scss" scoped>
.builds-table {
  margin-right: -40px;
  padding-right: 38px;
  height: calc(100vh - 150px);
  overflow: auto;
  @include custom-scroll();
  @include Font-14-18-400;

  &:deep(.ant-select-selector) {
    border: none;
    border-bottom: 1px solid #e3e3e3;
    padding-bottom: 3px;
    box-shadow: none !important;
  }

  & :deep(.ant-table-footer) {
    background-color: transparent;
  }

  & :deep(.ant-table-thead) {
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 1;
    box-shadow: 0 2px 1px #e3e3e3;
    tr {
      .ant-select-selector {
        max-height: 30px;
      }
    }
  }

  & :deep(.ant-table-cell) {
    padding: 9px;
  }

  & :deep(thead) {
    th {
      padding: 0;
    }
  }

  & :deep(.ant-table-cell.id) {
    max-width: 90px;
    min-width: 90px;
  }

  & :deep(.ant-table-cell.hash) {
    width: 120px;
  }

  & :deep(.ant-table-cell.project),
  & :deep(.ant-table-cell.uploaded-by) {
    padding-left: 0;
  }

  & :deep(.ant-table-cell.status) {
    min-width: 128px;
    .ant-select-selector {
      border-bottom: none !important;
    }
  }

  & :deep(.ant-table-cell.size) {
    min-width: 85px;
  }

  &__select {
    & :deep(.ant-select-selector) {
      font-size: 14px;
    }
  }

  &__header-cell {
    white-space: nowrap;
    color: $main-grey;

    &_role {
      width: calc(100% - 32px);
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
  &:global(.select__dropdown .rc-virtual-list-holder) {
    max-height: 300px !important;
  }
}
.load-buttons {
  display: flex;
  justify-content: center;
  margin-top: 16px;

  & > * + * {
    margin-left: 16px;
  }
}

.select-icon {
  width: 13px;

  &.active {
    fill: $main-blue;
  }
}
</style>
