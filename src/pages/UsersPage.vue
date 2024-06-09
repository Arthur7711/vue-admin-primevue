<template>
  <section class="main-content">
    <div class="user-content">
      <div class="user-content__header">
        <div class="title">
          <h1 @click="clearFilters">users</h1>
          <AppSelect
            v-model:value="selectedUsersType"
            :bordered="false"
            :open="isOpen"
            :items="usersType"
            item-name="name"
            item-value="id"
            class="user_page_sort"
            dropdown-class-name="user_dropdown"
            :disabled="!isAdmin"
            @change="changedUsersType(true)"
          />
        </div>
        <div class="filters">
          <label for="search">
            <SearchIcon />
            <input
              id="search"
              v-model="filterData.search"
              placeholder="search by name"
              autocomplete="off"
            />
          </label>
          <a-dropdown
            v-if="selectedUsersType === 0"
            :trigger="['click']"
            class="user-branches projects-dropdown"
          >
            <button class="user-branches__btn">
              <span>project:</span>
              {{
                selectedProjects.length === projects.length
                  ? 'all'
                  : selectedProjects.length
                    ? 'custom'
                    : 'empty'
              }}
              <span><FilterCogIcon class="select-icon" /></span>
            </button>
            <template #overlay>
              <a-menu class="user-branches__menu">
                <a-menu-item  disabled style="padding: 0; margin-bottom: 8px;" @click.stop>
                  <a-input-search
                    v-model:value.trim="searchProjects"
                    placeholder="search projects"
                    style="width: 200px;"
                    allow-clear
                  />
                </a-menu-item>
                <div class="user-branches__item">
                  <AppCheckbox
                    v-model="state.checkAllProjects"
                    name="all"
                    small
                    :indeterminate="isIndeterminateProjects"
                    @change="checkAllProjects"
                  />
                </div>
                <div
                  v-for="item in filterProjects"
                  :key="`${item?.id}${selectedProjects.length}`"
                  class="user-branches__item"
                >
                  <AppCheckbox
                    :name="item.name"
                    :value="item.id"
                    :checked="selectedProjects.includes(item.id)"
                    small
                    @click="changedProjects(item.id)"
                  />
                </div>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown :trigger="['click']" class="user-branches">
            <button class="user-branches__btn">
              <span>branches:</span>
              {{
                selectedBranches.length === branches.length
                  ? 'all'
                  : selectedBranches.length
                    ? 'custom'
                    : 'empty'
              }}
              <span><FilterCogIcon class="select-icon" /></span>
            </button>
            <template #overlay>
              <a-menu class="user-branches__menu">
                <a-menu-item disabled style="padding: 0; margin-bottom: 8px;" @click.stop>
                  <a-input-search
                    v-model:value="searchBranches"
                    placeholder="search branches"
                    style="width: 200px;"
                    allow-clear
                  />
                </a-menu-item>
                <div class="user-branches__item">
                  <AppCheckbox
                    v-model="state.checkAllBranches"
                    name="all"
                    small
                    :indeterminate="isIndeterminateBranches"
                    @change="setIsCheckedAllBranches"
                  />
                </div>
                <div
                  v-for="item in filterBranches"
                  :key="`${item?.id}${selectedBranches.length}`"
                  class="user-branches__item"
                >
                  <AppCheckbox
                    :name="item.name"
                    :value="item.id"
                    :checked="selectedBranches.includes(item.id)"
                    small
                    @click="changedBranches(item.id)"
                  />
                </div>
              </a-menu>
            </template>
          </a-dropdown>
          <AppSelect
            v-model:value="selectedOption"
            :bordered="false"
            :open="isOpen"
            :items="options"
            item-name="title"
            item-value="id"
            class="user_page_sort"
            dropdown-class-name="user_dropdown"
            :disabled="selectedUsersType === 1"
            @change="
              isOpen = !isOpen;
              getDetails(false, true);
            "
            @click="isOpen = !isOpen"
          />
        </div>
      </div>
      <div class="user-content-body">
        <div class="user-content-body__tables">
          <a-spin v-if="isLoading" size="large" />
          <UserTable
            v-if="selectedUsersType === 0"
            v-for="dataSource in selfs"
            :id="dataSource.id"
            :key="dataSource.id"
            :image="`${getAvatar(80, dataSource.samaccountname)}`"
            :title="dataSource.displayname"
            :data-source="dataSource.connections"
            :selected="selectedUserId"
            @select="selectedUserId = $event"
          />
          <InactiveUserCard
            v-if="selectedUsersType === 1"
            v-for="dataSource in inactiveUsers"
            :key="dataSource.id"
            :data-source="dataSource"
            @select="selectedUserId = $event"
          />
          <AppPagination
            v-if="isShowMore && isListLength"
            center
            @intersect="isLoadingMore = true"
          />
        </div>
        <DownloadHistory
          v-if="selectedUserId"
          :ids="getIdsByKey('id')"
          :install_ids="getIdsByKey('install_id')"
          :user-id="selectedUserId"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  reactive,
  watch,
  computed,
  onBeforeUnmount
} from 'vue';
import UserTable from '@/components/Users/UserTable.vue';
import SearchIcon from '@/components/icons/SearchIcon.vue';
import DownloadHistory from '@/components/Users/DownloadHistory.vue';
import { getAdminStaff, getAdminUnusedStaff } from '@/API/users';
import { IStaff, IUnusedUser } from '@/API/models/users';
import getAvatar from '@/utils/getAvatar';
import AppPagination from '@/components/UI/AppPagination.vue';
import { useRoute, useRouter } from 'vue-router';
import useUserStore from '@/store/user';
import { getAdminBranches } from '@/API/branches';
import { FilterCogIcon } from 'mdi-vue3';
import AppSelect from '@/components/UI/AppSelect.vue';
import InactiveUserCard from '@/components/Users/InactiveUserCard.vue';
import AppCheckbox from '@/components/UI/AppCheckbox.vue';

