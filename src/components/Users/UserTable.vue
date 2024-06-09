<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import SaberLogo from '@/components/icons/SaberLogo.vue';
import LogOut from '@/components/icons/LogOut.vue';
import Trash from '@/components/icons/Trash.vue';
import { IStaffConnections } from '@/API/models/users';
import { format } from 'date-fns';
import { COLORS } from './constants';
import useUserStore from '@/store/user';

const props = defineProps<{
  image: string;
  title: string;
  dataSource: IStaffConnections[];
  selected: number;
  id: number;
}>();

const emit = defineEmits<{
  (e: 'select', value: number): void;
}>();
const apiImg = import.meta.env.VITE_APP_API_URL;
const columns = ref([
  {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    class: 'index',
  },
  {
    title: 'install ID',
    dataIndex: 'install_id',
    key: 'install_id',
    class: 'install-id',
  },
  {
    title: 'IP',
    dataIndex: 'ip',
    key: 'ip',
    class: 'ip',
  },
  {
    title: 'version',
    dataIndex: 'version',
    key: 'version',
    class: 'version',
  },
  {
    title: 'deluge version',
    dataIndex: 'deluge version',
    key: 'deluge_version',
    class: 'deluge-version',
  },
  {
    title: 'last activity',
    dataIndex: 'ping_at',
    key: 'ping_at',
    class: 'ping-at',
  },
]);

const isShowLogOutModal = ref(false);
const isShowDeleteModal = ref(false);
const isOpenDialog = ref(false);
const isShowMore = ref(false);
const selectedData = ref<null | IStaffConnections>(null);

const isSelected = computed(() => props.selected === props.id);

const onOpen = (record:IStaffConnections) => {
  isOpenDialog.value = true;
  isShowDeleteModal.value = true;
  selectedData.value = record;
};
const success = () => {
  try {
    isOpenDialog.value = false;
    isShowLogOutModal.value = false;
    isShowDeleteModal.value = false;
  } catch (error) {
    console.log(error);
  }
};
const cancelModal = () => {
  isOpenDialog.value = false;
  isShowLogOutModal.value = false;
  isShowDeleteModal.value = false;
};
const toggle = () => {
  isShowMore.value = !isShowMore.value;
};

const onEmit = () => {
  props.selected === props.id ? emit('select', 0) : emit('select', props.id);
};
onBeforeMount(() => {
  if (useUserStore.self.value?.permissions.includes('admin')) {
    columns.value.push({
      title: '',
      dataIndex: 'id',
      key: 'id',
      class: 'id'
    });
  }
});
</script>

<template>
  <div
    :class="[
      'user-container',
      { 'user-container_active': isSelected },
      { 'user-container_full': isShowMore },
    ]"
    @click="onEmit"
  >
    <div class="user-container-head">
      <div class="user-container-head__left">
        <img :src="props.image" alt="avatar" />
        <h2>{{ props.title }}</h2>
      </div>
      <button v-if="dataSource.length > 3" @click.stop="toggle">
        <img
          src="/images/arrow-down.svg"
          alt="arrow down"
          :class="['user-container__show-more', { active: isShowMore }]"
        />
      </button>
    </div>
    <a-table
      :data-source="dataSource"
      :columns="columns"
      :pagination="false"
      class="user-container-table"
    >
      <template #headerCell="{ column }">
        <div
          class="user-container-table__header-cell"
          :class="`user-container-table__header-cell_${column.class}`"
        >
          {{ column.title }}
        </div>
      </template>

      <template #bodyCell="{ text, record, index, column }">
        <p
          v-if="column.key === 'index'"
          class="user-container-table__index"
          :style="{
            background:
              selected === id
                ? COLORS[index >= COLORS.length ? index % COLORS.length : index]
                : 'none',
          }"
        >
          {{ index + 1 }}
        </p>
        <p
          v-else-if="column.key === 'install_id'"
          class="user-container-table__install-id"
          :title="record.install_id"
        >
          {{ record.install_id }}
        </p>

        <div v-else-if="column.key === 'ip'" class="user-container-table__ip">
          <img
            v-if="record?.ip_country?.country_id"
            :src="`${apiImg}/countries/${record?.ip_country?.country_id}/flag`"
            alt="flag"
          />
          <SaberLogo v-else />
          <span>{{ record.ip_country?.ip_address }}</span>
        </div>

        <div
          v-else-if="column.key === 'version'"
          class="user-container-table__version"
        >
          <template v-if="record.data?.version">
            <span>{{ record.data?.version }}</span>
            <!--          <UpdateArror v-if="record.newVersion" />-->
          </template>
          <span v-else style="text-align: center; width: 44px">-</span>
        </div>
        <div
          v-else-if="column.key === 'deluge_version'"
          class="user-container-table__deluge-version"
        >
          <span v-if="record.data?.deluge_version">{{ record.data.deluge_version }}</span>
          <span v-else style="text-align: center; width: 44px">-</span>
        </div>

        <div
          v-else-if="column.key === 'ping_at'"
          :style="{
            color:
              // Math.random() < 0.3
              //   ? '#689F38'
              //   : Math.random() < 0.6
              //   ? '#f57c00'
              '#000',
          }"
        >
          {{ text ? format(new Date(text), 'yyyy-MM-dd HH:mm') : '' }}
        </div>
        <div v-else-if="column.key === 'id'" class="user-container-table__id">
          <button
            v-if="record.status === 'logged_in'"
            @click.stop="onOpen(record)"
          >
            <LogOut />
          </button>
          <div v-else style="width: 15px"></div>
          <button @click.stop="onOpen(record)">
            <Trash />
          </button>
        </div>
      </template>
    </a-table>

    <a-modal
      v-model:visible="isOpenDialog"
      width="500px"
      class="user-container-modal"
      :title="
        isShowLogOutModal
          ? 'confirm client log out'
          : isShowDeleteModal
            ? 'confirm client deletion'
            : ''
      "
      centered
      :closable="false"
    >
      <div v-if="selectedData" class="user-container-modal__body">
        <div>
          <img alt="user" :src="props.image" />
          <p>{{ props.title }}</p>
        </div>
        <p>{{ selectedData.install_id }}</p>
      </div>
      <template #footer>
        <div class="user-container-modal__footer">
          <button @click="cancelModal">cancel</button>
          <button disabled @click="success">
            {{
              isShowLogOutModal ? 'log out' : isShowDeleteModal ? 'delete' : ''
            }}
          </button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<style lang="scss">
