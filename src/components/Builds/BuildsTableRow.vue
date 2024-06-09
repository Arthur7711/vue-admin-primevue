<template>
  <div
    class="builds-table-cell"
    :class="{
      [`builds-table-cell_${column.class}`]: true,
    }"
  >
    <template v-if="column.key === 'id'">
      <div style="display: flex; align-items: center; gap: 4px">
        <span>{{ record.id }}</span>
      </div>
    </template>

    <template v-else-if="column.key === 'project_id'">
      <AppCopyTooltip :title="record.project.name" />
    </template>

    <template v-else-if="column.key === 'name'">
      <AppCopyTooltip :title="record[column.key]">
        <span v-if="record.deleted_at" style="color: red; margin-right: 5px"
          >[X]</span
        >
      </AppCopyTooltip>
    </template>

    <template v-else-if="column.key === 'hash_id'">
      <AppCopyTooltip v-if="record?.hash_id" :title="record.hash_id" />
      <template v-else>-</template>
    </template>

    <template v-else-if="column.key === 'build_size'">
      <AppBytesConvertation
        v-if="record.build_size"
        :bytes="record.build_size"
      />
      <template v-else>-</template>
    </template>

    <template v-else-if="column.key === 'status'">
      <div
        style="
          display: flex;
          gap: 8px;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        "
      >
        <a-tooltip
          v-if="record[column.key] === 'seeding'"
          placement="top"
          overlay-class-name="tooltip-popup"
        >
          <template #title>
            <a
              download
              style="
                display: flex;
                align-items: center;
                gap: 4px;
                color: #1565c0;
              "
              @click="() => downloadFile(record.hash_id, record.name)"
            >
              download torrent file
              <img src="/images/torrent-seeding.svg" alt="" />
            </a>
          </template>
          <img src="/images/torrent-seeding.svg" alt="" width="14" />
        </a-tooltip>
        <img
          v-else
          :src="`/images/torrent-${record[column.key]}.svg`"
          alt=""
          style="width: 14px"
        />
        <span>{{
          record[column.key]
        }}</span>
      </div>
    </template>

    <template v-else-if="column.key === 'created_at'">
      <AppDateParser :date="record[column.key] || ''" />
    </template>

    <template v-else-if="column.key === 'expires_at' && record.deleted_at">
      <AppDateParser :date="record[column.key] || ''" time-needed />
    </template>
    <template v-else-if="column.key === 'expires_at'">
      <span :style="{ color: props.record.is_permanent ? '#d9d9d9' : '#000' }">
        {{ format(new Date(data.expires_at), 'yyyy-MM-dd HH:mm') }}
      </span>
    </template>

    <template v-else-if="column.key === 'is_permanent'">
      <div style="text-align: center">
        <a-checkbox
          v-model:checked="data.is_permanent"
          :disabled="true"
          @change="setActiveKey('is_permanent')"
        />
      </div>

      <teleport to="body">
        <a-modal
          v-model:visible="isShowModal"
          class="custom-modal"
          :closable="false"
          cancel-text="cancel"
          ok-text="confirm"
          centered
          width="540px"
          @cancel="cancelModal"
          @ok="putBuild"
        >
          <h3>confirm 'is permanent' change</h3>
          <p>
            "is permanent" checkbox saves the build from regular build clean-up
            until the checkbox is unchecked, are you sure you want to change it?
          </p>
        </a-modal>
      </teleport>
    </template>

    <template v-else-if="column.key === 'branch_id'">
      <router-link
        v-if="record.branch?.name"
        :to="`/branches?name=${record.branch.name}`"
        class="builds-table-cell__link"
      >
        {{ record.branch.name }}
        <ArrowTopRightIcon class="table-link__icon arrow-top-right" />
      </router-link>
      <template v-else>-</template>
    </template>

    <template v-else-if="column.key === 'storage'">
      <div class="storage">
        <span style="width: 100%; display: block">{{
          record?.storage?.shortname || '-'
        }}</span>
        <!-- <img
          src="/images/marker-edit.svg"
          alt="marker"
          @click="update?.updateId(record?.id)"
        /> -->
      </div>
    </template>

    <template v-else-if="column.key === 'proxy'">
      <router-link
        v-if="record.proxy_storages?.length"
        :to="`/proxy?${record.proxy_storages
          .map((el) => 'id=' + el?.id)
          .join('&')}`"
        class="builds-table-cell__link"
      >
        <a-tooltip placement="right">
          <template #title>
            <div>
              <div v-for="item of record.proxy_storages" :key="item.id">
                {{ item.name }}
              </div>
            </div>
          </template>
          {{ record.proxy_storages.length }}
        </a-tooltip>
        <ArrowTopRightIcon class="table-link__icon arrow-top-right" />
      </router-link>
      <template v-else>-</template>
    </template>

    <template v-else-if="column.key === 'ip'">
      <template v-if="record.external_data">{{ record.external_data?.ip }}</template>
      <div v-else class="text-center">-</div>
    </template>

    <template v-else-if="column.key === 'hostname'">
      <span v-if="record.external_data" class="no-wrap">{{ record.external_data?.hostname }}</span>
      <div v-else class="text-center">-</div>
    </template>

    <template v-else-if="column.key === 'downloads'">
      <div class="downloads">
        <router-link :to="`/builds/downloadHistory/${record.id}`">
          <a-tooltip>
            <template #title>go to build's download history</template>
            <img src="/images/downloads-button.svg" alt="" />
          </a-tooltip>
        </router-link>
      </div>
    </template>

    <template v-else-if="column.key === 'edit'">
      <router-link :to="`/builds/edit/${record.id}`" class="link">
        <PencilIcon style="width: 15px" /> edit
      </router-link>
    </template>

    <template v-else>
      {{ record[column.key] }}
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue';
import { ArrowTopRightIcon, PencilIcon } from 'mdi-vue3';
import dayjs from 'dayjs';
import { IBuild, IBuildData } from '@/API/models/builds';
import { notification } from 'ant-design-vue';
import AppDateParser from '@/components/UI/AppDateParser.vue';
import AppBytesConvertation from '@/components/UI/AppBytesConvertation.vue';
import AppCopyTooltip from '@/components/UI/AppCopyTooltip.vue';
import { putAdminBuild, getDownloadsBuild } from '@/API/builds';
import { format, endOfDay } from 'date-fns';

const props = defineProps<{
  column: {
    title: string;
    key: string;
    class: string;
  };
  record: IBuild;
}>();

const FORMAT = 'YYYY-MM-DD HH:mm';

const isShowModal = ref(false);
const isError = ref(false);
const activeKey = ref('expires_at');
const data: IBuildData = reactive({
  expires_at: null,
  is_permanent: false,
});

// const confirms = computed(() => ({
//   expires_at:
//     data.expires_at.$d && new Date(data.expires_at.$d) > new Date()
//       ? 'changing the expiration date means that the build will be deleted from the storage on that new date. Are you sure you want to change it?'
//       : 'If expiration date is < than now, this build will be deleted!',
// }));
const downloadFile = (hash: string, name: string) => {
  getDownloadsBuild(hash, name);
};
const setActiveKey = (key: string) => {
  activeKey.value = key;
  isShowModal.value = true;
};

const disabledDate = (current: any) =>
  props.column.key === 'expires_at' &&
  current &&
  new Date(current.$d) < new Date(props.record.created_at);

const cancelModal = () => {
  if (activeKey.value === 'expires_at') {
    if (props.record.expires_at) {
      data.expires_at = dayjs(props.record.expires_at, FORMAT);
    }
  } else if (activeKey.value === 'is_permanent') {
    data.is_permanent = Boolean(props.record.is_permanent);
  } else {
    data[activeKey.value] = props.record[activeKey.value];
  }

  isShowModal.value = false;
};

const onWarning = () => {
  notification.warn({
    message: 'expiration date cannot be null',
  });
  if (props.record.expires_at) {
    data.expires_at = dayjs(props.record.expires_at, FORMAT);
  }
};

const putBuild = async () => {
  let val = data[activeKey.value];

  if (activeKey.value === 'expires_at') {
    val = val
      ? `${new Date(val.$d)
          .toLocaleDateString()
          .split('.')
          .reverse()
          .join('-')} ${new Date(val.$d).toLocaleTimeString()}`
      : undefined;
  } else if (typeof val === 'string' && !val?.trim()) {
    isError.value = true;
    return false;
  } else if (isError.value) {
    isError.value = false;
  }

  const payload = {
    [activeKey.value]: val === 'string' ? val.trim() : val,
  };

  try {
    if (
      activeKey.value === 'is_permanent' &&
      !payload?.is_permanent &&
      format(endOfDay(new Date(props.record.expires_at)), 'yyyy-MM-dd') ===
        format(endOfDay(new Date()), 'yyyy-MM-dd')
    ) {
      notification.warning({
        message:
          "this build will be deleted in 1 minute because it was changed to 'not permanent' and its previous date expiration has passed",
      });
    }
    await putAdminBuild(props.record.id, payload);
    props.record[activeKey.value] = data[activeKey.value];
    notification.success({
      message: `${activeKey.value} has been updated!`,
    });
  } catch (e) {
  } finally {
    if (isShowModal.value) {
      isShowModal.value = false;
    }
  }
};
onMounted(() => {
  if (
    props.column.key === 'expires_at' &&
    props.record.expires_at &&
    !props.record.deleted_at
  ) {
    data.expires_at = dayjs(props.record.expires_at, FORMAT);
  } else if (props.column.key === 'is_permanent' && props.record.is_permanent) {
    data.is_permanent = Boolean(props.record.is_permanent);
  }
});
</script>

<style lang="scss" scoped>
.builds-table-cell {
  position: relative;
  white-space: nowrap;

  &_name,
  &_hash,
  &_branch,
  &_storage,
  &_project,
  &_role {
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

  &_id {
    width: 90px;
  }

  &_name {
    min-width: 400px;
    max-width: fit-content;
    &:before {
      background: none
    }
  }

  &_hash {
    width: 120px;
  }

  &_size {
    width: 48px;
  }

  &_status {
    display: flex;
    justify-content: center;
    min-width: 20px;
    max-width: 20px;
  }

  &_branch {
    min-width: 100px;
    max-width: 150px;
  }

  &_created-at {
    width: 52px;
  }

  &_proxy {
    width: 33px;
  }

  &_storage {
    min-width: 60px;
    max-width: 130px;
    position: relative;
    .storage img {
      position: absolute;
      right: 0;
      top: 7px;
      cursor: pointer;
    }
  }

  &_expires-at {
    width: 90px;
  }
  &_project {
    min-width: 60px;
    max-width: 140px;
  }

  &_role {
    min-width: 100px;
    max-width: 170px;
  }

  &__link {
    @include hover-link();
  }

  .custom-picker {
    padding: 5px 7px;
    border-radius: 10px;
  }
  .downloads {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .link {
    display: flex;
    gap: 5px;
    color: $main-blue;
    fill: $main-blue;
    font-weight: 600;
  }
}

.dashed-border {
  border: 1px dashed #e3e3e3;
  border-radius: 5px;
  padding: 4px;
  margin: -4px;
  cursor: pointer;

  &:hover {
    border-color: #b6b6b6;
  }
}
</style>
