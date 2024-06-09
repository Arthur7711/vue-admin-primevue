<template>
  <section class="proxy" :class="{ full: isLoading }">
    <a-spin v-if="isLoading" size="large" tip="Loading..." />

    <div v-else class="main-content proxy__content">
      <div class="proxy-header">
        <h2 class="proxy-header__title" @click="clearAll">proxy storages</h2>
        <div class="proxy-header__inner">
          <TableSelect
            v-model="filterParams.activeStatusId"
            :list="LISTS.statuses"
            always-show-shevron
            @change="getProxies"
          />
          <TableSelect
            v-model="filterParams.activeSortId"
            :list="LISTS.sort"
            always-show-shevron
            @change="getProxies"
          />
          <a-button type="primary" class="proxy-header__btn">
            <router-link to="/proxy/create">create new proxy</router-link>
          </a-button>
        </div>
      </div>

      <div class="proxy__inner">
        <ProxyTable
          v-model="search"
          :proxies="proxies"
          :is-loading="isLoadingProxy"
          :active-proxy-id="searchBuilds.proxy_storage_id"
          :params="proxyParams"
          @upload="getProxies"
          @add-more="getMoreProxies"
          @clear="
            clearProxyFields();
            getProxies();
          "
          @search-builds="searchBuildsByProxy"
        />

        <ProxyBuildsTable
          v-model="searchBuilds"
          :proxy-builds="proxyBuilds"
          :is-loading="isLoadingBuilds"
          :params="buildsParams"
          @upload="getProxyBuilds"
          @clear="
            clearBuildsFields();
            getProxyBuilds();
          "
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TableSelect from '@/components/Table/TableSelect.vue';
import ProxyTable from '@/components/Proxy/ProxyTable.vue';
import ProxyBuildsTable from '@/components/Proxy/ProxyBuildsTable.vue';
import {
  IProxy,
  IProxyBuild,
  IProxyQuery,
  ISearchBuilds,
  ISearchProxy,
} from '@/API/models/proxies';
import {
  getAdminProxies,
  getAdminProxy,
  getAdminProxyBuilds,
  getAdminSubscriptions,
} from '@/API/proxies';

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
      title: 'proxy online date: recent first',
      value: { 'sort[property]': 'ping_at', 'sort[direction]': 'desc' },
    },
    {
      id: 3,
      title: 'proxy online date: old first',
      value: { 'sort[property]': 'ping_at', 'sort[direction]': 'asc' },
    },
  ],
};

const isLoading = ref(true);
const isLoadingProxy = ref(false);
const isLoadingBuilds = ref(false);
const timeout = ref<any>(null);
const timeoutBuilds = ref<any>(null);
const proxies = ref<IProxy[]>([]);
const proxyBuilds = ref<IProxyBuild[]>([]);
const proxyParams = reactive({
  total: 0,
  limit: 15,
  page: 1,
});
const buildsParams = reactive({
  total: 0,
  limit: 20,
  page: 1,
});
const filterParams = reactive({
  activeStatusId: 0,
  activeSortId: 0,
});
const search: ISearchProxy = reactive({
  id: '',
  name: '',
  branch: '',
  depth: {
    from: '',
    to: '',
  },
});
const searchBuilds: ISearchBuilds = reactive({
  build_id: null,
  name: '',
  proxy_storage_id: null,
  status: null,
  build: '',
  branch_build: null,
});
const clearAll = () => {
  filterParams.activeSortId = 0;
  filterParams.activeStatusId = 0;
  clearProxyFields();
  clearBuildsFields();
  getProxies();
  getProxyBuilds();
};
const getProxies = async (isReload: boolean = true) => {
  clearTimeout(timeout.value);
  timeout.value = setTimeout(async () => {
    if (isReload) {
      proxies.value = [];
      proxyParams.page = 1;
      isLoadingProxy.value = true;
    } else {
      proxyParams.page++;
    }

    isLoadingProxy.value = true;
    const { sort, filters } = getParams();
    try {
      const { items, total } = await getAdminProxies({
        limit: proxyParams.limit,
        page: proxyParams.page,
        ...sort,
        filters,
      });

      const proxyItems = getProxyWithSubs(items);
      proxyParams.total = total;
      proxies.value = proxies.value.concat(proxyItems);
    } catch (e) {
    } finally {
      if (isLoading.value) isLoading.value = false;
      if (isLoadingProxy.value) isLoadingProxy.value = false;
    }
  }, 800);
};
const getMoreProxies = async () => {
  clearTimeout(timeout.value);
  timeout.value = setTimeout(async () => {
    proxyParams.page++;

    const { sort, filters } = getParams();
    try {
      const { items, total } = await getAdminProxies({
        limit: proxyParams.limit,
        page: proxyParams.page,
        ...sort,
        filters,
      });

      const proxyItems = getProxyWithSubs(items);
      proxyParams.total = total;

      proxies.value = [...proxies.value, ...proxyItems];
    } catch (e) {
    } finally {
      if (isLoading.value) isLoading.value = false;
      if (isLoadingProxy.value) isLoadingProxy.value = false;
    }
  }, 800);
};
const getProxy = async (id: number) => {
  try {
    const currentProxy = await getAdminProxy(id);
    searchBuilds.name = currentProxy.name;
  } catch (e) {}
};

