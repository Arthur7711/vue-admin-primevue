<script setup lang="ts">
import { ref, reactive } from 'vue';
import { postAdminStorage } from '@/API/storages';
import Pencil from '@/components/icons/Pencil.vue';
import { IStorageCreateProps } from '@/API/models/storages';

defineProps<{
  statuses: {
    value: string;
    label: string;
  }[];
}>();
const columns = [
  { title: 'name', key: 'name' },
  { title: 'shortname', key: 'shortname' },
  { title: 'server name', key: 'server_name' },
  { title: 'status', key: 'status' },
  { title: 'qBt url', key: 'qbt_url' },
  { title: 'qBt username', key: 'qbt_username' },
  { title: 'qBt password', key: 'qbt_password' },
];
const open = ref<boolean>(false);
const inputValues = reactive<IStorageCreateProps>({
  name: '',
  shortname: undefined,
  server_name:undefined,
  status: 'new',
  qbt_url: undefined,
  qbt_username: undefined,
  qbt_password: undefined,
});

const showModal = () => {
  open.value = true;
};
const createSorage = async () => {
  try {
    postAdminStorage(inputValues).then(() => {
      open.value = false;
      location.reload();
    });
  } catch (error) {
    throw error;
  }
};
const cancel = () => {
  inputValues.name = '';
  inputValues.shortname = '';
  inputValues.status = '';
  inputValues.qbt_url = '';
  inputValues.qbt_username = '';
  inputValues.qbt_password = '';
  inputValues.server_name = '';
  open.value = false;
};
</script>
<template>
  <div>
    <a-button class="create-button" @click="showModal">
      create new storage
    </a-button>
    <a-modal v-model:visible="open" class="create-storage">
      <h2 class="title">create storage</h2>
      <div class="storage_main">
        <div
          v-for="column of columns"
          class="storage_main__items"
          :key="column.key"
        >
          <div>
            {{ column.title }}
            <span v-if="column.title === 'name'" style="color: red">*</span>
          </div>
          <label
            :style="{ paddingRight: column.key === 'status' ? '0px' : '10px' }"
          >
            <a-select
              v-if="column.key === 'status'"
              v-model:value="inputValues.status"
              style="width: 100%"
              :options="statuses"
              class="storage_status"
            ></a-select>
            <a-input
              v-else
              v-model:value="inputValues[column.key]"
              :disabled="column.key === 'id'"
              class="storage_main__input"
            />
            <Pencil v-if="column.key !== 'status'" />
          </label>
        </div>
      </div>
      <div class="storage_footer">
        <div class="footer_blocks"></div>
        <div class="footer_blocks">
          <a-button @click="cancel"> cancel </a-button>
          <a-button :disabled="!inputValues.name" @click="createSorage">
            save
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<style scoped lang="scss">
.create-button {
  border-radius: 10px;
  background: #1565c0;
  color: #fff;
  border: none;
  margin-left: 20px;
}
.create-storage {
  .stash_icon {
    outline: none !important;
    &:active {
      outline: none !important;
    }
  }
  :global(.ant-modal-content) {
    border-radius: 20px;
  }
  &:global(.ant-modal-close) {
    display: none;
  }
  :global(.title) {
    color: #1565c0;
    font-size: 24px;
    font-weight: 400;
    line-height: 30px;
    text-align: left;
    margin-bottom: 40px;
  }
  :global(.ant-modal-footer) {
    display: none;
  }
  :global(.storage_main) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  :global(.storage_main__items) {
    display: grid;
    grid-template-columns: 4fr 8fr;
    .storage_status {
      height: 42px;
    }
  }
  :global(.storage_main__input) {
    border: none;
    color: #999999;
    box-shadow: none !important;
    height: 40px;

    &:disabled {
      background: none !important;
      border-color: #e3e3e3 !important;
    }
  }
  :global(.ant-select-selector) {
    border: none !important;
    box-shadow: none !important;
    background: none !important;
  }
  label {
    display: flex;
    align-items: center;
    border: 1px solid #e3e3e3;
    border-radius: 10px;
    padding-right: 10px;
  }
  .marker {
    height: 14px;
    fill: #999;
  }
  .storage_footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .footer_blocks {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 50px;
      button {
        border-radius: 10px;
        font-weight: 600;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 36px;
        width: 113px;
        padding-bottom: 5px;
        &:hover {
          opacity: 0.8;
        }
        &:disabled {
          background: #bab3b3 !important;
          border-color: #bab3b3 !important;
        }
      }
      button:nth-child(1) {
        border-color: #1565c0;
        color: #1565c0;
      }
      button:nth-child(2) {
        border-color: #1565c0;
        background: #1565c0;
        color: #fff;
      }
      .update {
        white-space: nowrap;
        color: #bab3b3;
      }
    }
  }
  .confirm_box {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    gap: 10px;
    button {
      border: none;
      color: red;
      &:nth-child(1) {
        color: #1565c0;
      }
    }
  }
}
</style>
