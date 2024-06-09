<template>
  <section class="branch">
    <AppBreadCrumbs :items="breadcrumbs" />
    <div class="main-content">
      <h2 class="branch__title">creating branch</h2>
      <div class="branch__inner">
        <div class="branch__left">
          <a-form name="branch-form" :model="data" @finish="postBranch">
            <a-form-item
              class="branch-form__item branch-form__item_name"
              name="name"
              :rules="[{ required: true, message: 'enter branch name' }]"
            >
              <div class="flexbox">
                <span>branch name</span>
                <a-input v-model:value="data.name" :maxlength="50" show-count />
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
                  bordered
                  show-search
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
                  min-width="75px"
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
                  class="caches"
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
                  :items="statusBranches"
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
                :loading="isPostLoading"
                @click="clearBranch"
              >
                Create
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <div class="branch__right">
          <AppCopyCard
            v-if="branch"
            title="branch"
            :name="branch.role_name"
            :token="branch.builder?.token"
            field-name="role"
          />

          <AppCopyCard
            v-if="branch?.is_manual_uploader"
            full-title="manual uploader for the branch is configured"
            :name="branch.role_name"
            field-name="role"
            is-only-name
            prefix="manual_uploader_"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import AppBreadCrumbs from '@/components/UI/AppBreadCrumbs.vue';
import AppSelect from '@/components/UI/AppSelect.vue';
import BranchesStorageOption from '@/components/Branches/BranchesStorageOption.vue';
import AppCheckbox from '@/components/UI/AppCheckbox.vue';
import utils from '@/utils';
import { postAdminBranch, postAdminBranchCaches } from '@/API/branches';
import { getAdminCaches } from '@/API/caches';
import { getAdminProjects } from '@/API/projects';
import { IProject } from '@/API/models/projects';
import { IStorage } from '@/API/models/storages';
import { getAdminStorages } from '@/API/storages';
import { IBranch, IPostBranchData, IBranchLocalData } from '@/API/models/branches';
import AppCopyCard from '@/components/UI/AppCopyCard.vue';
import { notification } from 'ant-design-vue';
import { ICache } from '@/API/models/caches';

const breadcrumbs = [
  { name: 'branches', to: '/branches', disabled: false },
  { name: 'creating new branch', to: '/branch/create', disabled: true },
];

const data = reactive<IBranchLocalData>({
  name: undefined,
  project_id: undefined,
  storage_id: undefined,
  storage_time: 2,
  time_measurement: 'weeks',
  loader: 'cache-storage-internal',
  status: 'new',
  is_manual_uploader: false,
});

const isPostLoading = ref(false);
const branch = ref<IBranch | null>(null);
const projects = ref<IProject[]>([]);
const storages = ref<IStorage[]>([]);
const caches = ref<ICache[]>([]);
const selectedCacheBranch = ref<number[]>([]);

const statusBranches = computed(() =>
  utils.statusBranches.filter((item) => item.value !== 'archive')
);

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

const clearBranch = () => {
  if (branch.value) branch.value = null;
};

const clearFields = () => {
  data.name = undefined;
  data.project_id = undefined;
  data.storage_id = undefined;
  data.storage_time = 2;
  data.time_measurement = 'weeks';
  data.loader = 'cache-storage-internal';
  data.status = 'new';
  data.is_manual_uploader = false;
  selectedCacheBranch.value = [];
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

const postBranch = async () => {
  try {
    isPostLoading.value = true;
    const requestObject = <IPostBranchData>{};
    for (const key in data) {
      if (key !== 'time_measurement') {
        if (key === 'storage_time')
          requestObject[key] = `${data[key]} ${data.time_measurement}`;
        else requestObject[key] = data[key];
      }
    }
    branch.value = await postAdminBranch(requestObject);
    await postCacheBranch(branch.value?.id!);
    clearFields();
  } catch (e) {
  } finally {
    isPostLoading.value = false;
  }
};

const postCacheBranch = async (id: number) => {
  if (selectedCacheBranch.value.length) {
    try {
      await postAdminBranchCaches(id, {
        cache_storage_ids: selectedCacheBranch.value,
      });
      notification.success({
        message: 'branch cache storages has been added!',
      });
    } catch (e) {}
  }
};

onMounted(() => {
  getStorages();
  getProjects();
  getCaches();
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

  &__right {
    display: flex;
    flex-direction: column;
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
      .flexbox {
        display: flex;
        flex-direction: column;
        input {
          min-height: 50px;
        }
        span {
          white-space: nowrap;
          font-size: 12px;
          color: #999999;
          padding-left: 6px;
        }
        .caches {
          :deep(.ant-select-multiple .ant-select-selector) {
            min-height: 50px;
          }
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
