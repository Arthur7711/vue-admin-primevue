<template>
  <div class="storage">
    <div
      v-if="storage !== 0"
      class="storage-item"
      :class="{ zero: calcPercentFree <= 3 }"
      :style="styles"
    >
      <div
        v-if="data.free !== 0"
        class="storage-item-project storage-item-project_free"
      >
        {{ calcPercentFree }}% {{ calcBytesFree }}
      </div>

      <template v-if="projects.length">
        <StoragesProject
          v-for="item in projects"
          :key="item.project_id"
          :data="item"
          :storage-size="storageBytes"
          :active-branch="activeBranch"
        />
      </template>

      <a-tooltip
        v-if="otherProjects.length"
        v-model:visible="isShowOtherProjects"
        placement="top"
        trigger="click"
      >
        <template #title>
          <StoragesOtherProjectsTable
            :other-projects="otherProjects"
            :active-branch="activeBranch"
          />
        </template>

        <div class="storage-item-project storage-item-project_other">
          <h4 class="storage-item-project__title">Other</h4>
          <div class="storage-item-project__storage">
            {{ otherProjectsPercent }}% {{ otherProjectsSizeInTerabytes }}
          </div>
        </div>
      </a-tooltip>

      <div
        v-if="usedSize"
        class="storage-item-project storage-item-project_used"
      >
        {{ usedSizePercent }} {{ usedSize }}
      </div>
    </div>

    <h3 :class="{ zero: calcPercentFree <= 3 }" class="storage-title">
      <EditStorage
        :change-fill="calcPercentFree <= 3"
        :data="data"
        :options="options"
      />
      {{ title }}
      <AlertCircleIcon
        v-if="calcPercentFree <= 3"
        class="storage-title__icon"
      />
    </h3>
  </div>
</template>

<script setup lang="ts">
import utils from "@/utils";
import { computed, ref, watch, Ref } from "vue";
import StoragesProject from "@/components/Storages/StoragesProject.vue";
import StoragesOtherProjectsTable from "@/components/Storages/StoragesOtherProjectsTable.vue";
import { AlertCircleIcon } from "mdi-vue3";
import { IStorage, TActiveBranch } from "@/API/models/storages";
import EditStorage from "./EditStorage.vue";

const props = defineProps<{
  data: IStorage;
  max: number;
  checkedProjects: string[];
  activeBranch: TActiveBranch | null;
  options: { value: string; label: string }[];
}>();
const isShowOtherProjects: Ref<boolean> = ref(false);

const storageBytes = computed(() => props.data.free + props.data.used);
const storage = computed(() => utils.bytesConversion(storageBytes.value, 4));
const title = computed(() => `${props.data.shortname} ${storage.value} Tb`);
const styles = computed(() => {
  const part = storage.value - props.max / 4;
  return part > 0
    ? `height: ${70 + (part / (props.max - props.max / 4)) * 100}%`
    : `min-height: ${(storage.value / (props.max / 4)) * 100}%`;
});

const calcPercentFree = computed(() =>
  props.data.free > 0 && props.data.used > 0
    ? calcPercentProject(props.data.free)
    : 0
);
const calcBytesFree = computed(() =>
  utils.bytesConversion(props.data.free, 4, true)
);

const otherProjectsSize = computed(() =>
  props.data.other_projects?.length
    ? props.data.other_projects.reduce((acc, curr) => acc + +curr.total_size, 0)
    : 0
);

const otherProjectsSizeInTerabytes = computed(() =>
  utils.bytesConversion(otherProjectsSize.value, 4, true)
);
const otherProjectsPercent = computed(
  () => Math.round((otherProjectsSize.value / storageBytes.value) * 10000) / 100
);

const projects = computed(() => !props.data.projects?.length
    ? []
    : props.data.projects.filter((project) =>
        props.checkedProjects.includes(project.name)
      ));

const otherProjects = computed(() => !props.data.other_projects?.length
    ? []
    : props.data.other_projects.filter((project) =>
        props.checkedProjects.includes(project.name)
      ));

const usedSize = computed(() => !projects.value.length &&
    !otherProjects.value.length &&
    props.data.used > 0
    ? utils.bytesConversion(props.data.used, 4, true)
    : 0);

const usedSizePercent = computed(() =>
  usedSize.value
    ? `${((props.data.used / (props.data.free + props.data.used)) * 100).toFixed(
        1
      )  }%`
    : 0
);

const calcPercentProject = (value: number) => Math.round((value / storageBytes.value) * 100);

watch(
  () => props.activeBranch,
  (val) => {
    if (val) {
      isShowOtherProjects.value = Boolean(
        props.data?.other_projects?.find((project) =>
          project.branches?.find!(
            (branch) =>
              branch.id === props.activeBranch?.id! &&
              branch.storage_id === props.activeBranch?.storage_id!
          )
        )
      );
    }
  }
);
</script>

<style lang="scss" scoped>
.storage {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  // width: clamp(200px, 100%, 320px);
  width: 320px;
  min-width: 200px;
  z-index: 1;

  &-item {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    box-shadow: 0 0 22px 7px rgba(216, 218, 224, 0.4);
    border-radius: 10px;
    overflow: hidden;
    max-height: 100%;

    &.zero {
      box-shadow: 0 0 24px -6px $main-orange;
    }

    &-project {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 6px;
      gap: 10px;
      font-size: 14px;
      line-height: 1;

      &_free,
      &_used {
        justify-content: center;
        line-height: 1.5;
      }

      &_free {
        flex: 1 0 auto;
        color: rgba(0, 0, 0, 0.6);
      }

      &_used {
        background-color: #e1e1e1;
      }

      &_other {
        background-color: #d1d1d1;
        height: 24px;
        white-space: nowrap;
        cursor: pointer;
        transition: opacity 0.4s;

        &:hover {
          opacity: 0.7;
        }
      }

      &__title {
        margin: 0;
      }
    }
  }

  &-title {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 24px 0 0;
    font-weight: 400;
    font-size: 16px;
    line-height: 1;
    color: #000;
    gap: 4px;
    svg {
      cursor: pointer;
    }
    &.zero {
      color: $main-orange;
    }

    &__icon {
      margin-right: 8px;
      width: 24px;
    }
  }
}
</style>
