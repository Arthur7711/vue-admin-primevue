<template>
  <section class="proxy">
    <AppBreadCrumbs :items="breadcrumbs" />
    <div class="main-content">
      <div class="proxy__inner">
        <div class="proxy__left">
          <h2 class="proxy__title">creating proxy</h2>
          <a-form name="proxy-form" :model="data" @finish="postProxy">
            <a-form-item
              name="name"
              :rules="[{ required: true, message: 'enter proxy name' }]"
            >
              <div class="flexbox">
                <span>proxy name</span>
                <a-input
                  v-model:value="data.name"
                  :maxlength="50"
                  show-count
                  :disabled="isPostLoading || Boolean(proxy)"
                />
              </div>
            </a-form-item>
            <a-form-item name="description">
              <div class="flexbox">
                <span>proxy description</span>
                <a-textarea
                  v-model:value="data.description"
                  :maxlength="255"
                  show-count
                  auto-size
                />
              </div>
            </a-form-item>
            <a-form-item v-if="!proxy">
              <a-button
                type="primary"
                html-type="submit"
                :loading="isPostLoading"
                style="margin-top: 10px; height: 50px"
              >
                Create
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <AppCopyCard
          v-if="proxy"
          title="cache"
          :name="proxy.name"
          :token="proxy.api_token"
        />
      </div>

      <ProxyConfig v-if="proxy" v-model="enterBranches" :proxy="proxy" />

      <div v-if="proxy" class="config">
        <a-button
          type="primary"
          class="config__btn"
          :disabled="!enterBranches?.length"
          :loading="isPostLoading"
          @click="postSubscriptions"
        >
          save
        </a-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import AppBreadCrumbs from "@/components/UI/AppBreadCrumbs.vue";
import AppCopyCard from "@/components/UI/AppCopyCard.vue";
import ProxyConfig from "@/components/Proxy/ProxyConfig.vue";
import { IProxy, IProxyBranch } from "@/API/models/proxies";
import { notification } from "ant-design-vue";
import { useRouter } from "vue-router";
import { postAdminProxy, postAdminSubscription } from "@/API/proxies";

const router = useRouter();

const breadcrumbs = [
  { name: "proxy", to: "/proxy", disabled: false },
  { name: "creating new proxy", to: "/proxy/create", disabled: true },
];

const data = reactive({
  name: "",
  description: "",
});

const isPostLoading = ref(false);
const enterBranches = ref<IProxyBranch[]>([]);
const proxy = ref<IProxy | null>(null);

const postProxy = async () => {
  try {
    isPostLoading.value = true;
    proxy.value = await postAdminProxy(data);
  } catch (e) {
  } finally {
    isPostLoading.value = false;
  }
};

const postSubscriptions = async () => {
  isPostLoading.value = true;

  if (enterBranches.value?.length === 0) {
    return await router.push("/proxy");
  }

  await Promise.all(
    enterBranches.value.map((item) => {
      try {
        return postAdminSubscription(Number(proxy.value?.id), {
          branch_id: item.branch_id,
          depth: item.depth,
        });
      } catch (e) {}
    })
  ).finally(() => {
    notification.success({ message: "subscriptions have been saved" });
    isPostLoading.value = false;
    router.push("/proxy");
  });
};
</script>

<style lang="scss" scoped>
.main-content {
  min-height: calc(100vh - 100px);
  overflow-x: auto;
  @include custom-scroll(8px, 4px);
}

.proxy {
  @include btn-style();

  &__title {
    @include Font-24-30-700;
  }

  &__inner {
    display: flex;
    align-items: flex-start;
    gap: 64px;
    margin-bottom: 60px;
  }

  &__left {
    min-width: 420px;
    max-width: 420px;
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
  }

  &__inner :deep(.ant-input) {
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

  // & :deep(.ant-form-item) {
  //   padding-bottom: 10px;
  // }

  &
    :deep(
      .ant-select-single:not(.ant-select-customize-input)
        .ant-select-selector
        .ant-select-selection-search-input
    ) {
    height: 100%;
  }
}

.config {
  @include btn-style();

  &__btn:disabled {
    background-color: #e3e3e3 !important;
    &:active {
      transform: none !important;
    }
  }
}
</style>