const getProxyBuilds = async (isReload: boolean = true) => {
  clearTimeout(timeoutBuilds.value);
  timeoutBuilds.value = setTimeout(async () => {
    if (isReload) {
      proxyBuilds.value = [];
      buildsParams.page = 1;
      isLoadingBuilds.value = true;
    } else {
      buildsParams.page++;
    }

    const { sort, filters } = getBuildParams();
    try {
      const { items, total } = await getAdminProxyBuilds({
        with: ['build', 'build.branch'],
        'sort[property]': 'created_at',
        'sort[direction]': 'desc',
        limit: buildsParams.limit,
        page: buildsParams.page,
        ...sort,
        filters,
      });

      buildsParams.total = total;
      proxyBuilds.value = proxyBuilds.value.concat(items);
    } catch (e) {
    } finally {
      if (isLoadingBuilds.value) isLoadingBuilds.value = false;
    }
  }, 800);
};

const getProxyWithSubs = (items: IProxy[]) => {
  const params: { filters?: string } = {};
  if (search.depth.from && search.depth.to) {
    params.filters = JSON.stringify([
      { column: 'depth', value: search.depth.from, operator: '>=' },
      { column: 'depth', value: search.depth.to, operator: '<=' },
    ]);
  }

  items.forEach((item, idx) => {
    if (!item.deleted_at) {
      getSubscription(item.id, { ...params, with: ['branch'], limit: -1 });
    } else {
      items[idx].branches = [];
    }
  });
  return items;
};

const searchBuildsByProxy = async (proxy: IProxy) => {
  if (searchBuilds.proxy_storage_id !== proxy.id) {
    searchBuilds.name = proxy.name;
    searchBuilds.proxy_storage_id = proxy.id;
  } else {
    searchBuilds.name = '';
    searchBuilds.proxy_storage_id = null;
  }

  await getProxyBuilds();
};

const getSubscription = async (id: number, params = {}) => {
  try {
    const { items: subs } = await getAdminSubscriptions(id, {
      ...params,
      'sort[property]': 'branch.name',
      'sort[direction]': 'asc',
    });
    const proxyIdx = proxies.value.findIndex((item) => item.id === id);
    proxies.value[proxyIdx].branches = subs;
  } catch (e) {}
};

