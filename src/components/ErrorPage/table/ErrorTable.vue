<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { format } from "date-fns";
import debounce from "@/utils/debounce";
import { useInfiniteScroll } from "@vueuse/core";
import { useRouter, useRoute } from "vue-router";
import { CloseCircleOutlineIcon } from "mdi-vue3";
import { IFilters } from "./types";
import { ExternalItem } from "@/API/models/external";
import { getExternalLogs } from "@/API/external";
import { columns } from "./constants";

const router = useRouter();
const route = useRoute();

const props = defineProps<{
  filterBy: string;
}>();

const emit = defineEmits<{
  (e: "upload", value?: boolean): void;
}>();
const page = ref(1);
const total = ref(Infinity);
const called = ref(true);
const el = ref<HTMLElement | null>(null);
const filters = ref<IFilters>({
  id: "",
  service: "",
  message: "",
  trace: "",
});
const tableData = ref<ExternalItem[]>([]);
const showMoreItems = computed(() => {
  const items: { id: number; variant: string }[] = [];
  tableData.value.forEach((el) => {
    if (el.message.length > 40) {
      items.push({ id: el.id, variant: "message" });
    }
    if (el.trace.length > 40) {
      items.push({ id: el.id, variant: "trace" });
    }
    if (el.file.length > 40) {
      items.push({ id: el.id, variant: "file" });
    }
  });
  return items;
});
const showedMoreItems = ref<{ id: number; variant: string }[]>([]);
const filterProperties = () => Object.entries(filters.value)
    .filter((el) => el[1])
    .map((elem) => ({ column: elem[0], value: elem[1] }));
const apiSearchCall = async () => {
  page.value = 1;
  filters.value = { ...filters.value, ...route.query };
  if (filterProperties().length) {
    const data = await getExternalLogs({
      "sort[direction]": "desc",
      limit: 25,
      filters: JSON.stringify(filterProperties()),
      page: page.value,
    });
    tableData.value = data.items;
    total.value = data.total;
  } else {
    const data = await getExternalLogs({
      "sort[direction]": "desc",
      limit: 25,
      page: page.value,
    });
    tableData.value = data.items;
    total.value = data.total;
  }
  called.value = false;
};
const clearAllFilters = () => {
  filters.value.id = "";
  filters.value.message = "";
  filters.value.service = "";
  filters.value.trace = "";
};
const searchresults = debounce(
  () => {
    const paramsArray = Object.entries(filters.value).filter((el) => el[1]);
    const params = {};
    paramsArray.forEach((el) => {
      params[el[0]] = el[1];
    });
    router.replace({ query: params });
  },
  500,
  false
);
const loadMore = debounce(
  async () => {
    page.value += 1;
    if (page.value * 25 < total.value) {
      if (filterProperties().length) {
        const data = await getExternalLogs({
          "sort[direction]": "desc",
          limit: 25,
          filters: JSON.stringify(filterProperties()),
          page: page.value,
        });
        tableData.value = [...tableData.value, ...data.items];
        total.value = data.total;
      } else {
        const data = await getExternalLogs({
          "sort[direction]": "desc",
          limit: 25,
          page: page.value,
        });
        tableData.value = [...tableData.value, ...data.items];
        total.value = data.total;
      }
      called.value = false;
    }
  },
  500,
  false
);
const isFiltered = computed(() => !!(
    filters.value.id ||
    filters.value.message ||
    filters.value.service ||
    filters.value.trace
  ));