const options = [
  { id: 'displayname', title: 'name: A-Z' },
  { id: 'connections.ping_at', title: 'activity: long ago first' },
  // { id: "3", title: "number of clients: less first" },
  // { id: "4", title: "number of clients: more first" },
];
const route = useRoute();
const router = useRouter();
const usersType = [
  { id: 0, name: 'active users' },
  { id: 1, name: 'inactive users' },
];
const timeout = ref<ReturnType<typeof setTimeout> | null>();
const selectedOption = ref<'connections.ping_at' | 'displayname'>('displayname');
const selectedUsersType = ref(0);
const isOpen = ref(false);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const selectedUserId = ref(0);
const selfs = ref<null | IStaff[]>(null);
const inactiveUsers = ref<null | IUnusedUser[]>(null);
const filters = ref<{ [key: string]: any }[]>([]);
const pagination = reactive({
  page: 1,
  total: Infinity,
});
const projects = ref<{ id: number; name: string }[]>([]);
const branches = ref<{ id: number; name: string }[]>([]);
const selectedProjects = ref<number[]>([]);
const selectedBranches = ref<number[]>([]);
const state = reactive({
  indeterminateProjects: false,
  checkAllProjects: true,
  indeterminateBranches: false,
  checkAllBranches: true,
});
const filterData = reactive<{
  search: string;
  selectedProjects: number[];
  selectedBranches: number[];
}>({
  search: '',
  selectedProjects: [],
  selectedBranches: [],
});
const searchBranches = ref('')
const searchProjects = ref('')

const isListLength = computed(() => Boolean(selfs.value?.length));
const isShowMore = computed(() => pagination.page * 15 < pagination.total);
const isAdmin = computed(() => useUserStore.self.value?.permissions.includes('admin'))

