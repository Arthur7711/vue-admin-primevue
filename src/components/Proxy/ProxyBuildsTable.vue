<template>
  <div class="proxy">
    <AppCloseIcon
      v-if="
        modelValue.build_id ||
        modelValue.name ||
        modelValue.status ||
        modelValue.build ||
        modelValue.branch_build
      "
      top="8px"
      left="-25px"
      position="absolute"
      @click="emit('clear')"
    />
    <div class="proxy-header">
      <div class="proxy-header__item proxy-header__item_build-id">
        <a-input
          v-model:value="modelValue.build_id"
          class="proxy__inputs"
          placeholder="id"
          type="number"
          @change="emit('upload')"
        />
      </div>

      <div class="proxy-header__item proxy-header__item_name">
        <a-input
          v-model:value="modelValue.build"
          class="proxy__inputs"
          :placeholder="modelValue.name || 'all proxy builds'"
          @change="emit('upload')"
        />
      </div>

      <div class="proxy-header__item proxy-header__item_status">
        <AppSelect
          v-model:value="modelValue.status"
          :items="statuses"
          class="proxy__select"
          color="#999999"
          placeholder="status"
          clearable
          item-value="value"
          item-name="label"
          @change="emit('upload')"
        />
      </div>

      <div class="proxy-header__item proxy-header__item_updated">
        status duration
      </div>
      <div class="proxy-header__item proxy-header__item_build">
        <AppSelect
          v-model:value="modelValue.branch_build"
          :items="branches"
          class="proxy__select"
          color="#999999"
          placeholder="all branches"
          clearable
          item-value="id"
          item-name="name"
          show-search
          @search="
            (e) => {
              searchesBranch = e;
              getBranches();
            }
          "
          @change="emit('upload')"
        />
        <!-- <a-input
          v-model:value="modelValue.branch_build"
          class="proxy__inputs"
          placeholder="all branches"
          @change="emit('upload')"
        /> -->
      </div>
    </div>

    <simplebar class="proxy__body custom-simplebar">
      <div v-if="isLoading" style="text-align: center">
        <Loader :width="50" />
      </div>

      <template v-else-if="proxyBuilds?.length">
        <ProxyBuildRow
          v-for="item in proxyBuilds"
          :key="item.id"
          :item="item"
        />

        <AppPagination
          v-if="isShowMore && isProxyBuildsLength"
          center
          @intersect="emit('upload', false)"
        />
      </template>

      <h2 v-else style="text-align: center">proxy builds not found</h2>
    </simplebar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import Loader from '@/components/icons/Loader.vue';
import ProxyBuildRow from '@/components/Proxy/ProxyBuildRow.vue';
import AppPagination from '@/components/UI/AppPagination.vue';
import AppSelect from '@/components/UI/AppSelect.vue';
import AppCloseIcon from '@/components/UI/AppCloseIcon.vue';
import { IProxyBuild } from '@/API/models/proxies';
import { getAdminBranches } from '@/API/branches';
import { IBranch } from '@/API/models/branches';

const props = defineProps<{
  title?: string;
  proxyBuilds: IProxyBuild[];
  isLoading: boolean;
  params: {
    total: number;
    limit: number;
    page: number;
  };
}>();

const modelValue = defineModel();
const emit = defineEmits<{
  (e: 'upload', value?: boolean): void;
  (e: 'clear'): void;
}>();

const statuses = ['seeding', 'pending', 'missed', 'deleting', 'deleted '];
const branches = ref<IBranch[]>([]);
const searchesBranch = ref<string | undefined>(undefined);
const timeout = ref<ReturnType<typeof setTimeout> | null>(null);

const isProxyBuildsLength = computed(() => props.proxyBuilds?.length);
const isShowMore = computed(
  () => props.params?.limit * props.params.page < props.params.total
);
const getBranches = async () => {
  if (timeout.value) clearTimeout(timeout.value);
  timeout.value = setTimeout(async () => {
    const { items } = await getAdminBranches({
      limit: 5,
      filters: JSON.stringify([
        {
          column: 'name',
          value: searchesBranch.value,
          operator: 'like_both',
        },
      ]),
    });
    branches.value = items;
  }, 500);
};
onMounted(async () => {
  await getBranches();
});
</script>

<style lang="scss" scoped>
.proxy {
  position: sticky;
  top: 0;
  margin-top: 20px;
  width: 100%;
  max-width: 700px;

  &-header {
    display: grid;
    grid-template-columns: 40px 1fr 70px 95px 150px;
    align-items: center;
    gap: 15px;
    padding: 3px 16px 12px;
    margin-bottom: 20px;
    background-color: #fff;
    box-shadow: 0 2px 1px #e3e3e3;

    &__item {
      color: $main-grey;
      white-space: nowrap;

      &_build-id {
        .proxy__inputs {
          padding: 4px 0;
          text-align: center;
        }
      }

      &_name {
        display: flex;
        gap: 5px;
        margin: 0;
        width: clamp(90px, 9vw, 200px);

        span {
          display: block;
          padding-right: 10px;
          max-width: 200px;

          &.slice-text {
            @include sliceText();
          }
        }
      }

      &_status {
        margin-left: -15px;
      }
      .proxy__inputs {
        border: none;
        outline: none;
        box-shadow: none;
        border-bottom: 1px solid #e3e3e3;
      }
    }
  }

  &__body {
    position: relative;
    display: block;
    padding: 16px 16px 0;
    border: 1px solid #e3e3e3;
    border-radius: 10px;
    max-height: 560px;
    width: 100%;
  }

  &__select {
    & :deep(.ant-select-selector) {
      font-size: 14px;
    }
  }
}
</style>
