<template>
  <div
    class="branches-table__cell"
    :class="`branches-table__cell_${column.class}`"
  >
    <template v-if="column.key === 'id'">
      {{ record.id }}
    </template>

    <template v-else-if="column.key === 'name'">
      <span class="slice-text">{{ record.name }}</span>
    </template>

    <template v-else-if="column.key === 'is_manual_uploader'">
      <AppCopyTooltip
        v-if="record.is_manual_uploader"
        :title="`manual_uploader_${record.role_name}`"
      >
        <template #text>
          <CloudUploadIcon class="icon" style="width: 20px; height: 20px" />
        </template>
      </AppCopyTooltip>
    </template>

    <template v-else-if="column.key === 'storage_id'">
      {{ record.storage.shortname }}
    </template>

    <template v-else-if="column.key === 'builds_count'">
      <router-link
        v-if="record.builds_count"
        :to="`/builds?branch_id=${record.id}`"
      >
        {{ record.builds_count }}
        <ArrowTopRightIcon class="arrow-top-right" />
      </router-link>
      <template v-else>{{ record.builds_count }}</template>
    </template>

    <template v-else-if="column.key === 'size'">
      <span class="no-wrap" v-if="record.storage_count <= 1">{{ size }}</span>
      <a-tooltip placement="top" overlay-class-name="tooltip-popup" v-else>
        <template #title>
          <div
            class="size-info"
            v-for="branche of storagesBranche"
            :key="branche?.id"
          >
            <span>{{ branche?.storage?.shortname }}</span>
            <span>{{ (branche?.size / Math.pow(1024, 3)).toFixed(2) }} GB</span>
          </div>
        </template>
        <span class="no-wrap dashed">{{ size }}</span>
      </a-tooltip>
    </template>

    <template v-else-if="column.key === 'project_id'">
      <span :title="record.project?.name">{{
        record.project?.name || '-'
      }}</span>
    </template>

    <template v-else-if="column.key === 'role_name'">
      <a-tooltip placement="top" overlay-class-name="tooltip-popup">
        <AppCopyTooltip :title="record.role_name" />
      </a-tooltip>
    </template>

    <template v-else-if="column.key === 'token'">
      <AppCopyTooltip
        v-if="record.builder?.token"
        :title="`${record.role_name} - ${record.builder.token}`"
      >
        <template #text>
          <KeyVariantIcon class="icon" />
        </template>
      </AppCopyTooltip>
      <template v-else>-</template>
    </template>

    <template v-else-if="column.key === 'loader'">
      <span class="slice-text">{{ record.loader }}</span>
    </template>

    <template v-else-if="column.key === 'cacheStorages'">
      <router-link
        v-if="record.cache_storages.length"
        :to="`/caches?${record.cache_storages
          ?.map((el) => `id=${el.id}`)
          .join('&')}`"
        :title="formatCacheStorages(record.cache_storages)"
      >
        public+
        <ArrowTopRightIcon class="arrow-top-right" />
      </router-link>
      <template v-else>public</template>
    </template>

    <template v-else-if="column.key === 'builder'">
      <AlertCircleIcon class="error_logs" />
    </template>

    <template v-else-if="column.key === 'status'">
      {{ record.status }}
    </template>

    <template v-else-if="column.key === 'edit'">
      <AppEditBtn :link="`/branch/edit/${props.record.id}`" />
    </template>

    <template v-else>
      {{ record[column.key] }}
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import AppCopyTooltip from '@/components/UI/AppCopyTooltip.vue';
import AppEditBtn from '@/components/UI/AppEditBtn.vue';
import {
  ArrowTopRightIcon,
  KeyVariantIcon,
  AlertCircleIcon,
  CloudUploadIcon,
} from 'mdi-vue3';
import utils from '@/utils';
import { IBranch } from '@/API/models/branches';
import { ICache } from '@/API/models/caches';
import { IStorageBranch } from '@/API/models/storages';

const props = defineProps<{
  column: {
    title: string;
    key: string;
    class: string;
  };
  record: IBranch;
  storagesBranche?: IStorageBranch[];
}>();

const size = computed(() => utils.bytesConversion(props.record.size, 4, true));

const formatCacheStorages = (items: ICache[]) =>
  items.map((item) => item.name).join('; ');
</script>

<style lang="scss" scoped>
.branches-table {
  &__copy-icon {
    width: 12px;
    cursor: pointer;
  }

  &__cell {
    :deep(
        .ant-select-single:not(.ant-select-customize-input) .ant-select-selector
      ) {
      padding-left: 0;
    }

    & :deep(.ant-select-arrow) {
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }

    & :deep(.ant-select) {
      font-size: 14px;
    }

    &_project,
    &_role-name,
    &_token {
      position: relative;
      white-space: nowrap;
      overflow: hidden;

      &:before {
        position: absolute;
        content: '';
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) calc(100% - 40px),
          rgba(255, 255, 255, 1) 100%
        );
        pointer-events: none;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
    }

    &_name {
      max-width: 200px;
      overflow: hidden;
    }

    &_project {
      max-width: 250px;
      min-width: 70px;
    }

    &_role-name {
      width: 150px;
    }

    &_token {
      width: 50px;
    }
    .dashed {
      border-bottom: 1px dashed;
      cursor: pointer;
    }
  }

  .item-name {
    display: inline-block;
    position: relative;

    &:hover .item-name__pencil {
      fill: #000;
    }

    &__input {
      width: 230px;
      border: 1px dashed #e3e3e3ff;
      padding-right: 60px;
      border-radius: 10px;

      &.error {
        border-color: #f57c00ff;
      }
    }

    &__error {
      position: absolute;
      bottom: -20px;
      left: 0;
      color: #f57c00ff;
      font-size: 13px;
    }

    &__undo,
    &__loader,
    &__content-save,
    &__pencil {
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 100%;
      padding: 0 8px;
    }

    &__undo {
      right: 30px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:focus {
        outline: none !important;
      }

      &:hover {
        background-color: rgba(128, 128, 128, 0.1);
      }
    }

    &__pencil {
      fill: #999999ff;
      pointer-events: none;
      transition: fill 0.3s;
    }

    &__content-save {
      fill: #1565c0ff;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: rgba(128, 128, 128, 0.1);
      }
    }
  }
}

.error_logs {
  fill: #ff9c36;
  width: 25px;
  height: 25px;
}

.slice-text {
  display: block;
  @include sliceText();
}
.size-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
</style>
