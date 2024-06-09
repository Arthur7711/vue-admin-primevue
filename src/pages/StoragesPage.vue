<template>
  <section :class="{ full: isLoading }" class="storages">
    <a-spin v-if="isLoading" size="large" tip="Loading..." />

    <h2 v-else-if="total === 0">Storages not found</h2>

    <template v-else>
      <a-row type="flex" :gutter="16" class="storages__top">
        <a-col flex="0 1 25%" class="storages-search">
          <a-select
            v-model:value="searchParams.search"
            class="storages-search__input"
            :loading="isLoadingSearch"
            :filter-option="filterOption"
            placeholder="search for build"
            show-search
            allow-clear
            :bordered="false"
            @search="onSearch"
            @change="changeBranch"
          >
            <template v-if="searchOptions">
              <a-select-option
                v-for="item in searchOptions"
                :key="item.id"
                :value="item.id"
                :label="item.name"
                :title="`${item.branch_id} ${item.storage_id}`"
              >
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-col>

        <a-col class="storage-details">
          <a-dropdown
            :trigger="['click']"
            class="storages-dropdown storages-dropdown_1"
          >
            <button class="storages-dropdown__btn">
              <span>projects:</span>
              {{
                searchParams.projects.length === selectProjects.length
                  ? "all"
                  : "custom"
              }}
              <span class="storages-dropdown__arrow triangle"></span>
            </button>
            <template #overlay>
              <simplebar class="project-simple-bar custom-simplebar">
                <a-menu class="storages-dropdown__menu">
                  <div @click.stop>
                    <a-menu-item
                      disabled
                      style="
                        padding: 0;
                        height: auto;
                        line-height: 1.2;
                        margin-bottom: 10px;
                      "
                    >
                      <a-checkbox
                        v-model:checked="state.checkAllProjects"
                        :indeterminate="state.indeterminateProjects"
                        @change="onCheckAllProjects"
                        @click.stop
                      >
                        all projects
                      </a-checkbox>
                    </a-menu-item>
                  </div>
                  <a-checkbox-group
                    v-model:value="searchParams.projects"
                    @change="changedProjects"
                  >
                    <div
                      v-for="item in selectProjects"
                      :key="item"
                      class="storages-dropdown__item"
                      @click.stop
                    >
                      <a-checkbox :value="item.name">
                        <span
                          class="storages-dropdown__project"
                          :style="`background-color: ${item.color}`"
                          >{{ item.name }}</span
                        >
                      </a-checkbox>
                    </div>
                  </a-checkbox-group>
                </a-menu>
              </simplebar>
            </template>
          </a-dropdown>
          <a-dropdown
            :trigger="['click']"
            class="storages-dropdown storages-dropdown_1"
          >
            <button class="storages-dropdown__btn">
              <span>storages:</span>
              {{ searchParams.storages.length === total ? "all" : "custom" }}
              <span class="storages-dropdown__arrow triangle"></span>
            </button>
            <template #overlay>
              <a-menu class="storages-dropdown__menu">
                <a-menu-item disabled style="padding: 0; margin-bottom: 10px">
                  <a-checkbox
                    v-model:checked="state.checkAllStorages"
                    :indeterminate="state.indeterminateStorages"
                    @change="onCheckAllStorages"
                  >
                    all storages
                  </a-checkbox>
                </a-menu-item>
                <a-checkbox-group
                  v-model:value="searchParams.storages"
                  @change="changedStorages"
                >
                  <div
                    v-for="item in storages"
                    :key="item?.id"
                    class="storages-dropdown__item"
                  >
                    <a-checkbox :value="item.id">{{
                      item.shortname
                    }}</a-checkbox>
                  </div>
                </a-checkbox-group>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown :trigger="['click']" class="storages-dropdown">
            <button class="storages-dropdown__btn">
              <span>status:</span>
              {{
                searchParams.statuses.length === 3
                  ? "all"
                  : searchParams.statuses.length === 1
                  ? searchParams.statuses[0]
                  : searchParams.statuses.length > 1
                  ? "custom"
                  : ""
              }}
              <span class="storages-dropdown__arrow triangle"></span>
            </button>
            <template #overlay>
              <a-menu class="storages-dropdown__menu">
                <a-menu-item disabled style="padding: 0; margin-bottom: 10px">
                  <a-checkbox
                    v-model:checked="state.checkAllStates"
                    :indeterminate="state.indeterminateStatuses"
                    @change="onCheckAllStatuses"
                  >
                    all
                  </a-checkbox>
                </a-menu-item>
                <a-checkbox-group
                  v-model:value="searchParams.statuses"
                  @change="changedStatus"
                >
                  <div
                    v-for="item in statuses"
                    :key="item?.id"
                    class="storages-dropdown__item"
                  >
                    <a-checkbox :value="item.id">{{
                      item.shortname
                    }}</a-checkbox>
                  </div>
                </a-checkbox-group>
              </a-menu>
            </template>
          </a-dropdown>
          <CreateStorage :statuses="options" />
        </a-col>
      </a-row>
      <StoragesDiagram
        :items="filterStorages"
        :storage-max="storageMax"
        :storage-coordinates="storageCoordinates"
        :checked-projects="searchParams.projects"
        :active-branch="activeBranch"
        :options="options"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive, computed, onBeforeUnmount } from "vue";