const filterProjects = computed(() => {
  return searchProjects.value
    ? projects.value.filter(item => item.name.toLowerCase().includes(searchProjects.value.toLowerCase()))
    : projects.value
})
const isIndeterminateProjects = computed(() => Boolean(selectedProjects.value.length !== projects.value.length && selectedProjects.value.length))

const filterBranches = computed(() => {
  return searchBranches.value
    ? branches.value.filter(item => item.name.toLowerCase().includes(searchBranches.value.toLowerCase()))
    : branches.value
})
const isIndeterminateBranches = computed(() => Boolean(selectedBranches.value.length !== branches.value.length && selectedBranches.value.length))

const clearFilters = () => {
  selectedOption.value = 'displayname';
  filterData.search = '';
};
const checkAllProjects = async () => {
  selectedProjects.value = state.checkAllProjects
    ? projects.value.map((el) => el.id)
    : [];
  await getDetails(false, true);
};
const setIsCheckedAllBranches = () => {
  selectedBranches.value = state.checkAllBranches
    ? branches.value.map((el) => el.id)
    : [];
  selectedUsersType.value ? getInactiveUsersStaff(true) : getDetails(false, true);
};
const getDetails = async (isSelectedId?: boolean, isCheckEmptyArray?: boolean) => {
  try {
    isLoading.value = true;
    filters.value = [];
    if (filterData.search) {
      filters.value = [
        ...filters.value,
        ...[
          {
            column: 'displayname',
            value: filterData.search,
            operator: 'like_both',
            // option: 'or',
          },
          // {
          //   column: 'connections.ping_at',
          //   value: filterData.search,
          //   operator: 'like_both',
          //   option: 'or',
          // },
          // will remove later soon it can be used
          // {
          //   column: 'connections.install_id',
          //   value: filterData.search,
          //   operator: 'like_both',
          //   option: 'or',
          // },
        ],
      ];
    }

    if (selectedProjects.value.length && selectedProjects.value.length !== projects.value.length) {
      filters.value.push({
        column: 'connections.connectionDownloadLog.build.branch.project_id',
        value: selectedProjects.value,
      });
    } else if (isCheckEmptyArray && selectedProjects.value.length === 0) {
      filters.value.push({
        column: 'connections.connectionDownloadLog.build.branch.project_id',
        value: []
      });
    }
    if (selectedBranches.value.length && selectedBranches.value.length !== branches.value.length) {
      filters.value.push({
        column: 'connections.connectionDownloadLog.build.branch.id',
        value: selectedBranches.value,
      });
    } else if (isCheckEmptyArray && selectedBranches.value.length === 0) {
      filters.value.push({
        column: 'branches.id',
        value: []
      });
    }

    if (isSelectedId) {
      filters.value = [
        {
          column: 'id',
          value: route.query?.id,
        },
      ];
    }

    pagination.page = 1;
    const data = await getAdminStaff({
      with: ['connections.ipCountry'],
      'sort[property]': selectedOption.value,
      'sort[direction]': 'asc',
      filters: JSON.stringify(filters.value),
    });
    pagination.total = data.total;
    selfs.value = data.items;
    isLoading.value = false;
    selectedUserId.value = 0;
  } catch (error) {
    console.log(error);
  }
};
const getInactiveUsersStaff = async (isCheckEmptyArray?: boolean) => {
  try {
    isLoading.value = true;
    filters.value = [];
    pagination.page = 1;
    if (filterData.search) {
      filters.value.push({
        column: 'displayname',
        value: filterData.search,
        operator: 'like_both',
      });
    }
    if (
      selectedBranches.value.length &&
      selectedBranches.value.length !== branches.value.length
    ) {
      filters.value.push({
        column: 'branches.id',
        value: selectedBranches.value
      });
    } else if (isCheckEmptyArray && selectedBranches.value.length === 0) {
      filters.value.push({
        column: 'branches.id',
        value: []
      });
    }
    const data = await getAdminUnusedStaff({
      page: pagination.page,
      filters: JSON.stringify(filters.value),
    });
    pagination.total = data.total;

    inactiveUsers.value = data.items.map((unusedUser) => {
      const { id, displayname, samaccountname } = unusedUser
      const newUser: IUnusedUser = { id, displayname, samaccountname }

      if (unusedUser.branches.length) {
        newUser.table = unusedUser.branches.map(el => ({
          id: el.id,
          name: el.name,
          project_name: unusedUser.assigned_roles.find(project => project.project_id === el.project_id)?.project_name ?? ''
        }))
      } else {
        newUser.assigned_roles = unusedUser.assigned_roles
      }

      return newUser
    })
    isLoading.value = false;
    selectedUserId.value = 0;
  } catch (error) {}
};
const getMoreDetails = async () => {
  try {
    if (pagination.page * 15 < pagination.total) {
      pagination.page++;
      const data = await getAdminStaff({
        with: ['connections.ipCountry'],
        'sort[property]': selectedOption.value,
        'sort[direction]': 'asc',
        filters: JSON.stringify(filters.value),
        page: pagination.page,
      });

      pagination.total = data.total;
      if (selfs.value) {
        selfs.value = [...selfs.value, ...data.items];
      }
    }
  } catch (error) {
    console.log(error);
  }
};
const getMoreInactiveDetails = async () => {
  try {
    if (pagination.page * 15 < pagination.total) {
      pagination.page++;
      const data = await getAdminUnusedStaff({
        filters: JSON.stringify(filters.value),
        page: pagination.page,
      });

      pagination.total = data.total;
      if (inactiveUsers.value) {
        inactiveUsers.value = [
          ...inactiveUsers.value,
          ...data.items.map((unusedUser) => {
            return {
              id: unusedUser.id,
              displayname: unusedUser.displayname,
              samaccountname: unusedUser.samaccountname,
              table: unusedUser.branches.map((el) => {
                return {
                  id: el.id,
                  name: el.name,
                  project: unusedUser.assigned_roles.find(
                    (project) => project.project_id === el.project_id
                  )?.project_name,
                };
              }),
            };
          }),
        ];
      }
    }
  } catch (error) {
    console.log(error);
  }
};
const getIdsByKey = (key: string) => {
  if (selectedUserId.value) {
    return (
      selfs.value
        ?.find((el) => el.id === selectedUserId.value)
        ?.connections?.map((el: { [key: string]: any }) => el[key]) || []
    );
  }
  return [];
};
const getBranches = async () => {
  const { items } = await getAdminBranches({ limit: -1 });
  branches.value = items.map((el) => ({ id: el.id, name: el.name }));
  selectedBranches.value = branches.value.map((el) => el.id);
};
const changedBranches = (id: number) => {
  setSelectedBranches(id)
  state.checkAllBranches = selectedBranches.value.length === branches.value.length;
  selectedUsersType.value ? getInactiveUsersStaff(true) : getDetails(false, true)
};
const setSelectedBranches = (id: number) => {
  const idx = selectedBranches.value.findIndex(item => item === id)
  if (idx > -1) { selectedBranches.value.splice(idx, 1) }
  else { selectedBranches.value.push(id) }
}
const changedProjects = (id: number) => {
  setSelectedProjects(id)
  state.checkAllProjects = selectedProjects.value.length === projects.value.length;
  getDetails(false, true);
};
const setSelectedProjects = (id: number) => {
  const idx = selectedProjects.value.findIndex(item => item === id)
  if (idx > -1) { selectedProjects.value.splice(idx, 1) }
  else { selectedProjects.value.push(id) }
}
const changedUsersType = (isCheckEmptyArray?: boolean) => {
  if (selectedUsersType.value === 0) {
    getDetails(false, isCheckEmptyArray);
    if (route.query?.type) router.replace({ query: {} })
  } else {
    selectedOption.value = 'displayname';
    getInactiveUsersStaff(isCheckEmptyArray);
    router.replace({ query: { type: 1 } })
  }
}

