<script setup lang="ts">
import { ref, watch, onMounted, reactive, computed } from 'vue';
import { getAdminDownloadHistory } from '@/API/users';
import { IHistoryItem } from '@/API/models/users';
import { format } from 'date-fns';
// import { getAdminProjects } from '@/API/projects';
import { IBranch } from '@/API/models/branches';
import { getAdminBranches } from '@/API/branches';
import utils from '@/utils';
import { FilterCogIcon, ArrowTopRightIcon } from 'mdi-vue3';
import AppPagination from '@/components/UI/AppPagination.vue';
import AppSelect from '@/components/UI/AppSelect.vue';
import TableDatePicker from '@/components/Table/TableDatePicker.vue';
import formatTime from '@/utils/formatTime';
import { useRoute } from 'vue-router';
import { COLORS, columns } from './constants';
import SelectIcon from '../icons/SelectIcon.vue';
import useUserStore from '@/store/user';

const props = defineProps<{
  ids: number[];
  install_ids: string[];
  userId: number;
}>();
const { query } = useRoute();
const params = reactive({
  with: ['build.branch', 'connection.staff'],
  appends: ['last_event'],
  limit: 25,
  page: 1,
  'sort[property]': 'created_at',
  'sort[direction]': 'desc',
});

const selects = reactive<{
  project?: number;
  branch?: number;
}>({
  project: undefined,
  branch: undefined,
});
const searches = reactive({
  project: '',
  branch: '',
  build_name: '',
  start_date: [null, null],
});
const isLoading = ref(true);
const isLastConnections = ref(false);
const projects = ref<{ id: number; name: string }[]>([]);
const branches = ref<IBranch[]>([]);
const tableData = ref<IHistoryItem[]>([]);
const list = ref<{ checked: boolean; value: string | number }[]>([]);
const selectedModal = ref<(string | number)[]>([]);
const timeout = ref<ReturnType<typeof setTimeout> | null>(null);
const timeoutConnections = ref<ReturnType<typeof setTimeout> | null>(null);
const isSelectedAll = ref(true);

const isAccessBuilds = computed(() => useUserStore.self.value?.menus?.find(i => i.name === 'builds'))
const isAccessBranches = computed(() => useUserStore.self.value?.menus?.find(i => i.name === 'branches'))

// const getProjects = async () => {
//   try {
//     if (searches.project) {
//       if (timeout.value) clearTimeout(timeout.value);
//       timeout.value = setTimeout(async () => {
//         const { items } = await getAdminProjects({
//           limit: 5,
//           name: searches.project,
//         });
//         projects.value = items;
//       }, 500);
//     } else {
//       const { items } = await getAdminProjects({ limit: 5 });
//       projects.value = items;
//     }
//   } catch (e) {}
// };
const searchProjects = () => {
  const reservProjects =
    useUserStore.self.value?.projects.map((el) => {
      return { id: el.id, name: el.name };
    }) || [];
  if (searches.project) {
    if (timeout.value) clearTimeout(timeout.value);
    timeout.value = setTimeout(async () => {
      projects.value = reservProjects.filter(el=>el.name.toLowerCase().includes(searches.project.toLowerCase()));
    }, 500);
  } else {
    projects.value = reservProjects;
  }
};
const getBranches = async (): Promise<void> => {
  try {
    if (searches.branch) {
      if (timeout.value) clearTimeout(timeout.value);
      timeout.value = setTimeout(async () => {
        const { items } = await getAdminBranches({
          limit: 5,
          filters: JSON.stringify([
            {
              column: 'name',
              value: searches.branch,
              operator: 'like_both',
            },
          ]),
        });
        branches.value = items;
      }, 500);
    } else {
      const { items } = await getAdminBranches({
        limit: 5,
      });
      branches.value = items;
    }
  } catch (e) {}
};
const getList = async (isNextPage?: boolean) => {
  if (timeoutConnections.value) clearTimeout(timeoutConnections.value);
  timeoutConnections.value = setTimeout(async () => {
    const selectedIndexes = selectedModal.value.map((el) =>
      props.install_ids.findIndex((elem) => elem === el)
    );
    const selectedIds = selectedIndexes.map((el) => props.ids?.[el]);

    if (isNextPage) {
      params.page++;
    } else {
      isLoading.value = true;
      params.page = 1;
      if (isLastConnections.value) isLastConnections.value = false;
    }

    const filters = [];

    if (
      searches.start_date &&
      searches.start_date[0] &&
      searches.start_date[1]
    ) {
      filters.push({
        column: 'created_at',
        value: utils.formatDate(searches.start_date[0].$d),
        operator: '>=',
      });
      filters.push({
        column: 'created_at',
        value: utils.formatDate(searches.start_date[1].$d),
        operator: '<=',
      });
      filters.push({ column: 'last_event', value: 'start' });
    }

    if (selects.branch)
      filters.push({ column: 'build.branch_id', value: selects.branch });

    if (selects.project)
      filters.push({
        column: 'build.branch.project_id',
        value: selects.project,
      });

    if (searches.build_name?.trim())
      filters.push({
        column: 'build.name',
        value: searches.build_name.trim(),
        operator: 'like_both',
      });

    if (selectedIds.length)
      filters.push({ column: 'connection_id', value: selectedIds });

    try {
      if (filters.length) {
        const { items, total } = await getAdminDownloadHistory({
          ...params,
          filters: JSON.stringify(filters),
        });
        tableData.value = isNextPage ? tableData.value.concat(items) : items;
        if (total === 0 || total < params.limit) isLastConnections.value = true;
      } else {
        tableData.value = [];
      }

      setTimeout(() => {
        const listItems = document.querySelectorAll(
          '.ant-select-selection-overflow-item'
        );
        for (let i = 0; i < listItems.length - 1; i++) {
          const element = listItems[i];
          element.children[0].setAttribute(
            'style',
            `background: ${
              i <= COLORS.length
                ? COLORS[selectedIndexes[i]]
                : COLORS[selectedIndexes[i % COLORS.length]]
            } !important;border-radius:15px`
          );
        }
      }, 0);
    } catch (e) {
    } finally {
      if (isLoading.value) isLoading.value = false;
      isSelectedAll.value = list.value.every((el) =>
        selectedModal.value.includes(el.value)
      );
    }
  }, 500);
};
const getData = async () => {
  if (query?.install_id) {
    selectedModal.value = [query?.install_id.toString()];
    await getList();
  } else if (props.ids?.length) {
    selectedModal.value = props.install_ids;
    await getList();
  }
  list.value = props.install_ids.map((el) => ({ checked: true, value: el }));
};
const checkAllInstallIds = async () => {
  selectedModal.value = isSelectedAll.value ? [] : props.install_ids;
  await getList();
};
onMounted(async () => {
  Promise.allSettled([getBranches()]).then(() => {
    getData();
  });
  if (useUserStore.self.value?.projects?.length) {
    projects.value = useUserStore.self.value?.projects.map((el) => ({ id: el.id, name: el.name }));
  }
});
watch(
  () => props.userId,
  async () => {
    params.page = 1;
    isLastConnections.value = false;
    tableData.value = [];
    isLoading.value = true;

    selects.project = undefined;
    selects.branch = undefined;
    searches.project = '';
    searches.branch = '';
    searches.build_name = '';
    searches.start_date = [null, null];

    await getData();
  }
);
</script>

