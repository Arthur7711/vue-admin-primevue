<template>
  <tr
    class="other-projects-table__tr"
    :style="{ borderColor: isActive ? item.color : 'transparent' }"
  >
    <td>
      <router-link to="#" class="other-projects-table__link">
        {{ item.name }}
      </router-link>
    </td>
    <td>
      {{ size }}
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import utils from '@/utils'
import { TActiveBranch, IStorageProject } from '@/API/models/storages'

const props = defineProps<{
  item: IStorageProject,
  activeBranch: TActiveBranch | null
}>()

const size = computed(() => utils.bytesConversion(props.item.total_size, 4, true) )
const isActive = computed(() => !props.activeBranch
    ? false
    : props.item.branches?.find!(branch => branch.id === props.activeBranch?.id && branch.storage_id === props.activeBranch.storage_id))
</script>

<style lang="scss" scoped>
.other-projects-table {
  &__tr {
    border-bottom: 3px solid transparent;
  }

  &__link {
    display: inline-block;
    padding-right: 10px;
    color: #fff;
    transition: color 0.3s;

    &:hover {
      color: $main-green;
    }
  }

}
</style>
