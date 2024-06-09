<template>
  <section class="proxy" :class="{ full: isLoading }">
    <a-spin v-if="isLoading" size="large" tip="Loading..." />
    <template v-else-if="proxy">
      <AppBreadCrumbs :items="breadcrumbs" />
      <div class="main-content">
        <div class="proxy__inner">
          <div class="proxy__title-container">
            <h2 class="proxy__title">editing proxy</h2>
            <a-button
              type="text"
              class="proxy__delete"
              @click="isShowModal = true"
            >
              <DeleteIcon style="width: 16px" />
              delete proxy storage
            </a-button>
          </div>
          <div class="proxy__left">
            <a-form name="proxy-form" :model="data">
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
            </a-form>
          </div>
        </div>

        <ProxyConfig
          v-if="proxy"
          v-model="enterBranches"
          :proxy="proxy"
          :subscriptions="subscriptions"
          @delete-sub="deleteSubscription"
        />

        <div class="config">
          <a-button
            type="primary"
            class="config__btn"
            :disabled="!data.name?.trim()"
            :loading="isPostLoading"
            style="height: 50px"
            @click="onSave"
          >
            save
          </a-button>
        </div>

        <AppConfirm
          v-model="isShowModal"
          class="proxy-modal"
          centered
          @cancel="isShowModal = false"
          @ok="deleteProxy"
        >
          <template #default>
            <h3>confirm proxy storage deletion</h3>
            <div class="proxy-modal__inner">
              <span class="proxy-modal__name">{{ proxy.name }}</span>
              <span v-if="subscriptions.length" class="proxy-modal__items"
              >contains {{ subscriptions.length }}
              {{ subscriptions.length === 1 ? "build" : "builds" }}</span
              >
            </div>
          </template>
        </AppConfirm>
      </div>
    </template>
    <h2 v-else class="proxy__empty">proxy storages not found</h2>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { notification } from "ant-design-vue";
import { DeleteIcon } from "mdi-vue3";
import AppBreadCrumbs from "@/components/UI/AppBreadCrumbs.vue";
import ProxyConfig from "@/components/Proxy/ProxyConfig.vue";
import AppConfirm from '@/components/UI/AppConfirm.vue'
import { IProxy, IProxyBranch, IProxySub } from "@/API/models/proxies";
import {
  deleteAdminProxy,
  deleteAdminSubscription,
  getAdminProxy,
  getAdminSubscriptions,
  postAdminSubscription,
  putAdminProxy,
  putAdminSubscription,
} from "@/API/proxies";

const router = useRouter();
const route = useRoute();

const breadcrumbs = [
  { name: "proxy", to: "/proxy", disabled: false },
  {
    name: "editing proxy",
    to: `/proxy/edit/${route.params.id}`,
    disabled: true,
  },
];

const data = reactive({
  name: "",
  description: "",
});

const isLoading = ref(true);
const isDeleteLoading = ref(false);
const isPostLoading = ref(false);
const isShowModal = ref(false);
const proxy = ref<IProxy | null>(null);
const subscriptions = ref<IProxySub[]>([]);
const enterBranches = ref<IProxyBranch[]>([]);

const getProxy = async () => {
  try {
    proxy.value = await getAdminProxy(+route.params.id);
    data.name = proxy.value?.name!;
    data.description = proxy.value?.description || "";
  } catch (e) {}
};

const getSubscriptions = async () => {
  try {
    const { items } = await getAdminSubscriptions(+route.params.id, {
      limit: -1,
      with: ["branch"],
    });

    subscriptions.value = items;
    enterBranches.value = subscriptions.value.map((sub) => ({
      branch_id: sub.branch_id,
      name: sub.branch.name,
      depth: sub.depth
    }));
  } catch (e) {
  } finally {
    isLoading.value = false;
  }
};

const deleteProxy = async () => {
  try {
    isDeleteLoading.value = true;
    await deleteAdminProxy(+route.params.id);
    notification.success({ message: "proxy has been deleted!" });
    await router.push("/proxy");
  } catch (e) {
  } finally {
    isDeleteLoading.value = false;
  }
};

const onSave = async () => {
  if (!data.name?.trim()) return false;
  isPostLoading.value = true;

  Promise.allSettled([
    putProxy(),
    setSubscriptions()
  ]).then(() => {
    isPostLoading.value = false;
    router.push("/proxy");
  })
};

const putProxy = async () => {
  const description : string = data.description?.trim()
  const name : string = data.name?.trim()
  if (
    name === proxy.value?.name &&
    description === proxy.value?.description
  ) return false;

  try {
    await putAdminProxy(+route.params.id, {
      name: name && name !== proxy.value?.name ? name : undefined,
      description: description !== (proxy.value?.description ?? '')
        ? description
        : undefined
    });
    notification.success({ message: "proxy has been updated!" });
  } catch (e) {}
};

const setSubscriptions = async () => {
  let newBranches: IProxyBranch[] = [];
  const putBranches: IProxyBranch[] = [];

  if (subscriptions.value?.length) {
    enterBranches.value.forEach((branch) => {
      const sub = subscriptions.value.find(
        (item) => item.branch_id === branch.branch_id
      );
      if (sub && branch.depth !== sub.depth) {
        putBranches.push({ ...branch, id: sub.id });
      } else if (!sub) {
        newBranches.push(branch);
      }
    });
  } else {
    newBranches = enterBranches.value;
  }

  if (!newBranches.length && !putBranches.length) {
    return false;
  }

  if (putBranches.length) {
    await Promise.all(
      putBranches.map((item) => {
        try {
          return putAdminSubscription(item.id!, { depth: item.depth });
        } catch (e) {}
      })
    ).finally(() => {
      notification.success({ message: "subscriptions have been changed" });
    });
  }

  if (newBranches.length) {
    await Promise.all(
      newBranches.map((item) => {
        try {
          return postAdminSubscription(proxy.value?.id!, {
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
  }
};

const deleteSubscription = async (id: number) => {
  try {
    await deleteAdminSubscription(id);
    notification.success({ message: "subscription has been deleted!" });
    subscriptions.value = subscriptions.value.filter((item) => item.id !== id);
  } catch (e) {}
};

onMounted(async () => {
  await getProxy();

  if (proxy.value) {
    await getSubscriptions();
  }
});
</script>

<style lang="scss" scoped>
.main-content {
  min-height: calc(100vh - 100px);
}

.proxy {
  &__empty {
    text-align: center;
    font-weight: 600;
  }

  &__title {
    @include Font-24-30-700;
  }

  &__inner {
    gap: 64px;
    margin-bottom: 60px;
  }
  &__title-container {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    &:deep(button) {
      padding: 0;
    }
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

  & :deep(
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
    color: $main-orange;
  }

  & :deep(
      .ant-form-item-has-error
        :not(.ant-input-affix-wrapper-disabled):not(
          .ant-input-affix-wrapper-borderless
        ).ant-input-affix-wrapper
    ),
  & :deep(
      .ant-form-item-has-error
        .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input)
        .ant-select-selector
    ) {
    border-color: $main-orange !important;
  }

  // & :deep(.ant-form-item) {
  //   padding-bottom: 10px;
  // }

  & :deep(
      .ant-select-single:not(.ant-select-customize-input)
        .ant-select-selector
        .ant-select-selection-search-input
    ) {
    height: 100%;
  }

  &__delete {
    display: flex;
    align-items: center;
    gap: 3px;
    color: $main-orange;
    fill: $main-orange;
    line-height: 1;
    font-weight: 600;
  }

  &-modal {
    &__inner {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    &__name {
      @include sliceText();
      width: 350px;
    }
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
