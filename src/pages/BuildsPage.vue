<template>
  <section class="builds">
    <div class="main-content builds__content">
      <div class="builds-header">
        <div class="title_container">
          <div
            class="page-title"
            style="cursor: pointer"
            @click="
              clearFields();
              getBuilds();
            "
          >
            builds
          </div>
          <a-button @click="() => (showTransferModal = true)"
            >transfer builds</a-button
          >
        </div>
        <div class="builds-sort-and-filter">
          <TableSelect
            v-model="filterParams.activeStatusId"
            :list="LISTS.statuses"
            always-show-shevron
            @change="getBuilds"
          />
          <TableSelect
            v-model="filterParams.activeSortId"
            :list="LISTS.sort"
            always-show-shevron
            @change="getBuilds"
          />
        </div>
      </div>

      <div class="builds__inner">
        <BuildsTable
          v-model="search"
          :projects="projects"
          :storages="storages"
          :branches="branches"
          :clear-fields="clearFields"
          :get-builds="getBuilds"
          :builds="builds"
          :loading="isLoading"
          :params="buildsParams"
          :is-show-remove="Object.keys(route.query).length"
          :status-list="statusList"
          :builds-uploaded-by="buildsUploadedBy"
          @upload="getBuilds"
          @search="searchBuild = $event"
          @search-project="searchProject = $event"
        />
      </div>
      <a-modal
        v-model:visible="showTransferModal"
        :closable="false"
        ok-text="transfer"
        cancel-text="cancel"
        class="custom-modal transfer-modal"
        style="width: 600px"
        @cancel="() => (showTransferModal = false)"
        @ok="makeTransferBuild"
      >
        <BuildsTransfer
          :update-modal="showTransferModal"
          @selected-items="buidsForTransfer = $event"
          @selected-id="transferStorage = $event"
        />
      </a-modal>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  watch,
  onBeforeUnmount,
  onBeforeMount,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import utils from '@/utils';
import { IBranch } from '@/API/models/branches';
import { IBuild, IBuildSearch, IBuildStatus } from '@/API/models/builds';
import { IStorage } from '@/API/models/storages';
import { IProject } from '@/API/models/projects';
import {
  getAdminBuilds,
  transferingBuilds,
  getAdminBuildsUploadedBy,
  getBuildStatuses,
} from '@/API/builds';
import { getAdminBranches } from '@/API/branches';
import { getAdminStorages } from '@/API/storages';
import { getAdminProjects } from '@/API/projects';
import BuildsTable from '@/components/Builds/BuildsTable.vue';
import BuildsTransfer from '@/components/Builds/BuildsTransfer.vue';
import TableSelect from '@/components/Table/TableSelect.vue';
// import useUserStore from '@/store/user';

const route = useRoute();
const router = useRouter();

const LISTS = {
  statuses: [
    {
      id: 0,
      title: 'active',
      value: { column: 'deleted_at', value: null, operator: '=' },
    },
    {
      id: 1,
      title: 'deleted',
      value: { column: 'deleted_at', value: null, operator: '!=' },
    },
    {
      id: 2,
      title: 'all',
      value: { column: 'all', value: null, operator: '!=@' },
    },
  ],
  sort: [
    {
      id: 0,
      title: 'creation date: new first',
      value: { 'sort[property]': 'created_at', 'sort[direction]': 'desc' },
    },
    {
      id: 1,
      title: 'creation date: old first',
      value: { 'sort[property]': 'created_at', 'sort[direction]': 'asc' },
    },
    {
      id: 2,
      title: 'id: 1 first',
      value: { 'sort[property]': 'id', 'sort[direction]': 'asc' },
    },
    {
      id: 3,
      title: 'size: heavy first',
      value: { 'sort[property]': 'build_size', 'sort[direction]': 'desc' },
    },
  ],
};
const defaultSearchProperties: IBuildSearch = {
  id: null,
  name: '',
  hash_id: '',
  role_name: '',
  branch_id: null,
  storage_id: null,
  project_id: null,
  is_permanent: null,
  build_size: {
    from: '',
    to: '',
    unit: 2,
  },
  status: null,
  uploaded_by: null,
  created_at: [null, null],
  expires_at: [null, null],
};
const isLoading = ref(true);
const timeout = ref<ReturnType<typeof setTimeout> | null>(null);
const timeoutBuild = ref<ReturnType<typeof setTimeout> | null>(null);
const timeoutBranch = ref<ReturnType<typeof setTimeout> | null>(null);
const searchBuild = ref<string | undefined>('');
const searchProject = ref<string | undefined>('');
const buildsUploadedBy = ref<string[]>([]);
const buildsParams = reactive({
  total: 0,
  limit: 30,
  page: 1,
});
const filterParams = reactive({
  activeStatusId: 0,
  activeSortId: 0,
});
const showTransferModal = ref(false);
const search = reactive<IBuildSearch>(defaultSearchProperties);
const branches = ref<IBranch[]>([]);
const builds = ref<IBuild[]>([]);
const storages = ref<IStorage[]>([]);
const projects = ref<IProject[]>([]);
const buidsForTransfer = ref<number[]>([]);
const transferStorage = ref(Infinity);
const statusList = ref<IBuildStatus[]>([]);

