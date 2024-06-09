<template>
  <section class="branch" :class="{ full: isLoading }">
    <a-spin v-if="isLoading" size="large" tip="Loading..." />
    <template v-else-if="branch">
      <AppBreadCrumbs :items="breadcrumbs" />
      <div class="main-content">
        <h2 class="branch__title">editing branch</h2>
        <div class="branch__inner">
          <div class="branch__left">
            <a-form name="branch-form" :model="data" @finish="onPut">
              <a-form-item
                class="branch-form__item branch-form__item_name"
                name="name"
                :rules="[{ required: true, message: 'enter branch name' }]"
              >
                <div class="flexbox">
                  <span>branch name</span>
                  <a-input
                    v-model:value="data.name"
                    :maxlength="50"
                    show-count
                  />
                </div>
                <p class="branch-form__hint">
                  include project name for clarity – branch role will be created
                  based on the name
                </p>
              </a-form-item>

              <a-form-item
                class="branch-form__item branch-form__item_project-id"
                name="project_id"
                :rules="[{ required: true, message: 'select project' }]"
              >
                <div class="flexbox">
                  <span>project</span>
                  <AppSelect
                    v-model:value="data.project_id"
                    :items="projects"
                    item-value="id"
                    item-name="name"
                    bordered
                  />
                </div>
              </a-form-item>

              <a-form-item
                class="branch-form__item branch-form__item_storage-id"
                name="storage_id"
                :rules="[{ required: true, message: 'select storage' }]"
              >
                <div class="flexbox">
                  <span>storage</span>
                  <AppSelect
                    v-model:value="data.storage_id"
                    :items="storages"
                    item-name="shortname"
                    bordered
                  >
                    <template #item="{ item }">
                      <BranchesStorageOption :item="item" />
                    </template>
                  </AppSelect>
                </div>
              </a-form-item>

              <div class="storage-times">
                <a-form-item
                  class="branch-form__item branch-form__item_storage-time"
                  name="storage_time"
                  :rules="[{ required: true, message: 'select storage time' }]"
                >
                  <div class="flexbox">
                    <span>storage time</span>
                    <a-input
                      v-model:value="data.storage_time"
                      :bordered="true"
                      type="number"
                    />
                  </div>
                </a-form-item>
                <a-form-item
                  class="branch-form__item branch-form__item_storage-time"
                  name="storage_time"
                  :rules="[{ required: true, message: 'select storage time' }]"
                >
                  <div class="flexbox time_measurement">
                    <AppSelect
                      v-model:value="data.time_measurement"
                      :items="utils.timeMeasurementUnits"
                      bordered
                      min-width="75px"
                    />
                  </div>
                </a-form-item>
              </div>

              <a-form-item
                class="branch-form__item branch-form__item_loader"
                name="loader"
                :rules="[{ required: true, message: 'select delivery method' }]"
              >
                <div class="flexbox">
                  <span>delivery method</span>
                  <AppSelect
                    v-model:value="data.loader"
                    :items="utils.statusDeliveryBranches"
                    item-name="label"
                    item-value="value"
                    bordered
                  />
                </div>
              </a-form-item>

              <a-form-item
                class="branch-form__item branch-form__item_loader"
                name="loader"
              >
                <div class="flexbox">
                  <span>attach internal cache storages</span>
                  <AppSelect
                    v-model:value="selectedCacheBranch"
                    :items="caches"
                    item-name="name"
                    bordered
                    mode="multiple"
                    @deselect="deleteCacheBranch"
                  />
                </div>
              </a-form-item>

              <a-form-item
                class="branch-form__item branch-form__item_status"
                name="status"
                :rules="[{ required: true, message: 'select status' }]"
              >
                <div class="flexbox">
                  <span>status</span>
                  <AppSelect
                    v-model:value="data.status"
                    :items="utils.statusBranches"
                    item-value="value"
                    item-name="label"
                    bordered
                  />
                </div>
              </a-form-item>

              <a-form-item
                class="branch-form__item branch-form__item_manual"
                name="is_manual_uploader"
              >
                <AppCheckbox
                  v-model="data.is_manual_uploader"
                  name="Manual upload"
                />
              </a-form-item>

              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  :loading="isPutLoading"
                >
                  Save
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import AppBreadCrumbs from '@/components/UI/AppBreadCrumbs.vue';
import AppSelect from '@/components/UI/AppSelect.vue';
import BranchesStorageOption from '@/components/Branches/BranchesStorageOption.vue';
import AppCheckbox from '@/components/UI/AppCheckbox.vue';
import utils from '@/utils';
import {
  deleteAdminBranchCaches,
  getAdminBranch,
  getAdminBranchCaches,
  postAdminBranchCaches,
  putAdminBranch,
} from '@/API/branches';
import { getAdminCaches } from '@/API/caches';
import { getAdminProjects } from '@/API/projects';
import { getAdminStorages } from '@/API/storages';
import { IProject } from '@/API/models/projects';
import { IStorage } from '@/API/models/storages';
import { IBranchRef, IPostBranchData } from '@/API/models/branches';
import { ICache } from '@/API/models/caches';
import { useRoute, useRouter } from 'vue-router';
import { notification } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();

