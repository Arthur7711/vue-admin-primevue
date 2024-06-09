<template>
  <div class="proxy">
    <table class="proxy-table">
      <thead class="proxy-table-header" :class="{ loading: isLoading }">
        <tr>
          <td v-for="column in COLUMNS" :key="column.title">
            <div
              class="proxy-table-header__item"
              :class="`proxy-table-header__item_${column.class}`"
            >
              <template v-if="column.key === 'show-remove'">
                <AppCloseIcon v-if="isShowCloseProxy" @click="emit('clear')" />
              </template>
              <template v-if="column.key === 'id'">
                <AppSelect
                  v-if="queryId"
                  v-model:value="modelValue[column.key]"
                  :items="queryId"
                  placeholder="id"
                  color="#999999"
                  clearable
                  mode="multiple"
                  size="small"
                  :max-tag-count="1"
                  @change="emit('upload')"
                />
                <a-input
                  v-else
                  v-model:value="modelValue[column.key]"
                  :placeholder="column.title"
                  class="proxy-table-header__input"
                  allow-clear
                  :bordered="false"
                  :type="
                    column.key === 'id'
                      ? 'number'
                      : 'text'
                  "
                  @input="emit('upload')"
                />
              </template>

              <template
                v-else-if="['name', 'branch'].includes(column.key)"
              >
                <a-input
                  v-model:value="modelValue[column.key]"
                  :placeholder="column.title"
                  class="proxy-table-header__input"
                  allow-clear
                  :bordered="false"
                  :type="
                    column.key === 'id'
                      ? 'number'
                      : 'text'
                  "
                  @input="emit('upload')"
                />
              </template>

              <template v-else-if="column.key === 'depth'">
                <TableRange
                  v-model="modelValue[column.key]"
                  :title="column.title"
                  from="from"
                  to="to"
                  @input="emit('upload')"
                >
                  <template #icon>
                    <FilterCogIcon
                      class="select-icon"
                      :class="{
                        active:
                          modelValue[column.key] &&
                          modelValue[column.key].from &&
                          modelValue[column.key].to,
                      }"
                    />
                  </template>
                </TableRange>
              </template>

              <template v-else-if="column.key === 'icon'"></template>

              <template v-else>
                {{ column.title }}
              </template>
            </div>
          </td>
        </tr>
      </thead>

      <tbody>
        <tr v-if="isLoading">
          <td colspan="7" align="center"><Loader :width="50" /></td>
        </tr>

        <ProxyRow
          v-for="item in proxies"
          v-else-if="proxies?.length"
          :key="item.id"
          :data="item"
          :columns="COLUMNS"
          :active-proxy-id="activeProxyId"
          @click="emit('search-builds', item)"
        />

        <tr v-else>
          <td colspan="7" align="center"><h2>proxy storages not found</h2></td>
        </tr>
      </tbody>
    </table>

    <AppPagination
      v-if="isShowMore && isProxyLength"
      center
      @intersect="emit('add-more', false)"
    />
  </div>
</template>

<script setup lang="ts">
import ProxyRow from "@/components/Proxy/ProxyRow.vue";
import AppPagination from "@/components/UI/AppPagination.vue";
import TableRange from "@/components/Table/TableRange.vue";
import Loader from "@/components/icons/Loader.vue";
import AppCloseIcon from "@/components/UI/AppCloseIcon.vue";
import AppSelect from '@/components/UI/AppSelect.vue'
import { computed } from "vue";
import { FilterCogIcon } from "mdi-vue3";
import { IProxy } from "@/API/models/proxies";
import { useRoute } from "vue-router";

const props = defineProps<{
  proxies: IProxy[];
  isLoading: boolean;
  activeProxyId: null | number;
  params: {
    total: number;
    limit: number;
    page: number;
  };
}>();
const emit = defineEmits<{
  (e: "upload", value?: boolean): void;
  (e: "add-more", value?: boolean): void;
  (e: "clear"): void;
  (e: "search-builds", value: IProxy): void;
}>();
const route = useRoute();
const modelValue = defineModel();
const COLUMNS = [
  { title: "", key: "show-remove", class: "" },
  { title: "ID", key: "id", class: "id" },
  { title: "name/desc", key: "name", class: "name" },
  { title: "branches", key: "branch", class: "branch" },
  { title: "current/depth", key: "depth", class: "depth" },
  { title: "last commit", key: "last_commit", class: "last_commit" },
  { title: "token", key: "api_token", class: "token" },
  { title: "error logs", key: "error_logs", class: "error-logs" },
  { title: "", key: "edit", class: "edit" },
  { title: "icon", key: "icon", class: "icon" },
];

const isProxyLength = computed(() => props.proxies?.length);
const isShowMore = computed(
  () => props.params.limit * props.params.page < props.params.total
);
const isShowCloseProxy = computed(() => (
    modelValue.value.id ||
    modelValue.value.name ||
    modelValue.value.branch ||
    (modelValue.value.depth.from && modelValue.value.depth.to)
  ));

const queryId = computed(() => {
  if (route.query.id) {
    return Array.isArray(route.query.id)
      ? route.query.id
      : Array.isArray(JSON.parse(route.query.id))
        ? JSON.parse(route.query.id)
        : null
  }
  return null
})
</script>

<style lang="scss" scoped>
.proxy {
  position: relative;
  flex: 1 1;
  :deep(.ant-select-selector) {
    border: none;
    border-bottom: 1px solid #e3e3e3;
    padding-bottom: 5px;
    box-shadow: none !important;
  }
  &-table {
    border-collapse: separate;
    border-spacing: 0 20px;
    width: 100%;

    &-header {
      position: sticky;
      top: 0;
      background-color: #fff;
      height: 47px;
      z-index: 1;
      box-shadow: 0 2px 1px #e3e3e3;
      transition: opacity 0.3s;

      &.loading {
        pointer-events: none;
        opacity: 0.3;
      }

      &__item {
        padding: 0 10px 10px;
        color: $main-grey;
        white-space: nowrap;

        & :deep(.ant-input-affix-wrapper) {
          padding-right: 0;
        }

        &_id {
          min-width: 80px;
          width: 100px;
        }

        &_name {
          width: clamp(150px, 18vw, 330px);
        }

        &_ip {
          width: clamp(100px, 13vw, 200px);
        }

        &_branch {
          width: clamp(200px, 15vw, 300px);
        }

        &_depth {
          width: 80px;
        }

        &_token {
          width: 50px;
        }

        &_icon {
          min-width: 40px;
          width: 40px;
        }
      }

      &__input {
        padding-left: 0;
        padding-bottom: 0;
        border-bottom: 1px solid #e3e3e3;
      }
    }
  }
}
</style>