<template>
  <div class="download-history">
    <div class="download-history__head">
      <h2>download history</h2>
      <div class="search-box">
        <AppSelect
          v-model:value="selects.project"
          :items="projects"
          class="download-history__select"
          color="#999999"
          item-name="name"
          item-value="value"
          clearable
          max-width="80px"
          placeholder="project: all"
          show-search
          @search="searches.project = $event;searchProjects()"
          @change="getList()"
        />
        <AppSelect
          v-model:value="selects.branch"
          :items="branches"
          class="download-history__select"
          color="#999999"
          item-name="name"
          item-value="value"
          clearable
          max-width="80px"
          placeholder="branches: all"
          show-search
          @search="
            searches.branch = $event;
            getBranches();
          "
          @change="getList()"
        />
      </div>
    </div>
    <div class="download-history-checks">
      <a-select
        v-model:value="selectedModal"
        mode="multiple"
        style="width: 100%"
        placeholder="select connections"
        class="download-history-checks__multiselect"
        @change="getList()"
        show-search
      >
        <template #menuItemSelectedIcon><SelectIcon /> </template>
        <a-select-option value="all" disabled>
          <div class="none-selectable">
            <span>all install ID</span>
            <SelectIcon
              :disabled="!isSelectedAll"
              @click="checkAllInstallIds"
            />
          </div>
        </a-select-option>
        <a-select-option
          v-for="item of list"
          :key="item.value"
          :value="item.value"
          >{{ item.value }}</a-select-option
        >
      </a-select>
    </div>
    <a-table
      class="download-history-table"
      :pagination="false"
      :loading="isLoading"
      :data-source="tableData || []"
      :columns="columns"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'start_date'">
          <TableDatePicker
            v-model="searches[column.key]"
            title="date"
            @change="getList()"
          >
            <template #icon>
              <FilterCogIcon
                class="select-icon"
                :class="{
                  active:
                    searches[column.key]?.length === 2 &&
                    searches[column.key][0] &&
                    searches[column.key][1],
                }"
              />
            </template>
          </TableDatePicker>
        </template>

        <template v-else-if="column.key === 'build'">
          <a-input
            v-model:value="searches.build_name"
            :placeholder="column.title"
            class="download-history__header-input download-history__header-input__build"
            :bordered="false"
            @input="getList()"
          />
        </template>

        <template v-else>{{ column.title }}</template>
      </template>

      <template #bodyCell="{ text, record, index, column }">
        <p
          v-if="column.key === 'index'"
          class="user-container-table__index"
          :style="{
            background:
              COLORS[ids.findIndex((el) => el == record?.connection_id)],
          }"
        >
          {{ index + 1 }}
          <!-- {{ ids.findIndex((el) => el == record?.connection_id) + 1 }} -->
        </p>

        <p v-else-if="column.key === 'start_date'" style="white-space: nowrap">
          {{ format(new Date(text), 'yyyy-MM-dd') }}
        </p>

        <template v-else-if="column.key === 'build'">
          <router-link
            v-if="isAccessBuilds"
            :to="`/builds?id=${text?.id}&operator=!=@`"
            class="download-history-table__build more-info"
            :title="text?.name"
          >
            <ArrowTopRightIcon class="arrow-top-right" />
            {{ text?.name }}
          </router-link>
          <template v-else>{{ text?.name }}</template>
        </template>

        <template v-else-if="column.key === 'branch'">
          <a-tooltip>
            <template #title>{{ record?.build?.branch?.project?.name }}</template>
            <router-link
              v-if="isAccessBranches"
              :to="`/branches?id=${record?.build?.branch?.id}`"
              class="download-history-table__branch more-info"
            >
              <ArrowTopRightIcon class="arrow-top-right" />
              {{ record?.build?.branch?.name }}
            </router-link>
            <template v-else>{{ record?.build?.branch?.name }}</template>
          </a-tooltip>
        </template>
        <!-- <div
          class="user-container-table__link"
          v-else-if="column.key === 'delivery_link'"
        >
          <DeliveryLink />
        </div> -->

        <div v-else-if="column.key === 'download_time'">
          {{ formatTime(record.download_time) }}
        </div>
        <div v-else-if="column.key === 'install_id'">
          {{ record?.connection?.install_id }}
        </div>
      </template>
    </a-table>

    <AppPagination
      v-if="tableData?.length && !isLastConnections"
      center
      @intersect="getList(true)"
    />
  </div>