onMounted(async () => {
  document
    .querySelector(".main-content")
    ?.setAttribute("style", "padding:24px 0px 24px 40px !important");
  apiSearchCall();
});
watch(
  () => props.filterBy,
  () => {
    clearAllFilters();
    filters.value.service = props.filterBy;
  }
);
watch(
  () => filters,
  async () => {
    searchresults();
  },
  {
    deep: true,
  }
);
watch(
  () => route.query,
  () => {
    filters.value = { ...filters.value, ...route.query };
    apiSearchCall();
  }
);
useInfiniteScroll(
  el,
  () => {
    if (!called.value) {
      loadMore();
      called.value = true;
    }
  },
  { distance: 10 }
);
</script>
<template>
  <div>
    <div ref="el" class="table__main-class">
      <a-table
        :data-source="tableData"
        :columns="columns"
        :pagination="false"
        class="error-table"
      >
        <template #headerCell="{ column }">
          <template v-if="column.key === 'remove'">
            <div
              v-if="isFiltered"
              style="
                cursor: pointer;
                width: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
              "
              @click="clearAllFilters"
            >
              <CloseCircleOutlineIcon />
            </div>
          </template>
          <a-input
            v-else-if="
              ['id', 'service', 'message', 'trace'].includes(column.key)
            "
            v-model:value="filters[column.dataIndex]"
            :placeholder="column.title"
            class="error-table__header-input"
          />
          <span v-else class="error-table__header-text">{{
            column.title
          }}</span>
        </template>
        <template #bodyCell="{ column, text, record }">
          <p v-if="column.key === 'updated_at'" style="white-space: nowrap">
            {{ format(new Date(text), "yyyy-MM-dd HH:mm") }}
          </p>
          <p
            v-else-if="column.key === 'created_at'"
            style="white-space: nowrap"
          >
            {{ format(new Date(text), "yyyy-MM-dd") }}
          </p>
          <div
            v-else-if="['message', 'trace', 'file'].includes(column.key)"
            style="display: flex; align-items: flex-start; gap: 8px"
          >
            <p
              class="wrap-text"
              :style="{
                '-webkit-line-clamp':
                  showedMoreItems.findIndex(
                    (el) => el.id === record.id && el.variant === column.key
                  ) < 0
                    ? 2
                    : 1000,
              }"
            >
              {{ text }}
            </p>
            <div
              v-if="
                showMoreItems.find(
                  (el) => el.id === record.id && el.variant === column.key
                )
              "
              class="wrap-icon"
              :style="{
                rotate: showedMoreItems.find(
                  (el) => el.id === record.id && el.variant === column.key
                )
                  ? '180deg'
                  : '0deg',
              }"
              @click="
                () => {
                  showedMoreItems.find(
                    (el) => el.id === record.id && el.variant === column.key
                  )
                    ? (showedMoreItems = showedMoreItems.filter(
                        (el) => el.id !== record.id || el.variant !== column.key
                      ))
                    : showedMoreItems.push({
                        id: record.id,
                        variant: column.key,
                      });
                }
              "
            >
              <DropdownLight />
            </div>
          </div>
        </template>
      </a-table>
    </div>
    <Loader
      v-if="called"
      :width="50"
      fill="#509574"
      style="position: fixed; z-index: 99999; bottom: 20px; left: 50%"
    />
  </div>
</template>
<style scoped lang="scss">
.table__main-class {
  height: 84vh;
  overflow-y: scroll;
  width: 100% !important;
}
.table__main-class::-webkit-scrollbar {
  width: 10px;
  height: 8px;
  background-color: #f1f1f1;
}

.table__main-class::-webkit-scrollbar-thumb {
  background: rgba(102, 102, 102, 0.2);
  border-radius: 5px;
}

.custom-simplebar .simplebar-scrollbar::before {
  background-color: rgba(102, 102, 102, 0.2);
  width: 5px;
}
.error-table {
  border-collapse: separate;
  border-spacing: 8px 12px;
  max-width: 100vw !important;
  width: 100%;
  input:focus {
    box-shadow: none !important;
    font-size: 14px;
  }
  :deep(.ant-table-thead) {
    tr {
      th {
        padding: 0 12px 0 0;
        padding-bottom: 25px;
      }
      th:nth-child(n) {
        width: 100px;
      }
      th:nth-child(-n + 7) {
        width: 350px;
      }
      th:nth-child(-n + 4) {
        width: 100px;
      }
      th:nth-child(1) {
        width: 30px;
      }
    }
  }
  :deep(.ant-table-tbody) {
    tr {
      td {
        padding: 0 12px 0 0;
        vertical-align: text-top;
      }
    }
  }
  & :deep(.ant-table-thead) {
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 1;
    // box-shadow: 0 2px 1px #e3e3e3;
  }
  &__header-input {
    padding-left: 0;
    padding-bottom: 0;
    border: none;
    border-bottom: 1px solid #e3e3e3;
    min-width: 70px;
  }
  &__header-text {
    color: #999999;
  }
  .wrap-text {
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    max-width: 300px;
  }
  .wrap-icon {
    margin-bottom: 0;
    cursor: pointer;
  }
}
</style>
