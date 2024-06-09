<template>
  <section class="branches">
    <div class="main-content branches__content">
      <div class="branches-header">
        <h2
          class="branches__title"
          style="cursor: pointer"
          @click="
            () => {
              clearFields();
              getBranches();
            }
          "
        >
          branches
          <a-tooltip
            placement="right"
            title="sync all roles & their descriptions with Access"
          >
            <a-button type="text" :class="{ 'sync-loading': isSyncLoading }">
              <SyncIcon class="branches__reload" @click="openConfirm" />
            </a-button>
          </a-tooltip>
        </h2>
        <div class="branches-header__inner">
          <TableSelect
            v-model="filterParams.activeSortId"
            :list="LISTS.sort"
            always-show-shevron
            @change="getBranches"
          />
          <a-button type="primary" class="branches-header__btn">
            <router-link to="/branch/create">create new branch</router-link>
          </a-button>
        </div>
      </div>

      <div class="branches__inner">
        <BranchesTable
          v-model="search"
          :is-loading="isLoading"
          :storages="storages"
          :projects="projects"
          :branches="branches"
          :caches="caches"
          :params="branchesParams"
          :get-branches="getBranches"
          :clear-fields="clearFields"
          :is-show-remove="Object.keys(route.query).length"
          :storages-branches="storagesBranches"
          @upload="getBranches"
          @search-project="searchProject = $event"
        />
      </div>
    </div>

    <a-modal
      v-model:visible="isShowConfirm"
      class="custom-modal"
      :closable="false"
      cancel-text="cancel"
      ok-text="sync"
      centered
      width="540px"
      @ok="onSync"
    >
      <h3>
        confirm sync of ALL active & archived branches / roles with Access
      </h3>
      <ol type="a" class="branches-confirm__list">
        <li>new branches/roles with status 'active' will be <b>created</b></li>
        <li>
          descriptions of existing role names of 'active' branches will be
          <b>updated</b>
        </li>
        <li>
          branches/roles with status 'archive' will be <b>removed</b> from
          Access
        </li>
      </ol>
    </a-modal>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SyncIcon } from 'mdi-vue3';
import { notification } from 'ant-design-vue';
import utils from '@/utils';
import { IStorage, IStorageBranch } from '@/API/models/storages';
import { IBranch, IBranchSearch } from '@/API/models/branches';
import { IProject } from '@/API/models/projects';
import { ICache } from '@/API/models/caches';
import BranchesTable from '@/components/Branches/BranchesTable.vue';
import TableSelect from '@/components/Table/TableSelect.vue';
import { getAdminBranches } from '@/API/branches';
import { syncRoles } from '@/API/access';
import { getAdminStorages, getAdminStoragesBranches } from '@/API/storages';
import { getAdminProjects } from '@/API/projects';
import { getAdminCaches } from '@/API/caches';

const route = useRoute();
const router = useRouter();

const LISTS = {
  sort: [
    {
      id: 0,
      title: 'project id: 1 first',
      value: { 'sort[property]': 'id', 'sort[direction]': 'asc' },
    },
    {
      id: 1,
      title: 'creation date: new first',
      value: { 'sort[property]': 'created_at', 'sort[direction]': 'desc' },
    },
    {
      id: 2,
      title: 'creation date: old first',
      value: { 'sort[property]': 'created_at', 'sort[direction]': 'asc' },
    },
    {
      id: 3,
      title: 'size: heavy first',
      value: { 'sort[property]': 'size', 'sort[direction]': 'desc' },
    },
  ],
};
const isLoading = ref(true);
const isShowConfirm = ref(false);
const isSyncLoading = ref(false);
const branchesParams = reactive({
  total: 0,
  limit: 15,
  page: 1,
});
const storages = ref<IStorage[]>([]);
const branches = ref<IBranch[]>([]);
const projects = ref<IProject[]>([]);
const caches = ref<ICache[]>([]);
const storagesBranches = ref<IStorageBranch[]>([]);
const timeout = ref<any>(null);
const timeoutBranch = ref<any>(null);
const searchProject = ref<string | undefined>('');
const search: IBranchSearch = reactive({
  id: null,
  name: '',
  is_manual_uploader: null,
  role_name: '',
  storage_id: null,
  project_id: undefined,
  storage_time: null,
  status: null,
  builds_count: {
    from: '',
    to: '',
  },
  size: {
    from: '',
    to: '',
    unit: 2,
  },
  loader: null,
  cacheStorages: undefined,
});
const filterParams = reactive({
  activeSortId: 0,
});
const openConfirm = () => {
  isShowConfirm.value = true;
};

const onSync = async () => {
  isShowConfirm.value = false;
  isSyncLoading.value = true;

  try {
    await syncRoles();
    notification.success({
      message: 'delivery roles have been successfully synced with Access',
    });
  } catch (e) {
  } finally {
    isSyncLoading.value = false;
  }
};

