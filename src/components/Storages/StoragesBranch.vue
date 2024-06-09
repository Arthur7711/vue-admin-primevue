<template>
  <tr :class="{ active: isActive }">
    <td>
      <router-link
        :to="`/branches?id=${item.id}`"
        class="storage-project-table__item storage-project-table-link table-link"
      >
        <span class="table-link__id">
          {{ item.id }}
          <ArrowTopRightIcon class="table-link__icon arrow-top-right" />
        </span>
        <span class="table-link__name">{{ item.name }}</span>
      </router-link>
    </td>
    <td v-if="item.size > 0">
      <span class="storage-project-table__item">{{ size }}</span>
    </td>
    <td v-else><span class="storage-project-table__item">0</span></td>
    <td>
      <Loader v-if="!expire" :width="12" />
      <span v-else class="storage-project-table__item">
        <AppDateParser
          v-if="expire && expire.expires_at"
          :date="expire.expires_at"
        />
        <template v-else-if="expire && expire.expires_at === null">∞</template>
        <template v-else>-</template>
      </span>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import utils from "@/utils";
import { ArrowTopRightIcon } from "mdi-vue3";
import { computed } from "vue";
import AppDateParser from "@/components/UI/AppDateParser.vue";
import Loader from "@/components/icons/Loader.vue";
import { IStorageBranch } from "@/API/models/storages";
import { IBuild } from "@/API/models/builds";

const props = defineProps<{
  item: IStorageBranch;
  expire: IBuild | null;
  isActive: boolean;
}>();

const size = computed(() => utils.bytesConversion(props.item.size, 4, true));
</script>

<style lang="scss" scoped>
.active {
  background-color: #e3e3e3;
}

.storage-project-table {
  &__item {
    display: inline-block;
    padding: 4px 0;
    font-size: 14px;
    color: #000;
    white-space: nowrap;
  }

  td:first-child .storage-project-table__item {
    padding-left: 16px;
  }

  td:last-child .storage-project-table__item {
    padding-right: 16px;
  }

  .table-link {
    color: #000;
    transition: color 0.4s;

    &:hover {
      color: $main-green;
    }

    &__id {
      display: inline-block;
      min-width: 30px;
      text-align: right;
    }
  }
}
</style>
