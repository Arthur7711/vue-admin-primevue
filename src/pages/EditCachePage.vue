<template>
  <section class="cache" :class="{ full: isLoading }">
    <a-spin v-if="isLoading" size="large" tip="Loading..." />

    <template v-else>
      <AppBreadCrumbs :items="breadcrumbs" />
      <div class="main-content">
        <template v-if="cache">
          <div class="cache__top">
            <h2 class="cache__title">editing cache storage</h2>
            <a-button
              v-if="!cache?.is_builds"
              type="text"
              class="cache__delete"
              @click="isShowModal = true"
            >
              <DeleteIcon style="width: 16px" />
              delete cache storage
            </a-button>
            <a-tooltip v-else placement="top">
              <template #title>
                cache cannot be deleted as it contains builds - change status to
                'deleted'
              </template>
              <a-button type="text" disabled class="cache__delete">
                <DeleteIcon style="width: 16px" />
                delete cache storage
              </a-button>
            </a-tooltip>
          </div>
          <div class="cache__inner">
            <div class="cache__left">
              <a-form name="cache-form" :model="data" @finish="putCache">
                <a-form-item
                  class="cache-form__item cache-form__item_name"
                  name="name"
                  :rules="[{ required: true, message: 'enter cache name' }]"
                >
                  <div class="flexbox">
                    <span>name*</span>
                    <a-input
                      v-model:value="data.name"
                      :maxlength="255"
                      show-count
                    />
                  </div>
                </a-form-item>

                <a-form-item
                  class="cache-form__item cache-form__item_description"
                  name="description"
                >
                  <div class="flexbox">
                    <span>description</span>
                    <a-textarea v-model:value="data.description" auto-size />
                  </div>
                </a-form-item>

                <a-form-item
                  class="cache-form__item cache-form__item_depth"
                  name="depth"
                >
                  <div class="flexbox">
                    <span>cache storage depth (0 by default)</span>
                    <a-input v-model:value="data.depth" type="number" />
                  </div>
                </a-form-item>

                <a-form-item
                  class="cache-form__item cache-form__item_type"
                  name="type"
                >
                  <div class="flexbox">
                    <span>cache storage type</span>
                    <AppSelect
                      v-model:value="data.type"
                      :items="cacheTypes"
                      min-width="75px"
                      bordered
                    />
                  </div>
                </a-form-item>

                <a-form-item
                  class="cache-form__item cache-form__item_pre-create-users"
                  name="pre_create_users"
                >
                  <div class="flexbox">
                    <span>number of pre-created users (1 by default)</span>
                    <a-input
                      v-model:value="data.pre_create_users"
                      type="number"
                    />
                  </div>
                </a-form-item>

                <a-form-item
                  class="cache-form__item cache-form__item_status"
                  name="status"
                >
                  <div class="flexbox">
                    <span>status</span>
                    <AppSelect
                      v-model:value="data.status"
                      :items="utils.statusCache"
                      item-value="value"
                      item-name="label"
                      bordered
                    />
                  </div>
                </a-form-item>

                <a-form-item>
                  <a-button
                    type="submit"
                    html-type="submit"
                    :loading="isPutLoading"
                    style="color: #fff; height: 50px"
                  >
                    save
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
          </div>
        </template>

        <h2 v-else style="text-align: center">cache not found!</h2>
      </div>

      <a-modal
        v-model:visible="isShowModal"
        class="custom-modal cache-modal"
        :closable="false"
        cancel-text="cancel"
        ok-text="confirm"
        centered
        width="540px"
        @cancel="isShowModal = false"
        @ok="deleteCache"
      >
        <h3>confirm cache storage deletion</h3>
        <div class="cache-modal__inner">
          <span class="cache-modal__name">{{ cache?.name }}</span>
          <span class="cache-modal__items">contains 0 builds</span>
        </div>
      </a-modal>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, Ref, reactive, onMounted } from "vue";
import AppBreadCrumbs from "@/components/UI/AppBreadCrumbs.vue";
import AppSelect from "@/components/UI/AppSelect.vue";
import utils from "@/utils";
import { deleteAdminCache, getAdminCache, putAdminCache } from "@/API/caches";
import { ICache } from "@/API/models/caches";
import { DeleteIcon } from "mdi-vue3";
import { useRouter, useRoute } from "vue-router";
import { notification } from "ant-design-vue";

const route = useRoute();
const router = useRouter();

const breadcrumbs = [
  { name: "caches", to: "/caches", disabled: false },
  {
    name: "editing cache storage",
    to: `/cache/edit/${route.params.id}`,
    disabled: true,
  },
];
const cacheTypes = ["public", "internal"];

const data = reactive({
  name: null,
  description: null,
  depth: null,
  type: "public",
  pre_create_users: null,
  status: "new",
});

const isLoading: Ref<boolean> = ref(true);
const isPutLoading: Ref<boolean> = ref(false);
const isShowModal: Ref<boolean> = ref(false);
const cache: Ref<ICache | null> = ref(null);

const putCache = async () => {
  try {
    const requestData = {};
    isPutLoading.value = true;
    Object.entries(data).forEach((el) => {
      if (cache.value[el[0]] !== el[1]) {
        requestData[el[0]] = el[1];
      }
    });
    await putAdminCache(cache.value?.id!, requestData);
    notification.success({ message: "cache storage has been updated!" });
    await router.push("/caches");
  } catch (e) {
  } finally {
    isPutLoading.value = false;
  }
};

const deleteCache = async () => {
  try {
    await deleteAdminCache(`${route.params.id}`);

    await router.push("/caches");
  } catch (e) {}
};

const getCache = async () => {
  try {
    cache.value = await getAdminCache(`${route.params.id}`);
    fillFields();
  } catch (e) {}
};

const fillFields = () => {
  if (cache.value) {
    Object.keys(data).forEach((key) => (data[key] = cache.value[key]));
  }
};

onMounted(async () => {
  await getCache();
  isLoading.value = false;
});
</script>

<style lang="scss" scoped>
.main-content {
  min-height: calc(100vh - 100px);
}

.cache {
  &__top {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  &__title {
    @include Font-24-30-700;
    white-space: nowrap;
  }

  &__delete {
    display: flex;
    align-items: center;
    gap: 3px;
    color: $main-orange;
    fill: $main-orange;
    line-height: 1;
    font-weight: 600;

    &:disabled {
      color: $main-grey;
      fill: $main-grey;
    }
  }

  &__inner {
    display: flex;
    align-items: flex-start;
    gap: 64px;

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
  }

  &__left {
    min-width: 420px;
    max-width: 420px;
  }

  & :deep(.ant-input) {
    display: block;
    width: 100%;
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

  .ant-form-item.ant-form-item-has-error .cache-form__hint {
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
        &:deep(textarea) {
          height: 50px !important;
        }
      }
      &_depth input,
      &_pre-create-users input,
      &_description textarea {
        min-height: 51px;
      }

      &_description textarea.ant-input {
        padding: 11px;
      }
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
}
</style>
