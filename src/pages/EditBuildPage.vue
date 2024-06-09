<script setup lang="ts">
import { reactive, onMounted, ref, computed } from 'vue';
import AppBreadCrumbs from '@/components/UI/AppBreadCrumbs.vue';
import { AlertCircleIcon, PencilIcon } from 'mdi-vue3';
import AppSelect from '@/components/UI/AppSelect.vue';
import dayjs from 'dayjs';
import { getAdminBuilds, putAdminBuild } from '@/API/builds';
import { useRoute, useRouter } from 'vue-router';
import { format } from 'date-fns';
import { IBuild } from '../API/models/builds';
import { notification } from 'ant-design-vue';
import {
  pendingStatuses,
  missedStatuses,
  errorStatuses,
  seedingStatus,
} from '@/components/Builds/constants';
import { IBuildData } from '@/components/Builds/types';

const breadcrumbs = [
  { name: 'builds', to: '/builds', disabled: false },
  { name: 'editing build', to: '', disabled: true },
];

const route = useRoute();
const router = useRouter();
const info = ref<IBuild | null>(null);
const data = reactive<IBuildData>({
  name: '',
  branch_name: '',
  status: '',
  expires_at: undefined,
  is_permanent: false,
  storage_name: '',
});
const statuses = ref<string[]>([]);
const isExpiresChanged = computed(() => {
  if (data.expires_at?.$d && info.value?.expires_at) {
    return (
      format(data.expires_at?.$d, 'yyyy-MM-dd HH:mm') ===
      format(
        dayjs(info.value?.expires_at, 'YYYY-MM-DD HH:mm')?.$d,
        'yyyy-MM-dd HH:mm'
      )
    );
  } else {
    return false;
  }
});
const isPermanentChanged = computed(
  () => Number(data.is_permanent) === info?.value?.is_permanent!
);
const updateBuild = async () => {
  try {
    const requestData = {
      name: data.name === info.value?.name ? undefined : data.name,
      'branch.name':
        data.branch_name === info.value?.branch?.name
          ? undefined
          : data.branch_name,
      'storage.name':
        data.storage_name === info.value?.storage?.name
          ? undefined
          : data.storage_name,
      expires_at: isExpiresChanged.value
        ? undefined
        : format(data.expires_at?.$d, 'yyyy-MM-dd HH:mm:ss'),
      is_permanent: isPermanentChanged.value
        ? undefined
        : Number(data.is_permanent),
      status: data.status === info.value?.status ? undefined : data.status,
    };
    if (Object.values(requestData).filter((el) => el !== undefined).length) {
      putAdminBuild(Number(route.params?.id), requestData);
      router.push('/builds');
      notification.success({ message: 'build has been updated!' });
    }
  } catch (e) {
    throw new Error();
  }
};
onMounted(async () => {
  try {
    const buildInfo = await getAdminBuilds({
      with: ['branch', 'storage'],
      filters: JSON.stringify([
        {
          column: 'id',
          value: route.params?.id,
        },
      ]),
    });
    info.value = buildInfo.items[0];
    data.name = info.value.name;
    data.branch_name = info.value.branch?.name!;
    data.storage_name = info.value.storage?.name!;
    data.expires_at = dayjs(info.value.expires_at, 'YYYY-MM-DD HH:mm');
    data.is_permanent = !!info.value.is_permanent;
    data.status = info.value.status;

    switch (info.value.status) {
      case 'seeding':
        statuses.value = seedingStatus;
        break;
      case 'pending':
        statuses.value = pendingStatuses;
        break;
      case 'missed':
        statuses.value = missedStatuses;
        break;
      case 'error':
        statuses.value = errorStatuses;
        break;
      default:
        statuses.value = [];
        break;
    }
  } catch (e) {
    throw new Error();
  }
});
</script>
<template>
  <section class="build">
    <AppBreadCrumbs :items="breadcrumbs" />
    <div class="main-content">
      <h2 class="build__title">
        editing build {{ Number(data.is_permanent) === info?.is_permanent }}
      </h2>
      <div class="build__left">
        <a-form name="build-form" :model="data" @finish="updateBuild">
          <a-form-item
            class="build-form__item"
            name="name"
            :rules="[{ required: true, message: 'enter build name' }]"
          >
            <div class="flexbox">
              <span>build name</span>
              <a-input v-model:value="data.name" />
            </div>
          </a-form-item>
          <a-form-item
            class="build-form__item"
            name="branch_name"
            :rules="[{ required: true, message: 'enter branch name' }]"
          >
            <div class="flexbox">
              <span>branch name</span>
              <a-input v-model:value="data.branch_name" disabled />
            </div>
          </a-form-item>
          <a-form-item class="build-form__item" name="share">
            <div class="flexbox">
              <span>share build virtually to branches</span>
              <div class="share">
                <p>something</p>
                <PencilIcon />
              </div>
            </div>
          </a-form-item>
          <a-form-item class="build-form__item" name="storage">
            <div class="flexbox">
              <span>storage</span>
              <div class="share">
                <p>{{ data.storage_name }}</p>
              </div>
            </div>
          </a-form-item>
          <a-form-item class="build-form__item" name="status">
            <div class="flexbox">
              <span>
                build status
                <a-tooltip overlay-class-name="tooltip-popup build-status">
                  <template #title
                    >do not change builds status unless it’s necessary! only the
                    following manual status change is accepted:
                    <ul>
                      <li>
                        pending / missed / error => uploaded / pending / missed
                        / error
                      </li>
                      <li>seeding / missed / error => deleting</li>
                    </ul>
                  </template>
                  <AlertCircleIcon class="status-icon" /></a-tooltip
              ></span>
              <AppSelect
                v-model:value="data.status"
                :items="statuses"
                color="#999999"
                v-if="statuses.length"
              />
              <div class="share" v-else>
                <p>{{ data.status }}</p>
              </div>
              <p v-if="data.status === 'deleting'" class="delete_message">
                ⚠️ saving build status change to 'deleting' will lead to
                irreversible build deletion!
              </p>
            </div>
          </a-form-item>
          <a-form-item class="build-form__item" name="status">
            <div class="flexbox">
              <span>expires</span>
              <a-date-picker
                v-model:value="data.expires_at"
                format="YYYY-MM-DD HH:mm"
                size="small"
                class="custom-picker"
                :allow-clear="false"
                :show-time="{ defaultValue: dayjs('00:00', 'HH:mm') }"
              />
            </div>
            <p class="delete_message" v-if="!isExpiresChanged">
              ⚠️ changing the expiration date means that the build will be
              deleted from the storage on that new date
            </p>
          </a-form-item>
          <a-form-item class="build-form__item" name="is_permanent">
            <label class="checked_label">
              <a-checkbox
                v-model:checked="data.is_permanent"
                class="checkbox"
              />
              <span>is permanent</span>
            </label>
            <p class="delete_message" v-if="!isPermanentChanged">
              ⚠️"is permanent" checkbox saves the build from regular build
              clean-up until the checkbox is unchecked. Once the flag is
              removed, previous expiry date is activated.
            </p>
          </a-form-item>
          <a-form-item>
            <a-button class="save" html-type="submit">save</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </section>
