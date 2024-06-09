<template>
  <tr class="proxy__row" :class="{ active: data.id === activeProxyId }">
    <td
      v-for="column in columns"
      :key="column.title"
      class="proxy-item"
      :class="`proxy-item_${column.class}`"
    >
      <template v-if="column.key === 'id'">
        {{ data[column.key] }}
      </template>

      <template v-else-if="column.key === 'name'">
        <a-tooltip placement="topLeft" color="#fff">
          <template #title>
            <div style="color: #000">
              <p style="margin-bottom: 0">
                <b>{{ data.name }}</b>
              </p>
              <span>{{ data?.description }}</span>
            </div>
          </template>
          <div class="proxy-item__descList">
            <AppCopyTooltip :copy-text="data.name" />
            <p class="proxy-item__desc">
              <template v-if="data.description">{{ data.description }}</template>
            </p>
            <p v-if="data.ip" class="proxy-item__info">
              IP: {{ data.ip }}
            </p>
            <p v-if="data.ping_at" class="proxy-item__info">
              last ping at:
              {{ format(new Date(data.ping_at), "yyyy-MM-dd HH:mm") }}
            </p>
            <p v-if="data.external_data?.free_space" class="proxy-item__info">
              free space:
              {{ (data.external_data?.free_space / Math.pow(1024, 3)).toFixed(2) }}
              GB
            </p>
          </div>
        </a-tooltip>
      </template>

      <template v-else-if="column.key === 'branch' && data.branches">
        <Loader v-if="!data.branches" />
        <ul v-else-if="data.branches?.length" class="proxy-item__branches-list">
          <template v-if="isShow">
            <li
              v-for="item in data.branches"
              :key="item.branch_id"
              class="proxy-item__branch"
            >
              <router-link :to="`/branches?id=${item.branch_id}`" @click.stop>
                {{ item?.branch?.name }}
                <ArrowTopRightIcon class="arrow-top-right" />
              </router-link>
            </li>
          </template>
          <template v-else>
            <li
              v-for="item in data.branches.slice(0,4)"
              :key="item.branch_id"
              class="proxy-item__branch"
            >
              <router-link :to="`/branches?id=${item.branch_id}`" @click.stop>
                {{ item?.branch?.name }}
                <ArrowTopRightIcon class="arrow-top-right" />
              </router-link>
            </li>
          </template>
        </ul>
        <template v-else>-</template>
      </template>

      <template v-else-if="column.key === 'depth'">
        <Loader v-if="!data.branches" />
        <ul
          v-else-if="data.branches?.length"
          class="proxy-item__branches-list"
        >
          <template v-if="isShow">
            <li v-for="item in data.branches" :key="item.branch_id">
              {{ item.count }}/{{ item.depth }}
            </li>
          </template>
          <template v-else>
            <li v-for="item in data.branches.slice(0,4)" :key="item.branch_id">
              {{ item.count }}/{{ item.depth }}
            </li>
          </template>
        </ul>
        <template v-else>-</template>
      </template>

      <template v-else-if="column.key === 'last_commit'">
        <a-tooltip
          v-if="data.external_data"
          placement="bottomLeft"
          trigger="click"
          color="#fff"
          class="caches-table-tooltip"
          style="border-radius: 10px"
          @click.stop
        >
          <template #title>
            <div class="proxy-item__commit-info">
              <p v-for="key in Object.keys(data?.external_data)" :key="key">
                <b>{{ key }}:</b>
                {{ data?.external_data?.[key] }}
              </p>
            </div>
          </template>
          <div>
            <InfoIcon class="icon caches-table-tooltip__icon" />
            {{ data?.external_data?.git_commit_desc }}
          </div>
        </a-tooltip>
      </template>

      <template v-else-if="column.key === 'api_token'">
        <AppCopyTooltip
          v-if="data[column.key]"
          :title="`${data?.name} - ${data.api_token}`"
          @click.stop
        >
          <template #text>
            <KeyVariantIcon class="icon" />
          </template>
        </AppCopyTooltip>
      </template>

      <template v-else-if="column.key === 'edit'">
        <router-link
          v-if="!data.deleted_at"
          :to="`/proxy/edit/${data.id}`"
          class="proxy-item__link"
          @click.stop
        >
          <PencilIcon style="width: 15px" />
          edit
        </router-link>
      </template>

      <template v-else-if="column.key === 'icon'">
        <button
          v-if="data.branches?.length > 4"
          class="proxy__arrow"
          :class="{ active: isShow }"
        >
          <img
            src="/images/arrow-down.svg"
            alt="arrow down"
            @click.stop="isShow = !isShow"
          />
        </button>
      </template>

      <template v-else-if="column.key === 'error_logs'">
        <router-link
          :to="`/error/logs?proxy_storage_id=${data.id}`"
          style="display: flex; justify-content: center"
          ><AlertCircleIcon class="error_logs"
        /></router-link>
      </template>

      <template v-else>
        <span>{{ data[column.key] }}</span>
      </template>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppCopyTooltip from "@/components/UI/AppCopyTooltip.vue";
