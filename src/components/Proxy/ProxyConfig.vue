<template>
  <div class="config">
    <h2 class="config__title">configuring subscriptions</h2>
    <div class="config__inner">
      <div class="config-select">
        <h3 class="config-select__title">select branches to add to proxy</h3>
        <div class="config-select__inner">
          <div class="config-select-controls">
            <label>
              <a-input-search
                v-model:value="search"
                placeholder="search for branch"
                class="config-select-controls__search search-input"
                :bordered="false"
                allow-clear
                @change="searchBranches"
              />
            </label>

            <div class="config-select-controls__select">
              <a-select
                v-model:value="projectId"
                placeholder="filter by project"
                :open="isOpenSelect"
                show-search
                :filter-option="filterOption"
                @click="isOpenSelect = !isOpenSelect"
                @change="searchBranches"
              >
                <a-select-option
                  v-for="option of branchNames"
                  :key="option.id"
                  :value="option.id"
                  :name="option.name"
                  @click="isOpenSelect = false"
                >
                  {{ option.name }}
                </a-select-option>
              </a-select>
              <button
                v-if="projectId"
                class="config-select-controls__clear"
                @click="projectId = null; searchBranches();"
              >
                <CloseIcon/>
              </button>
            </div>
          </div>

          <div v-if="isSearchLoading" class="config-select__loader">
            <Loader :width="50" />
          </div>
          <span v-else-if="branches.length === 0" class="config-select__empty">
            branches not found
          </span>
          <simplebar v-else class="config-select__simplebar custom-simplebar">
            <div
              v-for="item in branches"
              :key="item.id"
              class="config-select__label"
              @click.stop
            >
              <AppCheckbox
                v-model="checkedBranches"
                :name="`${item.project?.name} : ${item.id} | ${item.name}`"
                :value="item.id"
                :title="`Project: ${item.project?.name}`"
                width="250px"
                @change="putModalValue(item.id)"
              />
              <span class="config-select__town">
                {{ item.storage.shortname }}
              </span>
            </div>
            <AppPagination
              v-if="isShowMore && isBranchesLength"
              center
              @intersect="getBranches(false)"
            />
          </simplebar>
        </div>
      </div>

      <div class="config-list">
        <h3 class="config-list__title">enter branches depth</h3>
        <div class="config-list__top">
          <label>
            <a-input-search
              v-model:value="searchAddedBranches"
              placeholder="search for branch"
              class="config-list__search search-input"
              :bordered="false"
              :disabled="modelValue?.length === 0"
              allow-clear
            />
          </label>
          <div class="config-list__total">
            <span>total</span>
            {{ modelValue?.length }}
          </div>
        </div>

        <simplebar class="config-list__simplebar custom-simplebar">
          <ul
            class="config-list__inner"
            :class="{ empty: filterAddedBranches?.length === 0 }"
          >
            <li v-if="filterAddedBranches?.length === 0">
              selected branches will be here
            </li>

            <template v-else>
              <li
                v-for="item in filterAddedBranches"
                :key="item.branch_id"
                class="config-list__item"
              >
                <div class="config-list__name">
                  <span>{{ item.name }}</span>
                </div>
                <a-input
                  v-model:value="item.depth"
                  class="config-list__depth"
                  :bordered="false"
                  :maxlength="3"
                />
                <DeleteIcon
                  class="config-list__delete-icon"
                  @click="deleteSub(item.branch_id)"
                />
              </li>
            </template>
          </ul>
        </simplebar>
      </div>
    </div>
    <slot />

    <AppConfirm
      v-model="isShowModal"
      centered
      title="confirm branch deletion from proxy subscription"
      :description="deletedSub?.name"
      @cancel="pushDeletedSub"
      @ok="confirmDeleteSub"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import Loader from "@/components/icons/Loader.vue";
import AppPagination from "@/components/UI/AppPagination.vue";
import AppCheckbox from "@/components/UI/AppCheckbox.vue";
import AppConfirm from '@/components/UI/AppConfirm.vue'
import { IProxy, IProxyBranch, IProxySub } from "@/API/models/proxies";
import { IBranch } from "@/API/models/branches";
import { IParams } from "@/API/models";
import { getAdminBranches } from "@/API/branches";
import { DeleteIcon } from "mdi-vue3";
import { getAdminProjects } from "@/API/projects";
import CloseIcon from '@/components/icons/CloseIcon.vue'

const props = defineProps<{
  proxy: IProxy;
  subscriptions?: IProxySub[];
}>();
const router = useRouter();
const emit = defineEmits<{
  (e: "delete-sub", value: number): void;
  (e: "update:modelValue", value: IProxyBranch[]): void;
}>();
const modelValue = defineModel<IProxyBranch[]>({ type: Array, default: [] });

