<script setup lang="ts">
import {
  reactive,
  onMounted,
  ref,
  watch,
  onBeforeUnmount,
  computed,
} from "vue";
import AppBreadCrumbs from "@/components/UI/AppBreadCrumbs.vue";
import { getAdminDownloadHistory } from "@/API/users";
import { useRoute } from "vue-router";
import { IHistoryItem } from "@/API/models/users";
import { getAdminBuilds } from "@/API/builds";
import AppSelect from "@/components/UI/AppSelect.vue";
import BuildsHistoryTable from "@/components/Builds/BuildsHistoryTable.vue";
import { TPickedColumns } from "@/components/Builds/types";
import { format } from "date-fns";
// import AppPagination from "@/components/UI/AppPagination.vue";

const route = useRoute();
const breadcrumbs = [
  { name: "builds", to: "/builds", disabled: false },
  { name: "download history", to: "", disabled: true },
];
const sortStatuses = [
  {
    id: 0,
    value: "date: recent first",
    property: "id",
    direction: "desc",
  },
  {
    id: 1,
    value: "download t: longer first",
    property: "download_time",
    direction: "desc",
  },
  {
    id: 2,
    value: "download t: shorter first",
    property: "download_time",
    direction: "asc",
  },
];
const filterDefalutPropertie = { column: "build_id", value: route.params?.id };
const selectedStatus = ref(0);
const totalItems = ref(0);
const historyItems = ref<IHistoryItem[]>([]);
const timeout = ref<ReturnType<typeof setTimeout> | null>(null);
const isLoadingMore = ref(false);
const titles = reactive({
  buildName: "",
  branchName: "",
});
const filtersData = reactive<
  Partial<
    | TPickedColumns
    | {
        date: string[] | null[];
      }
  >
>({
  user: "",
  install_id: "",
  ip: "",
  date: [null, null],
});
const filterProperties = reactive([
  { column: "connection.staff.displayname", value: "", operator: "like_both" },
  { column: "connection.install_id", value: "", operator: "like_both" },
  { column: "ip_country.ip_address", value: "", operator: "like_both" },
  { column: "created_at", value: "", operator: ">=" },
  { column: "created_at", value: "", operator: "<=" },
  // { column: "event", value: "" },
]);
const params = reactive({
  with: ["build.branch", "ipCountry", "connection.staff"],
  appends: ["last_event"],
  page: 1,
  limit: 25,
});
const isShowMore = computed(() => totalItems.value >= params.limit);
const isBuildsLength = computed(() => !!historyItems.value.length);
const getFilters = () => {
  Object.entries(filtersData).reduce((acc, current, index) => {
    if (current[1] && current[0] !== "date") {
      filterProperties[index].value = current[1];
    } else if (current[1] && current[0] === "date") {
      filterProperties[3].value = format(current[1][0].$d, "yyyy-MM-dd");
      filterProperties[4].value = format(current[1][1].$d, "yyyy-MM-dd");
      // filterProperties[5].value = "start";
    } else {
      filterProperties[index].value = "";
    }
    return acc;
  }, {});
};
const getBuildInfo = async () => {
  const { items } = await getAdminBuilds({
    with: ["branch"],
    filters: JSON.stringify([{ column: "id", value: route.params?.id }]),
  });
  titles.branchName = items[0]?.branch?.name || "";
  titles.buildName = items[0]?.name || "";
};
const getDownloadHistory = async (addedMore?: boolean) => {
  const filters = filterProperties.filter((propertie) => propertie.value);
  const { items, total } = await getAdminDownloadHistory({
    ...params,
    filters: JSON.stringify(
      filters.length
        ? [...filters, filterDefalutPropertie]
        : [filterDefalutPropertie]
    ),
    "sort[property]": sortStatuses[selectedStatus.value].property,
    "sort[direction]": sortStatuses[selectedStatus.value].direction,
  });

  historyItems.value = addedMore ? [...historyItems.value, ...items] : items;
  totalItems.value = total;
};

onMounted(async () => {
  document.body.classList.add("hide-scroll");
  document.querySelector("html")?.classList.add("hide-scroll");

  try {
    getBuildInfo();
    getDownloadHistory();
  } catch (error) {}
});

onBeforeUnmount(() => {
  document.body.classList.remove("hide-scroll");
  document.querySelector("html")?.classList.remove("hide-scroll");
});

watch(
  [filterProperties, selectedStatus],
  () => {
    if (timeout.value) clearTimeout(timeout.value);
    params.page = 1;
    timeout.value = setTimeout(getDownloadHistory, 800);
  },
  { deep: true }
);
watch(isLoadingMore, async () => {
  if (isLoadingMore.value && totalItems.value >= params.limit) {
    params.page++;
    await getDownloadHistory(true);
  }
  isLoadingMore.value = false;
});
</script>

<template>
  <section class="branch">
    <AppBreadCrumbs :items="breadcrumbs" />
    <div class="main-content">
      <div class="main-content__head">
        <div class="titles">
          <h1>{{ titles.buildName }}</h1>
          <h2>{{ titles.branchName }}</h2>
        </div>
        <AppSelect
          v-model:value="selectedStatus"
          :items="sortStatuses"
          item-value="id"
          item-name="value"
        />
      </div>
        <BuildsHistoryTable
          v-model="filtersData"
          :history-items="historyItems"
          :params="params"
          :total="totalItems"
          :is-show-more="isShowMore"
          :is-builds-length="isBuildsLength"
          @load-more="isLoadingMore=true"
          @update="getFilters()"
        />
    </div>
  </section>
</template>
<style scoped lang="scss">
.main-content {
  min-height: calc(100vh - 100px);
  &__head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 24px;
    .titles {
      h1{
        font-size: 24px;
        font-weight: 700;
      }
      h2 {
        color: #999;
        font-size: 20px;
        font-weight: 700;
      }
    }
    &:deep(.ant-select-selector) {
      max-height: 20px;
    }
  }
}
</style>