watch(
  filterData,
  () => {
    if (timeout.value) clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
      selectedUsersType.value ? getInactiveUsersStaff(true) : getDetails(false, true);
    }, 800);
  },
  { deep: true }
);
watch(isLoadingMore, async () => {
  if (isLoadingMore.value && !selectedUsersType.value) {
    await getMoreDetails();
    isLoadingMore.value = false;
  }
  if (isLoadingMore.value && selectedUsersType.value) {
    await getMoreInactiveDetails();
    isLoadingMore.value = false;
  }
});
watch(selectedUserId, async () => {
  if (selectedUserId.value === 0 && route.query?.id) {
    await router.replace({ query: {} });
    await getDetails(false, true);
  }
});

onMounted(async () => {
  document.body.classList.add('hide-scroll');
  document.querySelector('html')?.classList.add('hide-scroll');

  if (route.query.type) {
    selectedUsersType.value = 1
  }

  Promise.all([
    new Promise((resolve) => {
      if (route.query.type) {
        selectedUsersType.value = 1
        changedUsersType()
      } else {
        getDetails(Boolean(route.query?.id))
      }
      resolve()
    }),
    getBranches()
  ]).finally(() => {
    if (useUserStore.self.value?.projects?.length) {
      projects.value = useUserStore.self.value?.projects.map((el) => ({ id: el.id, name: el.name }));
    }
    selectedProjects.value = projects.value.map((el) => el.id);
    selectedUserId.value = route.query?.id ? Number(route.query?.id) : 0;
  });
});

