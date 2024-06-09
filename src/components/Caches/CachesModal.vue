<script setup lang="ts">
import { ArrowTopRightIcon } from "mdi-vue3";
import { ref, watch } from "vue";
import { getAdminCache } from "@/API/caches";
import { ICacheUser } from "@/API/models/caches";
import ModalTable from '@/components/Caches/ModalTable.vue'

const props = defineProps<{ recordId: number; value: string | number }>();
const visible = ref(false);
const id = ref(Infinity);
const tableValues = ref<ICacheUser[]>([]);

const openModal = () => {
  id.value = props.recordId;
  visible.value = true;
};
watch(id, async () => {
  const { cache_users } = await getAdminCache(id.value, {
    with: ["cacheUsers.build"],
  });
  tableValues.value = cache_users;
});
</script>

<template>
  <span class="caches-modal">
    <span class="caches-modal__value" @click="openModal">{{ value }}</span>
    <a-modal v-model:visible="visible" @cancel="visible = false">
      <div class="caches-modal__in">
        <div class="caches-modal__in__head">
          <h2>
            {{ `cache #${recordId} builds` }}
          </h2>
          <router-link
            :to="`/builds?id=${JSON.stringify(tableValues.map(el => el.build_id))}&operator=!=@`"
          >
            <ArrowTopRightIcon class="ico" />
          </router-link>
        </div>

        <ModalTable :tableValues="tableValues" />
      </div>
    </a-modal>
  </span>
</template>

<style scoped lang="scss">
.caches-modal {
  &__value {
    cursor: pointer;
    text-decoration: underline;
  }
  &__in__head:deep {
    display: flex;
    align-items: start;
    .ico {
      width: 15px;
    }
  }
  :global(.ant-modal-header) {
    display: none;
  }
  :global(.ant-modal-footer) {
    display: none;
  }
  :global(.ant-modal-content) {
    border-radius: 15px;
    overflow: hidden;
  }
}
</style>