const getBranches = async (isReload: boolean = true): Promise<void> => {
  clearTimeout(timeout.value);
  timeout.value = setTimeout(async () => {
    if (isReload) {
      branchesParams.page = 1;
      branches.value = [];
    } else {
      branchesParams.page++;
    }

    isLoading.value = true;
    const { sort, filters } = getParams();

    try {
      const { items, total } = await getAdminBranches({
        with: ['storage', 'builder', 'cacheStorages'],
        limit: branchesParams.limit,
        page: branchesParams.page,
        ...sort,
        filters,
      });

      branches.value = branches.value.concat(items);
      branchesParams.total = total;
    } catch (e) {
    } finally {
      isLoading.value = false;
    }
  }, 800);
};

const getStorages = async (): Promise<void> => {
  try {
    clearTimeout(timeoutBranch.value);
    timeoutBranch.value = setTimeout(async () => {
      const { items } = await getAdminStorages({ limit: -1 });
      storages.value = items;
    }, 500);
  } catch (e) {}
};

const getProjects = async () => {
  try {
    if (searchProject.value) {
      clearTimeout(timeoutBranch.value);
      timeoutBranch.value = setTimeout(async () => {
        const { items } = await getAdminProjects({
          limit: 15,
          name: searchProject.value,
          is_delivery: 1,
        });
        projects.value = items;
      }, 500);
    } else if (route.query?.project_id) {
      clearTimeout(timeoutBranch.value);
      timeoutBranch.value = setTimeout(async () => {
        const { items } = await getAdminProjects({
          limit: 15,
          ids: [route.query?.project_id] as string[],
          is_delivery: 1,
        });
        projects.value = items;
      }, 500);
    } else {
      const { items } = await getAdminProjects({ limit: 15, is_delivery: 1 });
      projects.value = items;
    }
  } catch (e) {}
};

const getParams = () => {
  const params = {
    sort: {},
    filters: [],
  };

  const queryData = {};

  if (search && Object.keys(search).length) {
    Object.keys(search).forEach((key) => {
      if (key === 'id' && search[key]) {
        const val =
          typeof search[key] === 'string' ? search[key].trim() : search[key];
        params.filters.push({ column: key, value: val, operator: '=' });
        queryData[key] = Array.isArray(val) ? JSON.stringify(val) : val;
      } else if (
        [
          'status',
          'storage_id',
          'project_id',
          'storage_time',
          'loader',
          'is_manual_uploader',
        ].includes(key) &&
        search[key]
      ) {
        const val =
          typeof search[key] === 'string' ? search[key].trim() : search[key];
        params.filters.push({ column: key, value: val, operator: '=' });
        queryData[key] = val;
      } else if (['name', 'role_name'].includes(key) && search[key]) {
        params.filters.push({
          column: key,
          value: search[key].trim(),
          operator: 'like_both',
        });
        queryData[key] = search[key].trim();
      } else if (
        key === 'size' &&
        search[key] &&
        search[key]?.from &&
        search[key]?.to
      ) {
        params.filters.push({
          column: key,
          value: search[key].from * Math.pow(1024, search[key].unit),
          operator: '>=',
        });
        params.filters.push({
          column: key,
          value: search[key].to * Math.pow(1024, search[key].unit),
          operator: '<=',
        });
        queryData[key] = JSON.stringify(search[key]);
      } else if (key === 'builds_count' && search[key] && search[key]?.from) {
        params.filters.push({
          column: key,
          value: search[key].from,
          operator: '>=',
        });
        params.filters.push({
          column: key,
          value: search[key].to,
          operator: '<=',
        });
        queryData[key] = JSON.stringify(search[key]);
      } else if (key === 'cacheStorages' && search[key]?.length) {
        params.filters.push({
          column: 'cacheStorages.id',
          value: search.cacheStorages,
          operator: '!=@',
        });
        queryData[key] = JSON.stringify(search[key]);
      }
    });
  }

  params.sort = LISTS.sort[filterParams.activeSortId].value;

  if (filterParams.activeSortId) {
    queryData['sort[property]'] =
      LISTS.sort[filterParams.activeSortId].value['sort[property]'];
    queryData['sort[direction]'] =
      LISTS.sort[filterParams.activeSortId].value['sort[direction]'];
  }

  setQuery(queryData);

  return { sort: params.sort, filters: JSON.stringify(params.filters) };
};

const getCaches = async () => {
  try {
    const { items } = await getAdminCaches({
      limit: -1,
      filters: JSON.stringify([
        { column: 'type', value: 'public', operator: '!=' },
      ]),
    });
    caches.value = items;
  } catch (e) {}
};
const getStoragesBranches = async () => {
  const { items } = await getAdminStoragesBranches({ limit: -1, with: ['storage'] });
  storagesBranches.value = items;
};