const breadcrumbs = [
  { name: 'branches', to: '/branches', disabled: false },
  {
    name: 'editing branch',
    to: `/branch/edit/${route.params.id}`,
    disabled: true,
  },
];

const isLoading = ref(true);
const isPutLoading = ref(false);
const branch = ref<IBranchRef | null>(null);
const projects = ref<IProject[]>([]);
const storages = ref<IStorage[]>([]);
const caches = ref<ICache[]>([]);
const cachesBranch = ref<number[]>([]);
const selectedCacheBranch = ref<number[]>([]);
const data = reactive({
  name: '',
  project_id: 0,
  storage_id: 0,
  loader: '',
  is_manual_uploader: false,
  storage_time: 0,
  time_measurement: '',
  status: '',
});

const isFromBranches = computed(
  () => router.options.history.state.back?.toString().includes('/branch')
);

const getBranch = async () => {
  try {
    const res = await getAdminBranch(+route.params.id);
    branch.value = {
      ...res,
      is_manual_uploader: !!res.is_manual_uploader,
    };
    Object.keys(data).forEach((key) => {
      if (key === 'time_measurement' || key === 'storage_time') {
        data.storage_time = Number(branch.value?.storage_time.split(' ')[0]);
        data.time_measurement = branch.value?.storage_time.split(' ')[1] || '';
      } else data[key] = branch.value[key];
    });
  } catch (e) {}
};

const getCacheBranch = async () => {
  try {
    const { items } = await getAdminBranchCaches(+route.params.id);
    if (items.length) {
      cachesBranch.value = items.map((item) => item.id);
      selectedCacheBranch.value = cachesBranch.value;
    }
  } catch (e) {}
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
    const { items } = await getAdminProjects({ limit: -1 });
    projects.value = items;
  } catch (e) {}
};

const putBranch = async () => {
  try {
    const requestObject = <IPostBranchData>{};
    for (const key in data) {
      if (key !== 'time_measurement') {
        if (key === 'storage_time')
          requestObject[key] = `${data[key]} ${data.time_measurement}`;
        else requestObject[key] = data[key];
      }
    }
    await putAdminBranch(+route.params.id, requestObject);
    notification.success({ message: 'branch has been updated!' });
  } catch (e) {}
};