const branchNames = ref<{ name: string; id: number }[]>([]);
const projectId = ref<null | string | number>(null);
const isOpenSelect = ref(false);
const isSearchLoading = ref(true);
const search = ref("");
const searchAddedBranches = ref("");
const checkedBranches = ref<number[]>([]);
const branches= ref<IBranch[]>([]);
const branchesParams = reactive({
  total: 0,
  limit: 15,
  page: 1,
});
const timeout = ref<any>();
const isShowModal = ref(false);
const deletedSub = ref<IProxyBranch | null>(null)

const isShowMore = computed(
  () => branchesParams.limit * branchesParams.page < branchesParams.total
);
const isBranchesLength = computed(() => branches.value.length);
const sortAddedBranches = computed(() => modelValue.value.length
  ? modelValue.value.sort((a: IProxyBranch, b: IProxyBranch) => {
    if (a?.name?.toLowerCase()! < b?.name?.toLowerCase()!) {
      return -1;
    }
    if (a?.name! > b?.name!) {
      return 1;
    }
    return 0;
  })
  : []
)
const filterAddedBranches = computed(() => sortAddedBranches.value.length && searchAddedBranches.value
  ? sortAddedBranches.value.filter((item: IProxyBranch) =>  item.name?.toLowerCase()?.includes(searchAddedBranches.value.toLowerCase()))
  : sortAddedBranches.value
)

const searchBranches = async () => {
  clearTimeout(timeout.value);
  timeout.value = setTimeout(() => {
    isSearchLoading.value = true;
    getBranches(true);
  }, 800);
};

const getBranches = async (isReload: boolean = false) => {
  if (isReload) {
    branches.value = [];
    branchesParams.total = 0;
    branchesParams.page = 1;
  } else {
    branchesParams.page++;
  }

  const filters = []
  const params: IParams = {
    with: ["storage"],
    limit: branchesParams.limit,
    page: branchesParams.page,
    "sort[property]": "project_id",
    "sort[direction]": "asc"
  }

  if (projectId.value) filters.push({ column: "project_id", value: projectId.value })

  if (search.value?.trim()) {
    filters.push({
      column: "name",
      value: search.value.trim(),
      operator: "like_both"
    })
  }

  if (filters.length) params.filters = JSON.stringify(filters)

  try {
    const { items, total } = await getAdminBranches(params);
    branches.value = branches.value.concat(items);
    if (!branchesParams.total) branchesParams.total = total;
  } catch (e) {
  } finally {
    isSearchLoading.value = false;
  }
};

const pushDeletedSub = () => {
  if (!checkedBranches.value.includes(deletedSub.value?.branch_id!)) {
    checkedBranches.value.push(deletedSub.value?.branch_id!)
  }
  deletedSub.value = null
  isShowModal.value = false
}

const confirmDeleteSub = () => {
  emit("delete-sub", deletedSub.value?.id!);
  removeLocalSub(deletedSub.value?.branch_id!)
  deletedSub.value = null
  isShowModal.value = false
}

const removeLocalSub = (id: number) => {
  checkedBranches.value = checkedBranches.value.filter((item) => item !== id);
  filterEnterBranches()
}

const deleteSub = (id: number) => {
  if (props.subscriptions?.length) {
    const sub = props.subscriptions.find((item) => item.branch_id === id);
    if (sub) {
      deletedSub.value = {
        id: sub.id,
        branch_id: sub.branch.id,
        name: sub.branch.name,
        depth: 3
      }
      isShowModal.value = true
    } else removeLocalSub(id)
  } else removeLocalSub(id)
};

const putModalValue = (id: number) => {
  if (checkedBranches.value.includes(id)) {
    const branch = branches.value.find((item) => item.id === id);
    if (branch) {
      const newBranch = {
        branch_id: branch.id,
        name: branch.name,
        depth: 3,
      };
      emit("update:modelValue", modelValue.value.concat(newBranch));
    }
  } else if (modelValue.value.length) {
    deleteSub(id);
  }
};

const filterEnterBranches = () => {
  emit(
    "update:modelValue",
    modelValue.value.filter((item) =>
      checkedBranches.value.includes(item.branch_id)
    )
  );
};

const filterOption = (input: string, option: any) => option.name.toLowerCase().includes(input.toLowerCase());

onMounted(async () => {
  await getBranches(true);
  const { items } = await getAdminProjects({ limit: 500, is_delivery: 1 });
  branchNames.value = items.map((el) => ({ name: el.name, id: el.id }));
  if (props.subscriptions?.length) {
    checkedBranches.value = props.subscriptions.map((item) => item.branch_id);
    modelValue.value = props.subscriptions.map((el) => ({
      branch_id: el.branch_id,
      depth: el.depth,
      name: el.branch.name
    }))
  }
});
</script>