</template>
<style scoped lang="scss">
.main-content {
  min-height: calc(100vh - 100px);
}
.build {
  p {
    padding: 0;
    margin: 0;
  }
  &__title {
    @include Font-24-30-700;
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
        margin-bottom: 4px;
      }
      p {
        padding-left: 6px;
      }

      input,
      .share {
        min-height: 50px;
        border-radius: 10px;
        border: 1px solid #e3e3e3;
        box-shadow: none;
      }
      .share {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0px 8px 0 0;
        svg {
          width: 15px;
          color: #b4b2b2;
          cursor: pointer;
        }
      }
      &:deep(.ant-select-selector) {
        height: 50px;
        border: 1px solid #e3e3e3 !important;
        border-radius: 10px;
      }
      &:deep(.ant-picker) {
        height: 50px;
        border: 1px solid #e3e3e3 !important;
        border-radius: 10px;
        box-shadow: none;
      }
    }
    .delete_message {
      color: #e77575;
      font-size: 12px;
      font-weight: 700;
      line-height: 18px;
      margin-top: 6px;
    }
    .info {
      font-size: 12px;
      margin-top: 4px;
      white-space: wrap;
      color: #999;
    }
    .checked_label {
      display: flex;
      align-items: center;
      gap: 10px;
      width: min-content;
      &:deep(.ant-checkbox) {
        border: 1px solid #474747;
        border-radius: 2px;
      }
      span {
        white-space: nowrap;
      }
    }
    .save {
      width: 100%;
      height: 40px;
      padding: 7px 20px 7px 20px;
      border-radius: 10px;
      gap: 10px;
      background: #1565c0;
      color: #fff;
      font-family: Source Sans Pro;
      font-size: 18px;
      font-weight: 600;
      line-height: 22px;
    }
    .status-icon {
      fill: #ff9c36;
      width: 10px;
      height: 10px;
      cursor: pointer;
    }
  }
}
:global(.build-status) {
  min-width: 400px;
}
</style>