</template>

<style scoped lang="scss">
.download-history {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(100dvh - 232px);
  width: 100%;
  min-width: 710px;
  position: sticky;
  top: 0;
  margin-right: 10px;
  border: 1px solid #e3e3e3;
  padding: 20px 10px;
  border-radius: 10px;
  @include custom-scroll(5px);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    h2 {
      margin-bottom: 0;
      line-height: 1;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;

      :deep(.download-history__select) {
        .ant-select-arrow {
          display: none;
        }
      }
    }
  }

  p {
    margin: 0;
  }

  &-checks {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: nowrap;
    margin-bottom: 10px;
    position: relative;

    &__multiselect :deep(.ant-select-selector) {
      border: none;
      border-bottom: 1px solid #e3e3e3;
      .ant-select-selection-overflow {
        line-height: 5ex;
        max-height: 12.5ex;
        overflow: auto;
        @include custom-scroll(5px);
      }

      // .ant-select-selection-search{
      //   display: none;
      // }
    }

    label {
      display: flex;
      align-items: center;
      gap: 8px;

      input {
        width: 16px;
        height: 16px;
      }

      p {
        margin: 0;
        font-size: 16px;
        line-height: 20px;
        padding: 0 6px 0 6px;
        border-radius: 5px;
      }
    }
  }

  &__header-input {
    padding-left: 0;
    padding-bottom: 0;
    border-bottom: 1px solid #e3e3e3;
  }

  &-table {
    padding: 0;
    margin: 0;

    &:deep(.ant-table-thead) {
      position: sticky;
      top: -20px;
      background-color: #fff;
      z-index: 1;
    }
    &:deep(.ant-table-tbody) {
      min-height: 10vh;
    }

    .more-info {
      position: relative;
      padding-right: 5px;
      width: max-content;
      white-space: nowrap;
    }

    :global(.ant-table-thead .ant-table-cell) {
      font-size: 14px;
      font-weight: 400;
      line-height: 18px;
      color: $main-grey;
      padding: 5px 10px;
      white-space: nowrap;
    }

    :deep(thead th:first-child) {
      padding-left: 16px;
    }

    tbody {
      td {
        color: #1a1a1a;
        font-size: 16px;
        padding: 0 !important;
      }
    }

    :deep(.ant-table-tbody > tr > td) {
      padding: 5px 10px;
    }

    &__index {
      font-size: 16px;
      font-weight: 600;
      padding: 0;
      color: #000;
      width: 20px;
      height: 20px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: nowrap;
    }

    &__link {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: nowrap;
    }

    & :deep(.ant-table-cell:has(.download-history__header-input__build)) {
      width: 250px;
    }

    &__build {
      position: relative;
      display: block;
      width: 250px !important;
      @include sliceText();
      @include hover-link();

      span {
        position: absolute;
        top: 0;
        right: 0;

        svg {
          width: 15px;
        }
      }
    }

    &__branch {
      @include hover-link();
    }
  }

  &__no-data {
    font-size: 40px;
  }
}
.none-selectable {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 8px;
  cursor: default;
  svg {
    cursor: pointer;
  }
}
:global(.ant-select-dropdown-placement-bottomLeft) {
  border-radius: 10px;
}
// :global(.ant-select-item-option-active) {
//   display: none;
// }
</style>
