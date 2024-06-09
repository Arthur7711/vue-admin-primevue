<template>
  <div class="other-projects">
    <table class="other-projects-table">
      <thead class="other-projects-table__thead">
      <tr>
        <td><b>project name</b></td>
        <td><b>size</b></td>
      </tr>
      </thead>

      <tbody class="other-projects-table__tbody">
        <StoragesOtherProjectItem
          v-for="item in otherProjects"
          :key="item.project_id"
          :item="item"
          :active-branch="activeBranch"
        />
      </tbody>
    </table>
  </div>
</template>
<script lang="ts" setup>
import StoragesOtherProjectItem from '@/components/Storages/StoragesOtherProjectItem.vue'
import {TActiveBranch, IStorageProject} from '@/API/models/storages'

const props = defineProps<{
  otherProjects: IStorageProject[],
  activeBranch: TActiveBranch | null
}>()
</script>

<style lang="scss" scoped>
.other-projects {
  padding: 5px;

  &-table {
    &__thead td {
      padding-bottom: 5px;

      &:first-child {
        padding-right: 10px;
      }
    }
  }
}
</style>
