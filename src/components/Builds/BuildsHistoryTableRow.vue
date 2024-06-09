<script setup lang="ts">
import { format } from "date-fns";
import utils from "@/utils";
import { ArrowTopRightIcon } from "mdi-vue3";
import formatTime from "@/utils/formatTime";
import { IColumnKey } from "./types";
import { ApiImg } from "./constants";
import { IHistoryItem } from "@/API/models/users";
import SaberLogo from "../icons/SaberLogo.vue";

defineProps<{
  column: IColumnKey;
  record: IHistoryItem;
  index: number;
}>();
</script>
<template>
  <div
    class="history-cell"
    :class="{
      [`history-cell_${column.class}`]: true,
    }"
  >
    <template v-if="column.key === 'index'">{{ index + 1 }}</template>
    <template v-if="column.key === 'user'">
      <img
        alt="user"
        :src="`${utils.getAvatar(20, record?.connection?.staff?.samaccountname)}`"
      />
      <span>{{ record.connection?.staff?.displayname }}</span>
    </template>
    <template v-else-if="column.key === 'install_id'">
      <router-link :to="`/users?id=${record?.connection?.staff_id}&install_id=${ record.connection?.install_id }`">
        {{ record.connection?.install_id }}
        <ArrowTopRightIcon class="arrow-top-right" />
      </router-link>
    </template>
    <template v-else-if="column.key === 'ip'">
      <img
        v-if="record?.connection?.ip_country_id"
        :src="`${ApiImg}/countries/${record?.connection?.ip_country_id}/flag`"
        alt="flag"
      />
      <SaberLogo v-else />
      <span>{{ record?.ip_country?.ip_address }}</span>
    </template>
    <template v-else-if="column.key === 'date'">
      {{
        record.start_date
          ? format(new Date(record.start_date), "yyyy-MM-dd HH:mm")
          : ""
      }}
    </template>
    <template v-else-if="column.key === 'status'">{{
      record.last_event
    }}</template>
    <template v-else-if="column.key === 'download'">{{
      formatTime(+record.download_time)
    }}</template>
  </div>
</template>
<style scoped lang="scss">
.history-cell {
  white-space: nowrap;
  overflow: hidden;

  &:before {
    position: absolute;
    content: "";
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
  &_user {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 2px;
    img {
      border-radius: 50%;
    }
  }
  &_install {
    a {
      transition: 0.3s;
    }
    a:hover {
      color: blue;
    }
  }
  &_ip {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 2px;
    img,
    svg {
      max-width: 24px;
      height: auto;
      border-radius: 5px;
    }
  }
}
</style>