onBeforeUnmount(() => {
  if (timeout.value) clearTimeout(timeout.value);
  document.body.classList.remove('hide-scroll');
  document.querySelector('html')?.classList.remove('hide-scroll');
});
</script>

<style lang="scss" scoped>
.user-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  background: #fff;
  position: relative;

  @include custom-scroll();
  &__header {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .title {
      display: flex;
      align-items: flex-start;
      h1 {
        font-size: 24px;
        font-weight: 700;
        line-height: 30px;
        color: $text-black;
        cursor: pointer;
      }
    }
    .filters {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 28px;
    }
    label {
      position: relative;
      display: flex;
      align-items: center;
      border: 1px solid $border-gray;
      min-width: 330px;
      width: 330px;
      height: 32px;
      padding: 20px 15px;
      border-radius: 10px;
      gap: 12px;
      input {
        border: none;
        outline: none;
        width: 100%;
      }
    }
    .select_items {
      display: flex;
      align-items: center;
      .projects {
        &:deep(.ant-select-arrow) {
          right: 0;
        }
      }
    }
  }

  &-body {
    display: flex;
    align-items: flex-start;
    gap: 56px;
    padding: 0 0 12px 8px;
    margin: 0 -40px 0 -8px;
    height: calc(100dvh - 220px);
    overflow-y: auto;
    @include custom-scroll(8px, 8px);

    &__tables {
      min-width: 740px;
    }
  }
}
.user_page {
  width: max-content !important;
  min-width: max-content !important;
}
.user_page_sort {
  width: max-content !important;
  min-width: 180px !important;
  text-align: right;
  display: flex;
  justify-content: flex-start;
}
.projects-dropdown {
  margin: 0 20px;
}
.user-branches {
  &__btn {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  &__menu {
    max-height: 200px;
    overflow-y: auto;
    padding: 12px 16px;
    @include custom-scroll(8px);
  }
  &__item {
    margin: 0;
    &:not(:last-child) {
      margin-bottom: 4px;
    }
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
    max-width: 14px;
    cursor: pointer;
  }
}
:global(.user_dropdown) {
  padding: 5px 10px;
  border-radius: 7px !important;
}
:global(.user_dropdown .ant-select-item-option) {
  border-radius: 10px !important;
  margin-bottom: 5px;
}
:global(.user_dropdown .ant-select-item-option-selected) {
  background: rgba(102, 102, 102, 0.2) !important;
}
</style>
