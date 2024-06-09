<template>
  <div class="caches-table__cell" :class="`caches-table__cell_${column.class}`">
    <template v-if="column.key === 'name'">
      <a-tooltip placement="topLeft" color="#fff">
        <template #title>
          <div style="color: #000">
            <p style="margin-bottom: 0">
              <b>{{ record.name }}</b>
            </p>
            <span>{{ record.description }}</span>
          </div>
        </template>
        <div>
          <AppCopyTooltip :copy-text="record.name" />
          <p class="caches-table__cell_description">{{ record.description }}</p>
        </div>
      </a-tooltip>
    </template>

    <template v-else-if="column.key === 'type'">
      <div class="pl-3">
        <router-link
          v-if="record.type === 'internal'"
          :to="`/branches?id=${JSON.stringify(record.branches?.map(el => el.id))}`"
          class="caches-table__link"
        >
          {{ record.type }}
          <ArrowTopRightIcon class="arrow-top-right" />
        </router-link>
        <template v-else>{{ record.type }}</template>
      </div>
    </template>

    <template v-else-if="column.key === 'free_space'">
      <span style="white-space: nowrap">
        {{ record.external_data?.free_space ? utils.bytesConversion(record.external_data.free_space, 3, true) : '' }}
      </span>
    </template>

    <template v-else-if="column.key === 'depth'">
      <div class="center">
        <CachesModal
          :record-id="record.id"
          :value="record.cache_users.length"
        />
        / {{ record.depth }}
      </div>
    </template>

    <template v-else-if="column.key === 'token'">
      <AppCopyTooltip :title="record.token">
        <template #text>
          <KeyVariantIcon class="icon" />
        </template>
      </AppCopyTooltip>
    </template>

    <template v-else-if="column.key === 'error_logs'">
      <router-link to="/error/logs"><AlertCircleIcon /></router-link>
    </template>

    <template v-else-if="column.key === 'last_commit'">
      <a-tooltip
        v-if="record.external_data"
        placement="bottomLeft"
        trigger="click"
        color="#fff"
        class="caches-table-tooltip"
        style="border-radius: 10px"
      >
        <template #title>
          <div class="caches-table__commit-info">
            <p v-for="key in Object.keys(record.external_data)" :key="key">
              <b>{{ key }}:</b>
              {{ record.external_data[key] }}
            </p>
          </div>
        </template>
        <div>
          <!-- <AsteriskIcon class="icon caches-table-tooltip__icon" /> -->
          <InfoIcon class="icon caches-table-tooltip__icon" />
          {{ record.external_data.git_commit_desc }}
        </div>
      </a-tooltip>
      <template v-else>-</template>
    </template>

    <template v-else-if="column.key === 'ping_at'">
      <AppDateParser :date="record[column.key] || ''" time-needed />
    </template>

    <template v-else-if="column.key === 'edit'">
      <router-link
        :to="`/cache/edit/${props.record.id}`"
        class="cache-item__link"
      >
        <PencilIcon style="width: 15px" />
        edit
      </router-link>
    </template>
    <template v-else-if="column.key === 'pre_create_users'">
      <div class="center">
        {{ record[column.key] }}
      </div>
    </template>
    <template v-else-if="column.key === 'status'">
      <div style="padding-left: 5px">
        {{ record[column.key] }}
      </div>
    </template>
    <template v-else>
      {{ record[column.key] }}
    </template>
  </div>
</template>

<script lang="ts" setup>
import CachesModal from "@/components/Caches/CachesModal.vue";
import AppCopyTooltip from "@/components/UI/AppCopyTooltip.vue";
import AppDateParser from "@/components/UI/AppDateParser.vue";
import {
  AlertCircleIcon,
  ArrowTopRightIcon,
  KeyVariantIcon,
  PencilIcon,
} from "mdi-vue3";
import { ICache } from "@/API/models/caches";
import utils from '@/utils'
import InfoIcon from "@/components/icons/InfoIcon.vue";

const props = defineProps<{
  column: {
    title: string;
    key: string;
    class: string;
  };
  record: ICache;
}>();
</script>

<style lang="scss" scoped>
.pl-3 {
  padding-left: 26px;
}
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.caches-table {
  &__cell {
    &_name,
    &_description,
    &_host,
    &_id-address,
    &_last-commit {
      @include sliceText();
    }

    &_name,
    &_description {
      margin: 0;
      width: clamp(200px, 7vw, 250px);
      @include sliceText();
    }

    &_host {
      width: clamp(150px, 7vw, 200px);
    }

    &_id-address {
      width: 100px;
    }

    &_last-commit {
      width: 190px;
    }

    &_description {
      font-size: 11px;
      color: $main-grey;
    }

    &_token {
      width: 50px;
    }

    &_error-logs a {
      display: block;
      text-align: center;

      svg {
        width: 25px;
        fill: $main-orange;
      }
    }

    &_edit a {
      display: flex;
      gap: 5px;
      color: $main-blue;
      fill: $main-blue;
      font-weight: 600;
    }

    &_status {
      padding-left: 4px;
    }
  }

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

  &-tooltip {
    cursor: pointer;
    &__icon {
      transform: translateY(2px);
    }
  }

  &__link {
    @include hover-link();
  }
}
</style>
