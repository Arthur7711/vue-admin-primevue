<script setup lang="ts">
import { IStorage } from '@/API/models/storages';
import { ref, watch, reactive, computed } from 'vue';
import { format } from 'date-fns';
import { putAdminStorage, deleteAdminStorage } from '@/API/storages';
import Settings from '@/components/icons/Settings.vue';
import Pencil from '@/components/icons/Pencil.vue';
import TrashBig from '@/components/icons/TrashBig.vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  changeFill?: boolean;
  data: IStorage;
  options: { value: string; label: string }[];
}>();
const columns = [
  { title: 'id', key: 'id' },
  { title: 'name', key: 'name' },
  { title: 'shortname', key: 'shortname' },
  { title: 'server name', key: 'server_name' },
  { title: 'status', key: 'status' },
  { title: 'qBt url', key: 'qbt_url' },
  { title: 'qBt username', key: 'qbt_username' },
  { title: 'qBt password', key: 'qbt_password' },
];
const router = useRouter();
const open = ref<boolean>(false);
const showDelete = ref(false);
const inputValues = reactive<{ [key: string]: string | number }>({
  id: -1,
  name: '',
  shortname: '',
  status: '',
  qbt_url: '',
  qbt_username: '',
  qbt_password: '',
  server_name: '',
});

const showModal = () => {
  open.value = true;
};
const updatedInfo = computed(() => {
  const info = {};
  Object.entries(inputValues).forEach((el) => {
    if (el[1] !== props.data[el[0]]) {
      info[el[0]] = el[1];
    }
  });
  return info;
});
const updateSorage = async () => {
  const info = {};
  Object.entries(inputValues).forEach((el) => {
    if (el[1] !== props.data[el[0]]) {
      info[el[0]] = el[1];
    }
  });
  try {
    putAdminStorage(Number(inputValues.id), info).then(() => {
      open.value = false;
      location.reload();
    });
  } catch (error) {
    throw error;
  }
};
const cancelUpdate = () => {
  inputValues.id = props.data.id;
  inputValues.name = props.data.name;
  inputValues.shortname = props.data.shortname;
  inputValues.status = props.data.status;
  inputValues.qbt_url = props.data.qbt_url;
  inputValues.qbt_username = props.data.qbt_username;
  inputValues.qbt_password = props.data.qbt_password;
  inputValues.server_name = props.data.server_name;
  open.value = false;
};
const deleteStorage = async () => {
  try {
    await deleteAdminStorage(inputValues.id);
    showDelete.value = false;
    location.reload();
  } catch (error) {
    throw error;
  }
};
watch(
  () => props.data,
  () => {
    inputValues.id = props.data.id;
    inputValues.name = props.data.name;
    inputValues.shortname = props.data.shortname;
    inputValues.status = props.data.status;
    inputValues.qbt_url = props.data.qbt_url;
    inputValues.qbt_username = props.data.qbt_username;
    inputValues.qbt_password = props.data.qbt_password;
    inputValues.server_name = props.data.server_name;
  },
  { deep: true, immediate: true }
);
</script>
<template>
  <div>
    <Settings
      :stroke-color="changeFill ? '#f57c00' : '#000'"
      style="cursor: pointer"
      @click="showModal"
    />
    <a-modal v-model:visible="open" class="edit-storage">
      <h2 class="title">edit storage</h2>
      <div class="storage_main">
        <div
          v-for="column of columns"
          class="storage_main__items"
          :key="column.key"
        >
          <div>{{ column.title }}</div>
          <label
            :style="{ paddingRight: column.key === 'status' ? '0px' : '10px' }"
          >
            <a-input
              v-if="column.key !== 'status'"
              v-model:value="inputValues[column.key]"
              :disabled="column.key === 'id'"
              class="storage_main__input"
            />
            <a-select
              v-if="column.key === 'status'"
              v-model:value="inputValues.status"
              style="width: 100%"
              :options="options"
            ></a-select>
            <Pencil v-if="column.key !== 'status' && column.key !== 'id'" />
          </label>
        </div>
      </div>
      <div class="storage_footer">
        <div class="footer_blocks">
          <a-tooltip
            overlay-class-name="tooltip-popup"
            placement="left"
            title="to be deleted, storage must not be linked to other entities — e.g. 
                   it cannot contain any project branches or builds"
          >
            <TrashBig
              style="cursor: pointer"
              class="stash_icon"
              @click="showDelete = !showDelete"
            />
          </a-tooltip>
          <span class="update"
            >last update:
            {{
              data?.updated_at
                ? format(new Date(data.updated_at), 'yyyy-MM-dd')
                : ''
            }}</span
          >
        </div>
        <div class="footer_blocks">
          <a-button @click="cancelUpdate"> cancel </a-button>
          <a-button
            :disabled="Object.keys(updatedInfo).length < 1"
            @click="updateSorage"
          >
            save
          </a-button>
        </div>
      </div>
      <div
        class="confirm_box"
        :style="{ display: showDelete ? 'flex' : 'none' }"
      >
        <div>Are you sure you want to delete this storage?</div>
        <div>
          <a-button type="link" @click="showDelete = false">cancel</a-button>
          <a-button type="link" @click="deleteStorage">confirm</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<style scoped lang="scss">
.edit-storage {
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
