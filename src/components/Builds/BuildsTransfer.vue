<script setup lang="ts">
import { getAdminBuilds } from '@/API/builds';
import { IBuild } from '@/API/models/builds';
import { getAdminStorages } from '@/API/storages';
import { ref, reactive, watch, computed } from 'vue';
import { getAdminBranches } from '@/API/branches';
import AppSelect from '@/components/UI/AppSelect.vue';
import AppCheckbox from '@/components/UI/AppCheckbox.vue';
import { IDataTransfer } from './types';

const props = defineProps<{
  updateModal: boolean;
}>();
const emit = defineEmits<{
  (e: 'selected-items', value: number[]): void;
  (e: 'selected-id', value: number): void;
}>();

const columns = [
  {
    title: '',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '',
    dataIndex: 'build',
    key: 'build',
  },
  {
    title: '',
    dataIndex: 'branch',
    key: 'branch',
  },
  {
    title: '',
    dataIndex: 'storage',
    key: 'storage',
  },
];
const defaultFilters = [
  {
    column: 'status',
    value: 'seeding',
    operator: '=',
  },
  {
    column: 'deleted_at',
    value: null,
  },
];
const searches = reactive({
  branch: '',
  build: '',
});
const dataSource = ref<IDataTransfer[]>([]);
const timeoutTransfer = ref<ReturnType<typeof setTimeout> | null>(null);
const searchStorage = ref('');
const selectedStorage = ref<number | undefined>(undefined);
const selectedBranch = ref<number | undefined>(undefined);
const selectedBuild = ref<number | undefined>(undefined);
const storages = ref<{ id: number; shortname: string }[]>([]);
const branches = ref<{ id?: number; name?: string }[]>([]);
const builds = ref<{ id?: number; name?: string }[]>([]);
const buildList = ref<IBuild[]>([]);
const requestBuilds = computed(
  () => dataSource.value?.filter((el) => el.status)
);

const getBranches = async (): Promise<void> => {
  try {
    const filters = searches.branch
      ? JSON.stringify([
          {
            column: 'name',
            value: searches.branch.trim(),
            operator: 'like_both',
          },
        ])
      : undefined;
    if (timeoutTransfer.value) clearTimeout(timeoutTransfer.value);
    timeoutTransfer.value = setTimeout(async () => {
      const { items } = await getAdminBranches({
        limit: 5,
        filters,
      });
      branches.value = items;
    }, 500);
  } catch (e) {}
};
const getBuilds = async (update?: boolean) => {
  if (update) {
    dataSource.value = [];
  }
  const filters = searches.build
    ? JSON.stringify([
        {
          column: 'name',
          value: searches.build.trim(),
          operator: 'like_both',
        },
        ...defaultFilters,
      ])
    : JSON.stringify(defaultFilters);
  const { items } = await getAdminBuilds({
    with: ['branch', 'storage'],
    filters,
    limit: 15,
  });
  builds.value = items;
  buildList.value = items;
  // dataSource.value = items?.map((el) => ({
  //   status: false,
  //   branch: el?.branch?.name,
  //   id: el.id,
  //   storage: el?.storage?.shortname || '',
  //   build: el?.name,
  // }));
};
const getStorages = async () => {
  try {
    const filters = [{ column: 'status', value: 'active', operator: '=' }];

    if (searchStorage.value?.trim())
      filters.push({
        column: 'name',
        value: searchStorage.value.trim(),
        operator: 'like_both',
      });

    const { items } = await getAdminStorages({
      limit: -1,
      filters: JSON.stringify(filters),
    });
    storages.value = items.map((el) => ({
      id: el.id,
      shortname: el.shortname,
    }));
  } catch (error) {
    return error;
  }
};

