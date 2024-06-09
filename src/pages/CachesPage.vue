<template>
  <section class="caches">
    <div class="main-content caches__content">
      <div class="caches-header">
        <h2
          class="caches__title"
          @click="
            () => {
              clearFields();
              getCaches();
            }
          "
        >
          cache storages
        </h2>
        <div class="caches-header__inner">
          <TableSelect
            v-model="filterParams.activeSortId"
            :list="LISTS.sort"
            always-show-shevron
            @change="getCaches"
          />
          <a-button type="primary" class="caches-header__btn">
            <router-link to="/cache/create">create new cache</router-link>
          </a-button>
        </div>
      </div>

      <div class="caches__inner">
        <CachesTable
          v-model="search"
          :is-loading="isLoading"
          :types="LISTS.types"
          :statuses="utils.statusCache"
          :items="caches"
          :params="cachesParams"
          :is-show-remove="Object.keys(route.query).length"
          @upload="getCaches"
          @clear="
            clearFields();
            getCaches();
          "
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref, reactive, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import utils from "@/utils";
import CachesTable from "@/components/Caches/CachesTable.vue";
import TableSelect from "@/components/Table/TableSelect.vue";
import { getAdminCaches } from "@/API/caches";
import { ICache, ICacheSearch } from "@/API/models/caches";

const route = useRoute();
const router = useRouter();

const LISTS = {
  sort: [
    {
      id: 0,
      title: "id: 1 first",
      value: { "sort[property]": "id", "sort[direction]": "asc" },
    },
    {
      id: 1,
      title: " id: last first",
      value: { "sort[property]": "id", "sort[direction]": "desc" },
    },
    {
      id: 2,
      title: "name: A-Z",
      value: { "sort[property]": "name", "sort[direction]": "asc" },
    },
    {
      id: 3,
      title: "cache online date: old first",
      value: { "sort[property]": "ping_at", "sort[direction]": "desc" },
    },
    {
      id: 4,
      title: "depth: deepest first",
      value: { "sort[property]": "depth", "sort[direction]": "desc" },
    },
  ],
  types: ["public", "internal"],
};

const isLoading: Ref<boolean> = ref(true);
const cachesParams = reactive({
  total: 0,
  limit: 15,
  page: 1,
});

const caches: Ref<ICache[]> = ref([]);
const timeout: Ref<any> = ref(null);
const search: ICacheSearch = reactive({
  id: null,
  name: "",
  host: "",
  ip_address: "",
  type: null,
  status: null,
});
const filterParams = reactive({
  activeSortId: 0,
});

const getCaches = async (isReload: boolean = true): Promise<void> => {
  clearTimeout(timeout.value);
  timeout.value = setTimeout(async () => {
    if (isReload) {
      cachesParams.page = 1;
      caches.value = [];
    } else {
      cachesParams.page++;
    }

    isLoading.value = true;
    const { sort, filters } = getParams();

    try {
      const { items, total } = await getAdminCaches({
        with: ["branches", "cacheUsers.build"],
        limit: cachesParams.limit,
        page: cachesParams.page,
        ...sort,
        filters,
      });

      caches.value = caches.value.concat(items);
      cachesParams.total = total;
    } catch (e) {
    } finally {
      isLoading.value = false;
    }
  }, 800);
};

const getParams = () => {
  const params: {
    sort: { [key: string]: string | number };
    filters: {
      column: string;
      value: string;
      operator?: string;
      option?: string;
    }[];
  } = {
    sort: {},
    filters: [],
  };

  const queryData: { [key: string]: string | number } = {};

  if (search && Object.keys(search).length) {
    // @ts-ignore
    Object.keys(search).forEach((key: keyof ICacheSearch) => {
      if (key === "id" && search[key]) {
        const val = typeof search[key] === "string" ? search[key].trim() : search[key];
        params.filters.push({ column: key, value: val, operator: "=" });
        queryData[key] = Array.isArray(val)
          ? JSON.stringify(val)
          : val
      } else if (
        ["name", "host", "ip_address", "status", "type"].includes(key) &&
        search[key]
      ) {
        if (key === "name") {
          params.filters.push(
            {
              column: key,
              value: search[key].trim(),
              operator: "like_both",
              option: "or",
            },
            {
              column: "description",
              value: search[key].trim(),
              operator: "like_both",
              option: "or",
            }
          );
        } else {
          params.filters.push({
            column: key,
            value: search?.[key]?.trim() || "",
            operator: "like_both",
          });
        }
        queryData[key] = search?.[key]?.trim() || "";
      }
    });
  }

  params.sort = LISTS.sort[filterParams.activeSortId].value;

  if (filterParams.activeSortId) {
    queryData["sort[property]"] =
      LISTS.sort[filterParams.activeSortId].value["sort[property]"];
    queryData["sort[direction]"] =
      LISTS.sort[filterParams.activeSortId].value["sort[direction]"];
  }

  setQuery(queryData);
  return { sort: params.sort, filters: JSON.stringify(params.filters) };
};

const setQuery = (params: { [key: string]: string | number }) => {
  const { query } = route;

  const isMatchLength =
    Object.keys(params).length === Object.keys(query).length;
  const isMatchValues = Object.keys(params).every((key) => query[key] && query[key] === String(params[key]));

  if (!isMatchLength || !isMatchValues) {
    router.replace({ query: params });
  }
};
const constantNames: Array<Partial<keyof ICacheSearch>> = [
  "name",
  "host",
  "ip_address",
];
const parseQuery = (query: { [key: string]: any }) => {
  constantNames.forEach((key) => {
    if (query[key] && Array.isArray(query[key]) && query[key]?.length === 0) {
      search[key] = "";
    } else if (query[key] && typeof query[key] === "string") {
      search[key] = query[key]?.trim();
    } else if (query[key] && Array.isArray(query[key])) {
      search[key] = query[key];
    }
  });

  if (query.id) {
    if (Array.isArray(query.id)) {
      search.id = query.id
    } else {
      const val = JSON.parse(query.id)
      search.id = Array.isArray(val) ? val : query.id
    }
  }

  if (
    query.status &&
    utils.statusCache.find((item) => item.value === query.status)
  ) {
    search.status = query.status;
  }

  if (query.type && LISTS.types.includes(query.type)) {
    search.type = query.type;
  }

  if (query["sort[property]"] && query["sort[direction]"]) {
    const idx = LISTS.sort.findIndex((item) => (
        item.value["sort[property]"] === query["sort[property]"].trim() &&
        item.value["sort[direction]"] === query["sort[direction]"].trim()
      ));
    if (idx > -1) filterParams.activeSortId = idx;
  }
};

const clearFields = () => {
  filterParams.activeSortId = 0;

  search.id = null;
  search.name = "";
  search.host = "";
  search.ip_address = "";
  search.type = null;
  search.status = null;
};

onMounted(async () => {
  document.body.classList.add("hide-scroll");
  document.querySelector("html")?.classList.add("hide-scroll");

  const { query } = route;
  if (Object.keys(query).length) {
    parseQuery(query);
  }

  await getCaches();
});

onBeforeUnmount(() => {
  clearTimeout(timeout.value);
  document.body.classList.remove("hide-scroll");
  document.querySelector("html")?.classList.remove("hide-scroll");
});
</script>

<style lang="scss" scoped>
.caches {
  &__content {
    padding-bottom: 0;
  }

  &-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 24px;


    &__inner {
      display: flex;
      align-items: center;
      gap: 30px;
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
    cursor: pointer;

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