const setQuery = (params: { [key: string]: string }) => {
  const { query } = route;

  const isMatchLength =
    Object.keys(params).length === Object.keys(query).length;
  const isMatchValues = Object.keys(params).every(
    (key) => query[key] && query[key] === String(params[key])
  );
  if (!isMatchLength || !isMatchValues) {
    router.replace({ query: params });
  }
};

const parseQuery = (query: { [key: string]: string }) => {
  ['status', 'name', 'role_name', 'is_manual_uploader'].forEach((key) => {
    if (query[key] && typeof query[key] === 'string') {
      search[key] = query[key]?.trim();
    } else if (query[key]) {
      search[key] = query[key];
    }
  });

  if (query.id) {
    if (Array.isArray(query.id)) {
      search.id = query.id;
    } else {
      const val = JSON.parse(query.id);
      search.id = Array.isArray(val) ? val : query.id;
    }
  }

  if (
    query.storage_time &&
    utils.storageTime.some((item) => item === query.storage_time)
  ) {
    search.storage_time = query.storage_time;
  }

  if (query.size) {
    const data = JSON.parse(query.size);
    if (typeof data === 'object') {
      search.size.from = data.from && !isNaN(data.from) ? data.from : '';
      search.size.to = data.to && !isNaN(data.to) ? data.to : '';
      search.size.unit = data.unit && !isNaN(data.unit) ? data.unit : 2;
    }
  }

  if (query.builds_count) {
    const data = JSON.parse(query.builds_count);
    if (typeof data === 'object') {
      search.builds_count.from =
        data.from && !isNaN(data.from) ? data.from : '';
      search.builds_count.to = data.to && !isNaN(data.to) ? data.to : '';
    }
  }

  if (query.project_id) {
    getProjects();
    search.project_id = +query.project_id;
  }

  if (query.storage_id) {
    search.storage_id = +query.storage_id;
    getStorages();
  }

  if (query.cacheStorages) {
    const storages = JSON.parse(query.cacheStorages);
    if (Array.isArray(storages) && storages.length) {
      search.cacheStorages = storages;
    }
  }

  if (query['sort[property]'] && query['sort[direction]']) {
    const idx = LISTS.sort.findIndex(
      (item) =>
        item.value['sort[property]'] === query['sort[property]'].trim() &&
        item.value['sort[direction]'] === query['sort[direction]'].trim()
    );
    if (idx > -1) filterParams.activeSortId = idx;
  }
};

const clearFields = () => {
  filterParams.activeSortId = 0;

  search.id = null;
  search.name = '';
  search.role_name = '';
  search.storage_id = null;
  search.project_id = undefined;
  search.storage_time = null;
  search.status = null;
  search.builds_count.from = '';
  search.builds_count.to = '';
  search.size.from = '';
  search.size.to = '';
  search.size.unit = 2;
  search.is_manual_uploader = null;
  search.cacheStorages = undefined;
};

onMounted(async () => {
  document.body.classList.add('hide-scroll');
  document.querySelector('html')?.classList.add('hide-scroll');

  await Promise.all([
    getProjects(),
    getStorages(),
    getCaches(),
    getStoragesBranches(),
  ]).finally(async () => {
    const { query } = route;
    if (Object.keys(query).length) {
      parseQuery(Object.create(query));
    }

    await getBranches();
  });
});

onBeforeUnmount(() => {
  clearTimeout(timeout.value);
  document.body.classList.remove('hide-scroll');
  document.querySelector('html')?.classList.remove('hide-scroll');
});
watch(searchProject, getProjects);
</script>

<style lang="scss" scoped>
.branches {
  &__content {
    padding-bottom: 0;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;

    &__inner {
      display: flex;
      align-items: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    &__btn {
      background-color: #1565c0;
      border-color: #1565c0;
      padding: 5px 14px;
      border-radius: 10px;
      font-size: 16px;
      line-height: 1;
    }
  }

  &__inner {
    position: relative;
    margin-right: -38px;
  }

  &__title {
    display: flex;
    gap: 10px;
    align-items: center;
    @include Font-24-30-700;

    & :deep(.ant-btn) {
      padding: 0 2px;
      line-height: 1;
    }
  }

  &__reload {
    width: 20px;
    height: 20px;
  }

  .sync-loading {
    pointer-events: none;

    .branches__reload {
      fill: gray;
      animation: loading 1.2s linear infinite reverse;
    }
  }

  &-confirm__list {
    margin-bottom: 0;
    padding-left: 15px;

    li {
      font-size: 16px;
    }
  }
}

@keyframes loading {
  100% {
    transform: rotate(360deg);
  }
}
</style>