<style lang="scss" scoped>
.search-input {
  border-bottom: 1px solid #e3e3e3;

  & :deep(.ant-input-group-addon) {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 26px;
  }

  & :deep(.ant-input-group-addon .ant-btn) {
    padding-left: 0;
  }

  & :deep(.ant-input-affix-wrapper) {
    padding-right: 0;
  }

  & :deep(.ant-input-group) {
    display: flex;
    flex-direction: row-reverse;
  }

  & :deep(.ant-input) {
    padding-left: 0;
    padding-right: 0;
  }

  & :deep(.ant-input-group-addon) {
    background-color: transparent;
    pointer-events: none;
  }

  & :deep(.ant-btn) {
    background-color: transparent !important;
    border: none;
    padding-right: 0 !important;
  }
}

.config {
  &__title {
    margin-bottom: 20px;
    @include Font-24-30-700();
  }

  &__inner {
    display: grid;
    grid-template-columns: 7fr 5fr;
    gap: 62px;
    margin-bottom: 40px;
    width: 1077px;
    height: 50vh;
    min-height: 400px;
    padding: 16px;
    background-color: #f4f4f4;
    border: 1px solid #e3e3e3;
    border-radius: 10px;
  }

  &-select__title,
  &-list__title {
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
  }

  &-list__simplebar,
  &-select__inner,
  &-list__inner {
    border-radius: 10px;
    height: calc(50vh - 80px);
    min-height: calc(400px - 75px);
  }

  &-select__inner,
  &-list__inner {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &-select {
    &__simplebar {
      margin-top: 10px;
      background-color: #fff;
      height: calc(50vh - 136px);
      min-height: calc(400px - 136px);
      margin-right: -16px;
      padding-right: 16px;
      border-radius: 10px;
    }

    &__inner {
      background-color: #fff;
      width: 100%;
      padding: 16px;
    }

    &__loader {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    &__item {
      padding-bottom: 10px;
    }

    &-controls {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr 1fr;

      &__select {
        position: relative;

        .ant-select {
          width: 100%;
        }

        :deep(.ant-select-selector) {
          border: none;
          border-bottom: 1px solid #e3e3e3;
          border-radius: 0 !important;
          min-height: 20px !important;
          box-shadow: none !important;
        }
      }

      &__clear {
        position: absolute;
        top: calc(50% - 10px);
        right: 8px;
        width: 14px;
        background-color: #fff;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.25);
      }
    }

    &__label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }

    &-checkbox {
      color: #999;
      font-size: 16px;

      &__name {
        display: block;
        width: 250px;
        @include sliceText();
      }

      &.ant-checkbox-wrapper-checked {
        color: #1a1a1a;
      }
    }

    &__town {
      font-size: 16px;
    }

    &__empty {
      display: block;
      margin-top: 10px;
    }
  }

  &-list {
    margin-left: -16px;
    padding-right: 20px;

    &__top {
      position: relative;
      display: inline-block;
      width: 385px;
    }

    &__total {
      position: absolute;
      top: 0;
      right: -28px;
      display: inline-flex;
      flex-direction: column;
      gap: 3px;
      width: 25px;
      text-align: center;
      font-size: 14px;
      color: rgb(80%, 80%, 80%);
      line-height: 1;

      span {
        font-size: 12px;
      }
    }

    &__simplebar {
      padding-right: 20px;
      margin: 10px -20px 0 0;
      height: calc(50vh - 120px);
    }

    &__search {
      max-width: 385px;
    }

    &__inner {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-right: 20px;
      height: calc(50vh - 120px);

      &.empty {
        justify-content: center;
        align-items: center;
        border: 1px dashed #b6b6b6;
      }
    }

    &__item {
      position: relative;
      display: flex;
      justify-content: space-between;
      padding: 16px;
      background: #fff;
      border: 1px solid #e3e3e3;
      border-radius: 10px;
    }

    &__name {
      position: relative;
      flex-grow: 1;

      span {
        display: block;
        width: 100%;
        max-width: 390px;
        @include sliceText();
      }

      &:before {
        content: "";
        position: absolute;
        top: -3px;
        right: 0;
        width: 1px;
        background-color: #e3e3e3;
        height: 130%;
      }
    }

    &__depth {
      flex: 0 1 34px;
      padding: 0 0 0 11px;
      text-align: center;
    }

    &__delete-icon {
      position: absolute;
      right: -30px;
      top: calc(50% - 12.5px);
      width: 25px;
      z-index: 1;
      fill: $main-grey;
      cursor: pointer;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.8);
      }
    }
  }
}
</style>