import utils from "@/utils";
import StoragesDiagram from "@/components/Storages/StoragesDiagram.vue";
import CreateStorage from '@/components/Storages/CreateStorage.vue'
import {
  IStorage,
  IStorageProject,
  IStorageBranch,
  TActiveBranch,
} from "@/API/models/storages";
import {
  getAdminStorages,
  getAdminStoragesBranches,
  getAdminStoragesProjects,
} from "@/API/storages";
import { getAdminBuilds } from "@/API/builds";
import { getStorageStatuses } from "@/API/branches";

const isLoading = ref(true);
const isLoadingSearch = ref(false);
const timeOutSearch = ref();
const storages = ref<IStorage[]>([]);
const projects = ref<IStorageProject[]>([]);
const branches = ref<IStorageBranch[]>([]);
const activeBranch = ref<TActiveBranch | null>(null);
const total = ref(0);
const searchOptions = ref([]);
const changeBy = ref<"storages" | "statuses">("storages");
const options = ref<{ value: string; label: string }[]>([]);
const searchParams = reactive<{
  search: null | { [key: string]: number | string };
  storages: number[];
  projects: string[];
  statuses: string[];
}>({
  search: null,
  storages: [],
  projects: [],
  statuses: ["active"],
});

const state = reactive({
  indeterminateProjects: false,
  checkAllProjects: true,
  indeterminateStorages: false,
  checkAllStorages: true,
  indeterminateStatuses: true,
  checkAllStates: false,
});
const statuses = [
  { id: "new", shortname: "new" },
  { id: "active", shortname: "active" },
  { id: "archive", shortname: "archive" },
];
const storageMax = computed(() => {
  const arr = storages.value.map((item) => item.free + item.used);
  return Math.ceil(utils.bytesConversion(Math.max(...arr), 4));
});
const storageCoordinates = computed(() => {
  const arr = [];
  const part = +(storageMax.value / 4).toFixed();
  for (let idx = 1; idx < 5; idx++) {
    arr.push(idx * part);
  }

  return arr;
});
const selectProjects = computed(() =>
  projects.value.reduce((acc, curr) => {
    const findEl = acc.find((item) => item.project_id === curr.project_id);
    if (!findEl) acc.push(curr);
    return acc;
  }, [])
);
const filterStorages = computed(() => {
  if (changeBy.value === "storages")
    return storages.value.filter((item) =>
      searchParams.storages.includes(item.id)
    );
  return storages.value;
});

const onCheckAllProjects = (e: any) => {
  state.indeterminateProjects = false;
  searchParams.projects = e.target.checked
    ? selectProjects.value.map((item) => item.name)
    : [];
};
const changedProjects = () => {
  state.indeterminateProjects =
    !!searchParams.projects.length &&
    searchParams.projects.length < selectProjects.value.length;
  state.checkAllProjects =
    searchParams.projects.length === selectProjects.value.length;
};

const onCheckAllStorages = (e: any) => {
  state.indeterminateStorages = false;
  searchParams.storages = e.target.checked
    ? storages.value.map((item) => item.id)
    : [];
  changeBy.value = "storages";
};

const changedStorages = () => {
  state.indeterminateStorages =
    !!searchParams.storages.length &&
    searchParams.storages.length < total.value;
  state.checkAllStorages = searchParams.storages.length === total.value;
  changeBy.value = "storages";
};
const onCheckAllStatuses = (e: any) => {
  state.indeterminateStatuses = false;
  searchParams.statuses = e.target.checked
    ? statuses.map((item) => item.id)
    : [];
  getStorages(true);
};
const changedStatus = () => {
  state.indeterminateStatuses =
    !!searchParams.statuses.length && searchParams.statuses.length < 3;
  state.checkAllStates = searchParams.statuses.length === 3;
  getStorages(true);
};

const filterOption = (input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase());

const getStorages = async (isUpdate?: boolean) => {
  try {
    const { items, total: count } = await getAdminStorages({
      limit: -1,
      filters: JSON.stringify(
        searchParams.statuses?.map((el) => ({ column: "status", value: el, option: "or" }))
      ),
    });

    storages.value = items;
    total.value = count;
    changeBy.value = "statuses";
    searchParams.storages = storages.value?.map((item) => item.id);

    if (isUpdate) {
      pushProjectToStorage();
      pushBranchToProject();
    }
  } catch (e) {}
};