.user-container {
  width: 100%;
  padding: 14px 20px 0 20px;
  border-radius: 10px;
  border: 1px solid $border-gray;
  overflow: hidden;
  margin-top: 8px;
  max-height: 210px;
  transition:
    border-color 0.4s,
    box-shadow 0.4s;

  &_active {
    box-shadow: 0 0 5px 1px $main-blue;
  }

  &_full {
    max-height: none;
  }

  &:hover {
    border-color: $main-blue;
    cursor: pointer;
  }

  &:nth-child(1) {
    margin-top: 3px;
  }

  p {
    margin: 0;
  }

  &-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__left {
      display: flex;
      align-items: center;
      justify-content: start;
      gap: 14px;

      img {
        width: 40px;
        height: 40px;
        border-radius: 100%;
        object-fit: cover;
      }

      h2 {
        margin-bottom: 0;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.4;
      }
    }
  }

  &__show-more {
    cursor: pointer;
    transition: transform 0.4s;

    &.active {
      transform: rotate(180deg);
    }
  }

  &-table {
    padding: 0;

    thead {
      th {
        font-size: 14px;
        font-weight: 400;
        line-height: 18px;
        color: $main-grey;
        padding: 5px 0 10px 0 !important;

        &:first-child {
          padding-right: 4px !important;
          text-align: center;
        }
      }
    }

    &__header-cell {
      &_deluge-version {
        white-space: normal;
        max-width: 60px;
        text-align: center;
      }

      min-height: 36px;
    }

    tbody td {
      color: #1a1a1a;
      font-size: 14px;
      padding-bottom: 14px !important;
    }

    .ant-table-cell {
      padding: 0;
    }

    .ant-table-cell:has(> .user-container-table__install-id) {
      padding-right: 12px;
      width: 250px;
    }

    &__install-id {
      @include sliceText();
    }

    &__index {
      font-size: 14px;
      font-weight: 600;
      padding: 0;
      color: #000;
      width: 20px;
      height: 20px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__ip {
      display: flex;
      align-items: center;
      gap: 8px;

      img,
      svg {
        max-width: 24px;
        height: auto;
        border-radius: 5px;
      }
    }

    &__version {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    &__deluge-version {
      text-align: center;
      display: block;
      padding-right: 9px;
    }


    &__id {
      display: flex;
      align-items: center;
      gap: 22px;
    }
  }

  &-modal {
    .ant-modal-content {
      border-radius: 15px;

      .ant-modal-header {
        border: none;
        border-radius: 15px;
      }

      .ant-modal-footer {
        border: none;
      }

      .ant-modal-body {
        padding: 0 20px;
      }
    }

    &__body {
      display: flex;
      align-items: center;
      justify-content: space-between;

      p {
        color: #000;
        margin: 0;
      }

      div {
        display: flex;
        align-items: center;
        gap: 14px;

        img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 100%;
        }
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      gap: 14px;

      button {
        border: 1px solid $main-blue;
        width: 50%;
        height: 36px;
        font-size: 18px;
        font-weight: 600;
        border-radius: 10px;

        &:nth-child(1) {
          color: $main-blue;
        }

        &:nth-child(2) {
          background-color: $main-blue;
          color: #fff;
        }

        &:disabled {
          border-color: $main-grey;
          background-color: $main-grey;
          cursor: default;
        }
      }
    }
  }
}
</style>
