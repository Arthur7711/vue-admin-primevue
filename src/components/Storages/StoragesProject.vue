<template>
  <div
    class="storage-project"
    :class="{ 'storage-project_active': isShowTooltip }"
    :style="`
    height: ${data.percent}%;
    background-color: ${data.color};
    `"
  >
    <a-tooltip
      v-model:visible="isShowTooltip"
      placement="right"
      trigger="click"
      color="#fff"
      style="border-radius: 10px"
    >
      <template #title>
        <simplebar
          v-if="data.branches?.length"
          class="storage-project-table"
          :style="`border-color: ${data.color};`"
        >
          <table>
            <thead
              class="storage-project-table__thead"
              :style="`background-color: ${data.color};`"
            >
              <tr>
                <td>
                  <span class="storage-project-table__item">branch name</span>
                </td>
                <td><span class="storage-project-table__item">size</span></td>
                <td>
                  <span class="storage-project-table__item">expires</span>
                </td>
              </tr>
            </thead>

            <tbody class="storage-project-table__tbody">
              <StoragesBranch
                v-for="(item, idx) in data.branches"
                :key="item.id"
                :item="item"
                :expire="expires.length ? expires[idx] : null"
                :is-active="
                  !activeBranch
                    ? false
                    : item.id === activeBranch?.id &&
                      item.storage_id === activeBranch?.storage_id
                "
              />
            </tbody>
          </table>
        </simplebar>
      </template>

      <div class="storage-project__inner">
        <h4 class="storage-project__title">{{ data.name }}</h4>
        <p class="storage-project__storage">{{ data.percent }}% {{ size }}</p>
      </div>
    </a-tooltip>
  </div>
</template>
<script setup lang="ts">
import utils from "@/utils";
import { computed, ref, watch, Ref } from "vue";
import StoragesBranch from "@/components/Storages/StoragesBranch.vue";
import { getAdminBuilds } from "@/API/builds";
import { TActiveBranch, IStorageProject } from "@/API/models/storages";
import { IBuild } from "@/API/models/builds";

const props = defineProps<{
  data: IStorageProject;
  storageSize: number;
  activeBranch: TActiveBranch | null;
}>();

const expires: Ref<IBuild[]> = ref([]);
const isShowTooltip: Ref<boolean> = ref(false);

const size = computed(() =>
  utils.bytesConversion(props.data.total_size, 4, true)
);

const getProjectBuild = async (id: number):Promise<IBuild|null> => {
  const { items, total } = await getAdminBuilds({
    limit: 1,
    "sort[property]": "deleted_at",
    "sort[direction]": "desc",
    filters: JSON.stringify([
      { column: "branch_id", value: id },
      { column: "deleted_at", value: null },
    ]),
  });

  return total ? items[0] : null;
};

watch(isShowTooltip, async (val) => {
  if (val && !expires.value.length) {
    const newExpires = props.data?.branches?.map((item) =>
      getProjectBuild(item.id)
    );
    if (newExpires) {
      await Promise.all(newExpires).then((results) => {
        expires.value = results as IBuild[];
      });
    }
  }
});

watch(
  () => props.activeBranch,
  (val) => {
    if (val) {
      const idx = props.data.branches?.findIndex(
        (item) =>
          item.id === props.activeBranch?.id &&
          item.storage_id === props.activeBranch.storage_id
      );
      if (idx && idx > -1) {
        isShowTooltip.value = true;
      }
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.storage-project {
  min-height: 18px;
  cursor: pointer;
  transition: opacity 0.4s;

  &:hover {
    opacity: 0.7;
  }

  &_active {
    border-width: 3px 0;
    border-style: solid;
    border-image: linear-gradient(
        to right,
        transparent,
        rgba(0, 0, 0, 0.5),
        transparent
      )
      1;
  }

  &-table {
    margin: -6px -8px;
    min-width: 370px;
    max-height: 300px;
    background-color: #fff;
    color: #000;
    border-radius: 10px;
    border: 2px solid #f88171;
    box-shadow: 0 0 22px 7px rgba(129, 131, 136, 0.2),
      0 0 22px 7px rgba(129, 131, 136, 0.2);

    table {
      width: 100%;
    }

    &__thead {
      border-radius: 10px 10px 0 0;
      padding: 6px 16px;

      td {
        font-size: 13px;
      }
    }

    &__thead .storage-project-table__item {
      display: inline-block;
      padding: 6px 0;
    }

    &__thead td:first-child .storage-project-table__item {
      padding-left: 16px;
    }

    &__thead td:last-child .storage-project-table__item {
      padding-right: 16px;
    }
  }

  &__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 6px;
    height: 100%;
    gap: 10px;
    font-size: 14px;
    line-height: 1;
  }

  &__title {
    display: -webkit-box;
    margin: 0;
    max-width: 100%;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.2;
  }

  &__storage {
    margin: 0;
    white-space: nowrap;
    line-height: 1.2;
  }
}
</style>