const getStoragesProjects = async () => {
  try {
    const { items } = await getAdminStoragesProjects({ limit: -1 });
    projects.value = items;
    pushProjectToStorage();
  } catch (e) {}
};

const getStoragesBranches = async () => {
  try {
    const { items } = await getAdminStoragesBranches({ limit: -1 });
    branches.value = items;
    pushBranchToProject();
  } catch (e) {}
};

const onSearch = (search: string) => {
  isLoadingSearch.value = true;
  clearTimeout(timeOutSearch.value);
  timeOutSearch.value = setTimeout(async () => {
    try {
      const { items } = await getAdminBuilds({
        limit: 20,
        filters: JSON.stringify([
          {
            column: "name",
            value: search?.trim(),
            operator: "like_both",
          },
        ]),
      });

      searchOptions.value = items;
    } catch (e) {
    } finally {
      isLoadingSearch.value = false;
    }
  }, 800);
};

const changeBranch = (val, option) => {
  if (val) {
    const [branch_id, storage_id] = option.title.split(" ");
    activeBranch.value = {
      id: +branch_id,
      storage_id: +storage_id,
    };
  } else {
    activeBranch.value = null;
    searchOptions.value = [];
  }
};

const pushProjectToStorage = () => {
  const arr = storages.value;
  projects.value.forEach((project) => {
    if (project.total_size > 0) {
      const idx = arr.findIndex((storage) => storage.id === project.storage_id);
      if (idx > -1) {
        const percent =
          (project.total_size / (arr[idx].free + arr[idx].used)) * 100;
        if (percent >= 1) {
          if (!arr[idx].projects) arr[idx].projects = [];
          arr[idx].projects.push({ ...project, percent: Math.round(percent) });
        } else {
          if (!arr[idx].other_projects) arr[idx].other_projects = [];
          arr[idx].other_projects.push({
            ...project,
            percent: Math.round(percent),
          });
        }
      }
    }
  });

  storages.value = arr;
};

const pushBranchToProject = () => {
  const arr = storages.value;
  branches.value.forEach((branch) => {
    const idx = arr.findIndex((storage) => storage.id === branch.storage_id);
    if (idx > -1) {
      const projectIdx = arr[idx].projects?.findIndex(
        (project) => project.project_id === branch.project_id
      );
      if (projectIdx > -1) {
        if (!arr[idx].projects[projectIdx].branches) {
          arr[idx].projects[projectIdx].branches = [];
        }

        arr[idx].projects[projectIdx].branches.push(branch);
      } else {
        const otherProjectIdx = arr[idx].other_projects?.findIndex(
          (project) => project.project_id === branch.project_id
        );

        if (otherProjectIdx > -1) {
          if (!arr[idx].other_projects[otherProjectIdx].branches) {
            arr[idx].other_projects[otherProjectIdx].branches = [];
          }

          arr[idx].other_projects[otherProjectIdx].branches.push(branch);
        }
      }
    }
  });

  storages.value = arr;
};

onMounted(async () => {
  document.body.classList.add("hide-scroll");
  document.querySelector("html")?.classList.add("hide-scroll");
  try {
    await getStorages();
    await getStoragesProjects();
    await getStoragesBranches();

    searchParams.projects = selectProjects.value.map((item) => item.name);
    // searchParams.storages = storages.value.map((item) => item.id);

    const { items } = await getStorageStatuses();
    options.value = items.map((el) => ({ label: el, value: el }));
  } catch (e) {
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  document.body.classList.remove("hide-scroll");
  document.querySelector("html")?.classList.remove("hide-scroll");
});
</script>

<style lang="scss" scoped>
.project-simple-bar {
  min-width: 280px;
  max-height: 300px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.storages {
  height: calc(100vh - 64px);

  &__top {
    padding: 24px 20px 70px;
    margin: 0 !important;
    justify-content: space-between;
    .storage-details{
      display: flex;
    }
  }

  &-search {
    label {
      display: flex;
      align-items: center;
    }

    &__icon {
      margin-right: 8px;
      padding-top: 4px;
      font-size: 18px;
      cursor: pointer;
    }

    &__input {
      width: 100%;
      border-bottom: 1px solid #e3e3e3;
    }
  }

  &-dropdown {
    &_1 {
      margin-right: 30px;
    }

    &__btn {
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
      gap: 5px;
      background-color: transparent;
      min-width: 128px;
      border: none;
      cursor: pointer;
    }

    &__menu {
      padding: 18px;
      overflow-y: auto;
    }

    &__item {
      &:not(:last-child) {
        margin-bottom: 10px;
        font-family: "Source Sans Pro";
      }

      .storages-dropdown__project {
        padding: 0 6px;
        border-radius: 5px;
      }
    }
  }
}
</style>
