<template>
  <section class="cache">
    <AppBreadCrumbs :items="breadcrumbs" />
    <div class="main-content">
      <h2 class="cache__title">creating cache storage</h2>
      <div class="cache__inner">
        <div class="cache__left">
          <a-form name="cache-form" :model="data" @finish="postCache">
            <a-form-item
              class="cache-form__item cache-form__item_name"
              name="name"
              :rules="[{ required: true, message: 'enter cache name' }]"
            >
              <div class="flexbox">
                <span>name*</span>
                <a-input v-model:value="data.name" :maxlength="255" show-count />
              </div>
            </a-form-item>

            <a-form-item
              class="cache-form__item cache-form__item_description"
              name="description"
            >
              <div class="flexbox">
                <span>description</span>
                <a-textarea
                  v-model:value="data.description"
                  auto-size
                  :maxlength="255"
                  show-count
                />
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
                <a-input v-model:value="data.pre_create_users" type="number" />
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
                :loading="isPostLoading"
                style="color: #fff; height: 50px;"
                @click="clearCache"
              >
                Create
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <AppCopyCard
          v-if="cache"
          title="cache"
          :name="cache.name"
          :token="cache.token"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, Ref, reactive } from "vue";
import AppBreadCrumbs from "@/components/UI/AppBreadCrumbs.vue";
import AppSelect from "@/components/UI/AppSelect.vue";
import AppCopyCard from "@/components/UI/AppCopyCard.vue";
import utils from "@/utils";
import { postAdminCache } from "@/API/caches";
import { ICache } from "@/API/models/caches";

const breadcrumbs = [
  { name: "caches", to: "/caches", disabled: false },
  { name: "creating cache storage", to: "/cache/create", disabled: true },
];
const cacheTypes = ["public", "internal"];

const data = reactive({
  name: "",
  description: "",
  depth: "",
  type: "public",
  pre_create_users: "",
  status: "new",
});

const isPostLoading: Ref<boolean> = ref(false);
const cache: Ref<ICache | null> = ref(null);

const postCache = async () => {
  try {
    isPostLoading.value = true;
    cache.value = await postAdminCache({
      ...data,
      depth: data.depth || 0,
      pre_create_users: data.pre_create_users || 1,
      description: data.description || undefined,
    });
    clearFields();
  } catch (e) {
  } finally {
    isPostLoading.value = false;
  }
};

const clearCache = () => {
  if (cache.value) cache.value = null;
};

const clearFields = () => {
  data.name = null;
  data.description = null;
  data.depth = null;
  data.type = "public";
  data.pre_create_users = null;
  data.status = "new";
};
</script>

<style lang="scss" scoped>
.main-content {
  min-height: calc(100vh - 100px);
  overflow-x: auto;
  @include custom-scroll(8px, 4px);
}

.cache {
  &__title {
    white-space: nowrap;
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
