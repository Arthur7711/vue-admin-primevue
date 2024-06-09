<template>
  <div class="proxy__row">
    <div class="proxy-item">
      <span class="proxy-item__build-id">{{ item.build_id }}</span>
    </div>
    <div class="proxy-item">
      <router-link :to="link" class="proxy-item__name">
        <ArrowTopRightIcon class="arrow-top-right" />
        {{ item.build?.name }}
      </router-link>
    </div>
    <div class="proxy-item">
      <span class="proxy-item__status" :class="item.status">{{ item.status }}</span>
    </div>
    <div class="proxy-item">
      <span class="proxy-item__updated">{{ utils.formatingTime(item.updated_at) }}</span>
    </div>
    <div class="proxy-item">
      <span class="proxy-item__updated">{{ item?.build?.branch?.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import utils from '@/utils'
import { ArrowTopRightIcon } from 'mdi-vue3'
import { IProxyBuild } from '@/API/models/proxies'

const props = defineProps<{
  item: IProxyBuild
}>()

const link = computed(() => {
  let url = `/builds?id=${props.item.build_id}`

  if (props.item.build?.deleted_at) {
    url += '&operator=!='
  }

  return url
})
</script>

<style lang="scss" scoped>
.proxy {
  &__row {
    display: grid;
    grid-template-columns: 40px 1fr 70px 95px 150px;
    gap: 15px;
    margin-bottom: 12px;
  }

  &-item {
    &__build-id {
      display: block;
      text-align: center;
    }

    &__name {
      display: block;
      margin: 0;
      width: clamp(90px, 9vw, 200px);
      @include sliceText();
      @include hover-link();
    }

    &__status {
      &.missed {
        color: $main-pink;
      }

      &.seeding {
        color: $main-green;
      }

      &.pending {
        color: $main-blue;
      }

      &.deleting {
        color: $main-orange;
      }

      &.deleted {
        color: $main-grey;
      }
    }
  }
}
</style>