const postCacheBranch = async () => {
  const newCacheBranches =
    selectedCacheBranch.value.length && cachesBranch.value.length
      ? selectedCacheBranch.value.filter(
          (item) => !cachesBranch.value.includes(item)
        )
      : selectedCacheBranch.value.length
        ? selectedCacheBranch.value
        : [];
  if (newCacheBranches.length) {
    try {
      await postAdminBranchCaches(+route.params.id, {
        cache_storage_ids: newCacheBranches,
      });
      notification.success({
        message: 'branch cache storages have been updated!',
      });
    } catch (e) {}
  }
};
const onPut = async () => {
  isPutLoading.value = true;
  await Promise.allSettled([putBranch(), postCacheBranch()])
    .then(() => {
      isFromBranches.value ? router.back() : router.push('/branches');
    })
    .finally(() => {
      isPutLoading.value = false;
    });
};

const deleteCacheBranch = async (id) => {
  if (!cachesBranch.value.length || !cachesBranch.value.includes(id))
    return false;

  try {
    await deleteAdminBranchCaches(+route.params.id, [id]);
    cachesBranch.value.filter((item) => item !== id);
    notification.success({
      message: 'cache storage has been deleted from branch!',
    });
  } catch (e) {}
};

onMounted(() => {
  Promise.allSettled([
    getBranch(),
    getCacheBranch(),
    getStorages(),
    getProjects(),
    getCaches(),
  ]).finally(() => {
    isLoading.value = false;
  });
});
</script>

<style lang="scss" scoped>
.main-content {
  min-height: calc(100vh - 100px);
}

.branch {
  &__title {
    @include Font-24-30-700;
  }

  &__inner {
    display: flex;
    align-items: flex-start;
    gap: 64px;
  }

  &__left {
    min-width: 420px;
    max-width: 420px;
  }

  & :deep(.ant-input) {
    padding: 8px 11px;
    border-radius: 10px;
    font-size: 16px;
  }

  & :deep(.ant-input-affix-wrapper) {
    padding-left: 0;
    border-radius: 10px;
  }

  &
    :deep(
      .ant-select-single:not(.ant-select-customize-input) .ant-select-selector
    ) {
    min-height: 51px;
    height: auto;
    border-radius: 10px;
  }

  & :deep(.ant-select-selection-item) {
    display: flex;
    align-items: center;
  }

  & :deep(.ant-select-selection-placeholder) {
    display: flex;
    align-items: center;
    line-height: 1;
  }

  & :deep(.ant-form-item-explain-error) {
    padding-left: 5px;
    color: $main-orange;
  }

  &
    :deep(
      .ant-form-item-has-error
        :not(.ant-input-affix-wrapper-disabled):not(
          .ant-input-affix-wrapper-borderless
        ).ant-input-affix-wrapper
    ),
  &
    :deep(
      .ant-form-item-has-error
        .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input)
        .ant-select-selector
    ) {
    border-color: $main-orange !important;
  }

  &
    :deep(
      .ant-select-single:not(.ant-select-customize-input)
        .ant-select-selector
        .ant-select-selection-search-input
    ) {
    height: 100%;
  }

  & :deep(.ant-btn) {
    width: 100%;
    padding: 6px 15px;
    height: auto;
    border-radius: 10px;
    background-color: #1565c0;
    font-size: 18px;
    font-weight: 600;
    transition: transform 0.2s;

    &:active {
      transform: scale(0.9);
    }
  }

  .ant-form-item.ant-form-item-has-error .branch-form__hint {
    display: none;
  }

  &-form {
    &__item {
      // padding-bottom: 15px;

      .flexbox {
        display: flex;
        flex-direction: column;
        span {
          white-space: nowrap;
          font-size: 12px;
          color: #999999;
          padding-left: 6px;
        }
        input {
          min-height: 50px;
        }
      }
      .time_measurement {
        padding-top: 18px;
      }
    }
    &__item:nth-child(1) {
      padding-bottom: 15px;
    }

    &__hint {
      position: absolute;
      bottom: -20px;
      left: 5px;
      margin: 5px 0 0;
      font-size: 12px;
      font-style: italic;
      line-height: 1.3;
      color: $main-grey;
    }
  }
  .storage-times {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}
</style>