const getParams = () => {
  const params = {
    sort: {},
    filters: [],
  };
  const queryData = { operator: '=' };

  if (search && Object.keys(search).length) {
    Object.keys(search).forEach((key) => {
      if (key === 'id' && search[key]) {
        const val =
          typeof search[key] === 'string' ? search[key].trim() : search[key];
        params.filters.push({ column: key, value: val, operator: '=' });
        queryData[key] = Array.isArray(val) ? JSON.stringify(val) : val;
      } else if (
        ['status', 'storage_id', 'branch_id', 'uploaded_by'].includes(key) &&
        search[key]
      ) {
        const val =
          typeof search[key] === 'string' ? search[key].trim() : search[key];
        params.filters.push({ column: key, value: val, operator: '=' });
        queryData[key] = val;
      } else if (['name', 'hash_id'].includes(key) && search[key]) {
        params.filters.push({
          column: key,
          value: search[key].trim(),
          operator: 'like_both',
        });
        queryData[key] = search[key].trim();
      } else if (
        key === 'build_size' &&
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
      } else if (
        (key === 'created_at' || key === 'expires_at') &&
        search[key] &&
        search[key][0] &&
        search[key][1]
      ) {
        params.filters.push({
          column: key,
          value: utils.formatDate(search[key][0].$d),
          operator: '>=',
        });
        params.filters.push({
          column: key,
          value: utils.formatDate(search[key][1].$d),
          operator: '<=',
        });
        queryData[key] = JSON.stringify([
          utils.formatDate(search[key][0].$d),
          utils.formatDate(search[key][1].$d),
        ]);
      } else if (key === 'role_name' && search[key]?.trim()) {
        params.filters.push({
          column: 'branch.role_name',
          value: search[key].trim(),
          operator: 'like_both',
        });
        queryData[key] = search[key].trim();
      } else if (key === 'project_id' && search[key]) {
        params.filters.push({
          column: 'branch.project_id',
          value: search[key],
          operator: '=',
        });
        queryData[key] = search[key];
      } else if (key === 'is_permanent' && typeof search[key] === 'string') {
        params.filters.push({
          column: 'is_permanent',
          value: search[key],
          operator: '=',
        });
        queryData[key] = search[key];
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

  params.filters.push(LISTS.statuses[filterParams.activeStatusId].value);

  if (filterParams.activeStatusId) {
    queryData.operator =
      LISTS.statuses[filterParams.activeStatusId].value.operator;
  } else {
    delete queryData.operator;
  }
  setQuery(queryData);

  return { sort: params.sort, filters: JSON.stringify(params.filters) };
};

const getBuilds = async (isReload: boolean = true) => {
  if (timeout.value) {
    clearTimeout(timeout.value);
  }
  timeout.value = setTimeout(async () => {
    if (isReload) {
      builds.value = [];
      buildsParams.page = 1;
    } else {
      buildsParams.page++;
    }

    isLoading.value = true;
    const { sort, filters } = getParams();

    try {
      const { items: data, total } = await getAdminBuilds({
        with: ['branch', 'branch.storage', 'proxy_storages', 'storage'],
        limit: buildsParams.limit,
        page: buildsParams.page,
        ...sort,
        filters,
      });

      buildsParams.total = total;
      builds.value = builds.value.concat(data);
    } catch (e) {
    } finally {
      isLoading.value = false;
    }
  }, 800);
};
const getBuildsWithoutTimer = async (isReload: boolean = true) => {
  if (isReload) {
    builds.value = [];
    buildsParams.page = 1;
  } else {
    buildsParams.page++;
  }

  isLoading.value = true;
  const { sort, filters } = getParams();

  try {
    const { items: data, total } = await getAdminBuilds({
      with: ['branch', 'branch.storage', 'proxy_storages', 'storage'],
      limit: buildsParams.limit,
      page: buildsParams.page,
      ...sort,
      filters,
    });

    buildsParams.total = total;
    builds.value = builds.value.concat(data);
  } catch (e) {
  } finally {
    isLoading.value = false;
  }
};
const getBranches = async (): Promise<void> => {
  try {
    if (searchBuild.value) {
      if (timeoutBranch.value) clearTimeout(timeoutBranch.value);
      timeoutBranch.value = setTimeout(async () => {
        const { items } = await getAdminBranches({
          limit: 15,
          filters: JSON.stringify([
            {
              column: 'name',
              value: searchBuild.value,
              operator: 'like_both',
            },
          ]),
        });
        branches.value = items;
      }, 800);
    } else if (route.query?.branch_id) {
      if (timeoutBranch.value) clearTimeout(timeoutBranch.value);
      timeoutBranch.value = setTimeout(async () => {
        const { items } = await getAdminBranches({
          limit: 15,
          filters: JSON.stringify([
            {
              column: 'id',
              value: route.query?.branch_id,
              operator: '=',
            },
          ]),
        });
        branches.value = items;
      }, 800);
    } else {
      const { items } = await getAdminBranches({
        limit: 15,
      });
      branches.value = items;
    }
  } catch (e) {}
};

const getStorages = async () => {
  try {
    const { items } = await getAdminStorages({
      limit: -1,
      filters: JSON.stringify([{ column: 'status', value: 'active' }]),
    });
    storages.value = items;
  } catch (e) {}
};

const getProjects = async () => {
  try {
    if (timeoutBuild.value) clearTimeout(timeoutBuild.value);
    if (searchProject.value) {
      timeoutBuild.value = setTimeout(async () => {
        const { items } = await getAdminProjects({
          limit: 15,
          name: searchProject.value,
          is_delivery: 1,
        });
        projects.value = items;
      }, 500);
    } else if (route.query?.project_id) {
      timeoutBuild.value = setTimeout(async () => {
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

const getBuildsUploadedBy = async () => {
  try {
    const { items } = await getAdminBuildsUploadedBy({ limit: -1 });
    buildsUploadedBy.value = items;
  } catch (e) {}
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
  if (query.operator) {
    const idx = LISTS.statuses.findIndex(
      (item) => item.value.operator === query.operator
    );
    if (idx > -1) filterParams.activeStatusId = idx;
  }

  ['status', 'name', 'hash_id', 'role_name', 'uploaded_by'].forEach((key) => {
    if (query[key] && typeof query[key] === 'string') {
      search[key] = query[key]?.trim();
    } else if (Array.isArray(query[key])) {
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

  if (query.build_size) {
    const data = JSON.parse(query.build_size);
    if (typeof data === 'object') {
      search.build_size.from = data.from && !isNaN(data.from) ? data.from : '';
      search.build_size.to = data.to && !isNaN(data.to) ? data.to : '';
      search.build_size.unit = data.unit && !isNaN(data.unit) ? data.unit : 2;
    }
  }

  if (query.branch_id) {
    getBranches();
    search.branch_id = +query.branch_id;
  }

  if (query.project_id) {
    getProjects();
    search.project_id = +query.project_id;
  }

  if (
    query.storage_id &&
    storages.value?.length &&
    storages.value.some((item) => item.id === +query.storage_id)
  ) {
    search.storage_id = +query.storage_id;
  }

  if (query['sort[property]'] && query['sort[direction]']) {
    const idx = LISTS.sort.findIndex(
      (item) =>
        item.value['sort[property]'] === query['sort[property]'].trim() &&
        item.value['sort[direction]'] === query['sort[direction]'].trim()
    );
    if (idx > -1) filterParams.activeSortId = idx;
  }

  if (query.is_permanent && (query.is_permanent === '1' || query.is_permanent === '0')) {
    search.is_permanent = query.is_permanent;
  }

  ['created_at', 'expires_at'].forEach((key) => {
    if (query[key]) {
      const arr = JSON.parse(query[key]);
      if (Array.isArray(arr) && arr.length === 2) {
        const isValid =
          utils.testValidDate(arr[0]) && utils.testValidDate(arr[1]);
        if (isValid) {
          search[key] = arr.map((item) => dayjs(item, 'YYYY-MM-DD'));
        }
      }
    }
  });
};

const clearFields = () => {
  filterParams.activeStatusId = 0;
  filterParams.activeSortId = 0;

  search.id = null;
  search.name = '';
  search.hash_id = '';
  search.role_name = '';
  search.branch_id = null;
  search.storage_id = null;
  search.project_id = null;
  search.is_permanent = null;
  search.build_size.from = '';
  search.build_size.to = '';
  search.build_size.unit = 2;
  search.status = null;
  search.uploaded_by = null;
  search.created_at = [null, null];
  search.expires_at = [null, null];
};
const makeTransferBuild = async () => {
  if (isFinite(transferStorage.value) && buidsForTransfer.value.length) {
    transferingBuilds(transferStorage.value, buidsForTransfer.value).then(
      () => {
        showTransferModal.value = false;
        transferStorage.value = Infinity;
      }
    );
  }
};

const getStatuses = async () => {
  const { items } = await getBuildStatuses();
  statusList.value = items.map((el, i) => ({
    id: i,
    icon: el,
    title: el,
  }));
};

// onBeforeMount(() => {
//   console.log(useUserStore.self.value)
//   const menus = useUserStore.self.value.menus.map((el) => el.name);
//   if (!menus.includes(route.name)) {
//     if (useUserStore.self.value?.menus.length) {
//       router.push(`/${useUserStore.self.value?.menus[0].name}`);
//     } else {
//       router.push('/401');
//     }
//   }
// });

onMounted(async () => {
  document.body.classList.add('hide-scroll');
  document.querySelector('html')?.classList.add('hide-scroll');
  // const menus = useUserStore.self.value?.menus.map((el) => el.name)||[];
  // if (!menus.includes(route.name)) {
  //   if (useUserStore.self.value?.menus.length) {
  //     router.push(`/${useUserStore.self.value?.menus[0].name}`);
  //   } else {
  //     router.push('/401');
  //     // location.reload()
  //   }
  // }
    await Promise.all([
      getBranches(),
      getProjects(),
      getStorages(),
      getBuildsUploadedBy(),
      getStatuses(),
    ]).finally(async () => {
      const { query } = route;
      if (Object.keys(query).length) {
        parseQuery(Object.create(query));
      }
      await getBuildsWithoutTimer();
      // await getBuilds();
    });
});

onBeforeUnmount(() => {
  if (timeout.value) {
    clearTimeout(timeout.value);
  }
  document.body.classList.remove('hide-scroll');
  document.querySelector('html')?.classList.remove('hide-scroll');
});
watch(searchBuild, getBranches);
watch(searchProject, getProjects);
</script>

<style lang="scss" scoped>
.builds {
  &__content {
    padding-bottom: 0;
  }

  &-header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;
    .title_container {
      display: flex;
      align-items: center;
      gap: 24px;
      &:deep(button) {
        background-color: #1565c0;
        border-color: #1565c0;
        padding: 5px 14px;
        border-radius: 10px;
        font-size: 16px;
        line-height: 1;
        color: #fff;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }

  &-sort-and-filter {
    display: flex;

    & > * + * {
      margin-left: 32px;
    }
  }

  &__inner {
    position: relative;
    margin-right: -38px;
  }
}
</style>