watch(
  () => props.updateModal,
  async () => {
    if (props.updateModal) {
      getStorages();
      getBranches();
      getBuilds(true);
    }
    selectedStorage.value = undefined;
    selectedBranch.value = undefined;
    selectedBuild.value = undefined;
  },
  { immediate: true }
);
watch(
  () => searches.branch,
  () => {
    if (timeoutTransfer.value) clearTimeout(timeoutTransfer.value);
    timeoutTransfer.value = setTimeout(getBranches, 800);
  }
);
watch(
  () => searches.build,
  () => {
    if (timeoutTransfer.value) clearTimeout(timeoutTransfer.value);
    timeoutTransfer.value = setTimeout(getBuilds, 800);
  }
);
watch(selectedBuild, () => {
  const selectedItem: IBuild | undefined = selectedBuild.value
    ? buildList.value.find((el) => el.id === Number(selectedBuild.value))
    : undefined;
  if (selectedItem) {
    if (!dataSource.value?.find((el) => el.id === selectedItem.id)) {
      dataSource.value?.push({
        status: true,
        branch: selectedItem?.branch?.name,
        id: selectedItem.id,
        storage: selectedItem?.storage?.shortname || '',
        build: selectedItem?.name,
      });
    }
    setTimeout(() => {
      selectedBuild.value = undefined;
    }, 0);
  }
});
watch(selectedBranch, async () => {
  if (selectedBranch.value) {
    const { items } = await getAdminBuilds({
      with: ['branch', 'storage'],
      limit: -1,
      filters: JSON.stringify([
        {
          column: 'branch_id',
          value: selectedBranch.value,
          operator: '=',
        },
        ...defaultFilters,
      ]),
    });
    items.forEach((el) => {
      if (!dataSource.value?.find((elem) => elem.id === el.id))
        dataSource.value?.push({
          status: true,
          branch: el?.branch?.name,
          id: el.id,
          storage: el?.storage?.shortname || '',
          build: el?.name,
        });
    });
    setTimeout(() => {
      selectedBranch.value = undefined;
    }, 0);
  }
});
watch(
  requestBuilds,
  () => {
    emit('selected-items', requestBuilds.value?.map((el) => el.id));
  },
  { immediate: true }
);
watch(searchStorage, () => {
  if (timeoutTransfer.value) clearTimeout(timeoutTransfer.value);
  timeoutTransfer.value = setTimeout(getStorages, 800);
});
watch(selectedStorage, () => {
  if (selectedStorage.value) emit('selected-id', selectedStorage.value);
});
</script>
<template>
  <div class="transfer-modal">
    <h1>transfer builds</h1>
    <div class="transfer-modal__searchbox">
      <AppSelect
        v-model:value="selectedBranch"
        :items="branches"
        class="transfer-storage"
        color="#999999"
        item-name="name"
        item-value="value"
        clearable
        max-width="150px"
        placeholder="search branch"
        show-search
        :class="'search-inline'"
        @search="searches.branch = $event"
      />
      <AppSelect
        v-model:value="selectedBuild"
        :items="builds"
        class="transfer-storage"
        color="#999999"
        item-name="name"
        item-value="value"
        clearable
        max-width="150px"
        placeholder="search build"
        show-search
        :class="'search-inline'"
        @search="searches.build = $event"
      />
    </div>
    <a-table
      class="transfer-table"
      :data-source="dataSource"
      :columns="columns"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <AppCheckbox v-if="column.key === 'status'" v-model="record.status" />
      </template>
    </a-table>
    <div class="storage-info">
      <span
        >transfer {{ requestBuilds?.length }}
        {{ requestBuilds?.length > 1 ? 'builds' : 'build' }} to</span
      >
      <AppSelect
        v-model:value="selectedStorage"
        :items="storages"
        class="transfer-storage"
        color="#999999"
        item-name="shortname"
        item-value="id"
        clearable
        max-width="150px"
        placeholder="select storage"
        show-search
        bordered
        @search="searchStorage = $event"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.transfer-modal {
  h1 {
    font-size: 24px;
    font-weight: 400;
    line-height: 30px;
    color: #1565c0;
  }
  &__searchbox {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 24px;
    &:deep(input) {
      width: 120px;
      border: none;
      border-bottom: 1px solid #e3e3e3;
      box-shadow: none;
    }
  }
  .transfer-table {
    margin-top: 16px;
    overflow: auto;
    max-height: 40vh;
    @include custom-scroll(6px);

    &:deep(.ant-table-cell) {
      border: none !important;
      padding: 6px 3px;
      height: 20px;
      font-size: 14px;
      min-width: 30px;
      white-space: none;
      text-wrap: nowrap;
      overflow-x: hidden;
      max-width: 200px;
      &:nth-child(3) {
        &:before {
          position: absolute;
          content: '';
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) calc(100% - 40px),
            rgba(255, 255, 255, 1) 100%
          );
          pointer-events: none;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
      }
    }
    &:deep(thead) {
      display: none;
    }
  }
  .storage-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
    &:deep(.ant-select-selector) {
      border-radius: 10px;
      height: 40px;
      display: flex;
      align-items: center;
    }
  }
  &:deep(.search-inline) {
    border-bottom: 1px solid #e3e3e3;
  }
}
</style>