const getParams = () => {
  const params = {
    sort: {},
    filters: [],
  };

  const queryData: IProxyQuery = {};
  if (search && Object.keys(search)?.length) {
    Object.keys(search).forEach((key) => {
      if (key === 'id' && search[key]) {
        const val =
          typeof search[key] === 'string' ? search[key].trim() : search[key];
        params.filters.push({ column: key, value: val, operator: '=' });
        queryData[key] = Array.isArray(val) ? JSON.stringify(val) : val;
      } else if (key === 'name' && search[key]) {
        const val =
          typeof search[key] === 'string' ? search[key].trim() : search[key];
        params.filters.push(
          { column: 'name', value: val, operator: 'like_both', option: 'or' },
          {
            column: 'description',
            value: val,
            operator: 'like_both',
            option: 'or',
          }
        );
        queryData[key] = val;
      } else if (key === 'branch' && search[key]?.trim()) {
        params.filters.push({
          column: 'proxyStorageSubscriptions.branch.name',
          value: search[key].trim(),
          operator: 'like_both',
        });
        queryData[key] = search[key].trim();
      } else if (key === 'depth' && search[key].from && search[key].to) {
        params.filters.push({
          column: 'proxyStorageSubscriptions.depth',
          value: search[key].from,
          operator: '>=',
        });
        params.filters.push({
          column: 'proxyStorageSubscriptions.depth',
          value: search[key].to,
          operator: '<=',
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

  params.filters.push(LISTS.statuses[filterParams.activeStatusId].value);

  if (filterParams.activeStatusId) {
    queryData.operator =
      LISTS.statuses[filterParams.activeStatusId].value.operator;
  }

  if (searchBuilds.status) queryData.status = searchBuilds.status;

  if (searchBuilds.proxy_storage_id)
    queryData.proxy_storage_id = searchBuilds.proxy_storage_id;
  setQuery(queryData);

  return { sort: params.sort, filters: JSON.stringify(params.filters) };
};

const getBuildParams = () => {
  const params = {
    sort: {},
    filters: [],
  };

  const query = { ...route.query };

  if (searchBuilds.build_id) {
    params.filters.push({ column: 'build_id', value: searchBuilds.build_id });
    query.build_id = searchBuilds.build_id.toString();
  } else {
    delete query.build_id;
  }

  if (searchBuilds.proxy_storage_id) {
    params.filters.push({
      column: 'proxy_storage_id',
      value: searchBuilds.proxy_storage_id,
    });
    query.proxy_storage_id = searchBuilds.proxy_storage_id.toString();
  } else {
    delete query.proxy_storage_id;
  }

  if (searchBuilds.status) {
    params.filters.push({ column: 'status', value: searchBuilds.status });
    query.status = searchBuilds.status;
  } else {
    params.filters.push({ column: 'status', value: 'deleted', operator: '!=' });
    delete query.status;
  }

  if (searchBuilds.build) {
    params.filters.push({ column: 'build.name', value: searchBuilds.build, operator: 'like_both'});
    query.build = searchBuilds.build;
  } else {
    delete query.build;
  }

  if (searchBuilds.branch_build) {
    params.filters.push({
      column: 'build.branch_id',
      value: searchBuilds.branch_build,
    });
    query.branch_build = searchBuilds.branch_build;
  } else {
    delete query.branch_build;
  }

  setQuery(query);

  return { sort: params.sort, filters: JSON.stringify(params.filters) };
};

const setQuery = (params) => {
  const { query } = route;

  const isMatchLength =
    Object.keys(params)?.length === Object.keys(query)?.length;
  const isMatchValues = Object.keys(params).every(
    (key) => query[key] && query[key] === String(params[key])
  );

  if (!isMatchLength || !isMatchValues) {
    router.replace({ query: params });
  }
};

const clearProxyFields = () => {
  filterParams.activeStatusId = 0;
  filterParams.activeSortId = 0;

  search.id = '';
  search.name = '';
  search.branch = '';
  search.depth.from = '';
  search.depth.to = '';
};

const clearBuildsFields = () => {
  searchBuilds.build_id = null;
  searchBuilds.name = '';
  searchBuilds.proxy_storage_id = null;
  searchBuilds.status = null;
  searchBuilds.build = '';
  searchBuilds.branch_build = null;
};

const parseQuery = (query) => {
  ['name', 'branch'].forEach((key) => {
    if (query[key]) search[key] = query[key]?.trim();
  });

  if (query.id) {
    if (Array.isArray(query.id)) {
      search.id = query.id;
    } else {
      const val = JSON.parse(query.id);
      search.id = Array.isArray(val) ? val : query.id;
    }
  }

  if (query.depth) {
    const data = JSON.parse(query.depth);
    if (typeof data === 'object') {
      search.depth.from = data.from && !isNaN(data.from) ? data.from : '';
      search.depth.to = data.to && !isNaN(data.to) ? data.to : '';
    }
  }

  if (query.operator) {
    const idx = LISTS.statuses.findIndex(
      (item) => item.value.operator === query.operator
    );
    if (idx > -1) filterParams.activeStatusId = idx;
  }

  if (query['sort[property]'] && query['sort[direction]']) {
    const idx = LISTS.sort.findIndex(
      (item) =>
        item.value['sort[property]'] === query['sort[property]'].trim() &&
        item.value['sort[direction]'] === query['sort[direction]'].trim()
    );
    if (idx > -1) filterParams.activeSortId = idx;
  }

  if (query.build_id) {
    searchBuilds.build_id = +query.build_id;
  }

  if (query.status) {
    searchBuilds.status = query.status;
  }

  if (query.proxy_storage_id) {
    searchBuilds.proxy_storage_id = +query.proxy_storage_id;
    getProxy(+query.proxy_storage_id);
  }
  if (query.build) {
    searchBuilds.build = query.build;
  }
  if (query.branch_build) {
    searchBuilds.branch_build = query.branch_build;
  }
};

onMounted(() => {
  document.body.classList.add('hide-scroll');
  document.querySelector('html')?.classList.add('hide-scroll');

  const { query } = route;
  if (Object.keys(query)?.length) {
    parseQuery(query);
  }

  getProxies();
  getProxyBuilds();
});

onBeforeUnmount(() => {
  clearTimeout(timeout.value);
  document.body.classList.remove('hide-scroll');
  document.querySelector('html')?.classList.remove('hide-scroll');
});
</script>

<style lang="scss" scoped>
.proxy {
  &__content {
    padding-bottom: 0;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 24px;

    &__title {
      @include Font-24-30-700;
      margin-bottom: 0;
      cursor: pointer;
      white-space: nowrap;
    }

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
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 30px;
    overflow: auto;
    margin-right: -38px;
    padding-right: 8px;
    height: calc(100vh - 157px);
    @include custom-scroll();
  }
}
</style>