import {
  KeyVariantIcon,
  PencilIcon,
  ArrowTopRightIcon,
  AlertCircleIcon,
} from "mdi-vue3";
import Loader from "@/components/icons/Loader.vue";
import InfoIcon from "@/components/icons/InfoIcon.vue";
import { IProxy } from "@/API/models/proxies";
import { format } from "date-fns";

defineProps<{
  data: IProxy;
  columns: {
    key: string;
    title: string;
    class: string;
  }[];
  activeProxyId: number | null;
}>();

const isShow = ref(false);
</script>

<style lang="scss" scoped>
.proxy-item {
  &_last_commit {
    width: 250px;
  }
}
:global(.proxy-item_depth) {
  width: 150px;
  max-width: 100px !important;
  display: flex;
  justify-content: center;
}
.proxy {
  &__row {
    position: relative;
    cursor: pointer;
    transition: all 0.4s ease-out;

    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 1px solid #e3e3e3;
      border-radius: 10px;
      pointer-events: none;
      transition: border-color 0.5s;
    }

    &:hover:after {
      border-color: $main-blue;
    }

    &.active:after {
      box-shadow: 0 0 22px 7px rgba(216, 218, 224, 0.4), 0 0 4px 1px $main-blue;
    }
  }

  &-item {
    padding: 10px;
    vertical-align: top;
    &__commit-info {
      background-color: #fff;
      color: #000;
      margin: -6px -8px;
      padding: 6px 8px;
      min-width: 350px;
      box-shadow: 0 0 22px 7px rgba(129, 131, 136, 0.2),
        0 0 22px 7px rgba(129, 131, 136, 0.2);
      border-radius: 10px;

      p {
        margin-bottom: 5px;
        padding-left: 10px;
      }
    }

    &__name {
      margin: 0;
      // max-width: 100%;
      // width: fit-content;
      // padding-bottom: 1px;
      // border-bottom: 1px dashed #000;
      // line-height: 1.1;
      // padding-right: 20px;
      // @include sliceText();
    }
    &__descList {
      p {
        margin: 0 0 4px;
        font-size: 11px;
        font-weight: 400;
        line-height: 1.5715;
      }
    }
    &__desc {
      min-height: 17px;
      color: #999999;
    }
    &__info {
      color: #565656;
    }
    &__link {
      display: flex;
      gap: 5px;
      color: $main-blue;
      fill: $main-blue;
      font-weight: 600;
    }

    &__branches-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    &__branch {
      width: clamp(200px, 15vw, 300px);
      @include sliceText();
      @include hover-link();
    }

    &_depth {
      min-width: 55px;
      max-width: 55px;
    }

    &_token {
      min-width: 55px;
      max-width: 55px;
    }
  }

  &__arrow {
    padding: 5px;
    cursor: pointer;
    border-radius: 50%;
    line-height: 1;
    transition: transform 0.4s, background-color 0.3s;

    &:active {
      background-color: #e1e1e1;
    }

    &.active {
      position: sticky;
      top: 90px;
      transform: rotate(180deg);
    }
  }
  .error_logs {
    fill: #ff9c36;
    width: 20px;
    height: 20px;
  }
}
</style>
