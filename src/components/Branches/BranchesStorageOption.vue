<template>
  <div class="branch-option">
    <div class="branch-option__inner">
      <span class="branch-option__name">{{ item.shortname }}</span>
      <span class="branch-option__sizes">
        {{ usedSize }} /
        {{ allSize }}
      </span>
    </div>
    <a-progress :percent="percent" :show-info="false" />
  </div>
</template>

<script lang="ts" setup>
import utils from '@/utils'
import { computed } from 'vue'
import {IStorage} from '@/API/models/storages'

const props = defineProps<{
  item: IStorage
}>()

const usedSize = computed(() => utils.bytesConversion(props.item.used, 4, true))
const allSize = computed(() => utils.bytesConversion(props.item.free + props.item.used, 4, true))

const percent = computed(() => +(props.item.used / (props.item.free + props.item.used) * 100).toFixed())

</script>

<style lang="scss" scoped>
.branch-option {
  width: 100%;

  &__inner {
    display: flex;
    justify-content: space-between;
  }
}
</style>
