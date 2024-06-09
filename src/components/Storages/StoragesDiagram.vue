<template>
  <div
    class="storages-diagram"
    :style="{ 'justify-content': items.length === 1 ? 'center' : 'flex-start' }"
  >
    <StoragesColumn
      v-for="item in items"
      :key="item.id"
      :data="item"
      :max="storageMax"
      :checked-projects="checkedProjects"
      :active-branch="activeBranch"
      :options="options"
    />

    <div class="storages-diagram__coordinates">
      <div
        v-for="item in storageCoordinates"
        :key="item"
        class="storages-diagram__coordinate"
      >
        <span>{{ item }} Tb</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import StoragesColumn from "@/components/Storages/StoragesColumn.vue";
import { IStorage, TActiveBranch } from "@/API/models/storages";

defineProps<{
  items: IStorage[];
  storageMax: number;
  storageCoordinates: number[];
  checkedProjects: string[];
  activeBranch: TActiveBranch | null;
  options: { value: string; label: string }[];
}>();
</script>

<style lang="scss" scoped>
.storages-diagram {
  position: relative;
  display: flex;
  gap: 30px;
  height: calc(90% - 80px);
  padding: 0 40px 0 110px;
  overflow-x: auto;
  @include custom-scroll();

  &__coordinates {
    position: absolute;
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;
    top: -30px;
    left: 0;
    width: 100%;
    height: calc(30% - 15px);
  }

  &__coordinate {
    padding-bottom: 5px;
    border-bottom: 2px solid rgb(227, 227, 227);
    transform: translateY(-5px);

    span {
      margin-left: 36px;
      font-size: 16px;
      line-height: 1;
    }
  }
}
</style>
