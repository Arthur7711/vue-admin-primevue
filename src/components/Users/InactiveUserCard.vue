<template>
  <div
    :class="[
      'unused-user',
      { 'unused-user_full': isShowMore },
    ]"
  >
    <div class="unused-user-head">
      <div class="unused-user-head__left">
        <img :src="getAvatar(80, props.dataSource.samaccountname)" alt="avatar" />
        <h2>{{ props.dataSource.displayname }}</h2>
      </div>
      <button v-if="dataSource.length > 3" @click.stop="toggle">
        <img
          src="/images/arrow-down.svg"
          alt="arrow down"
          :class="['user-container__show-more', { active: isShowMore }]"
        />
      </button>
    </div>
    <a-table
      :data-source="dataSource.table ? dataSource.table : dataSource.assigned_roles"
      :columns="columns"
      :pagination="false"
      class="unused-user-table"
    >
      <template #headerCell="{ column }">
        <div v-if="column.key === 'role_name'">
          <a-tooltip placement="top">
            <template #title>
              <div>user has no branches attached to roles</div>
            </template>
            <span>
              {{ column.title }}
              <sup class="unused-user-table__tooltip-title">i</sup>
            </span>
          </a-tooltip>
        </div>

        <div v-else>{{ column.title }}</div>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IUnusedUser } from '@/API/models/users';
import getAvatar from '@/utils/getAvatar';

const props = defineProps<{
  dataSource: IUnusedUser;
}>();

const emit = defineEmits<{
  (e: 'select', value: number): void;
}>();
const isShowMore = ref(false);

const columns = computed(() => {
  const items = [];

  if (props.dataSource.table) {
    items.push(
      { title: 'id', dataIndex: 'id', key: 'id' },
      { title: 'branch name', dataIndex: 'name', key: 'name' },
      { title: 'project', dataIndex: 'project_name', key: 'project_name' }
    )
  } else {
    items.push(
      { title: '', dataIndex: '', key: '' },
      { title: 'role name', dataIndex: 'role_name', key: 'role_name' },
      { title: 'project', dataIndex: 'project_name', key: 'project_name' }
    )
  }

  return items
})

const toggle = () => isShowMore.value = !isShowMore.value;
</script>

<style lang="scss">
.unused-user {
  width: 100%;
  padding: 14px 20px;
  border-radius: 10px;
  border: 1px solid $border-gray;
  overflow: hidden;
  margin-top: 8px;
  max-height: 210px;
  transition:
    border-color 0.4s,
    box-shadow 0.4s;

  &_active {
    box-shadow: 0 0 5px 1px $main-blue;
  }

  &_full {
    max-height: none;
  }

  &:nth-child(1) {
    margin-top: 3px;
  }

  p {
    margin: 0;
  }

  &-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__left {
      display: flex;
      align-items: center;
      justify-content: start;
      gap: 14px;

      img {
        width: 40px;
        height: 40px;
        border-radius: 100%;
        object-fit: cover;
      }

      h2 {
        margin-bottom: 0;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.4;
      }
    }
  }

  &__show-more {
    cursor: pointer;
    transition: transform 0.4s;

    &.active {
      transform: rotate(180deg);
    }
  }

  &-table {
    padding: 0;
    margin-top: 10px;

    thead {
      th {
        font-size: 14px;
        font-weight: 400;
        line-height: 18px;
        color: $main-grey;
        padding: 5px 0 10px 0 !important;
      }
    }

    tbody {
      td {
        color: #1a1a1a;
        font-size: 14px;
        padding-bottom: 14px !important;
      }
    }

    .ant-table-cell {
      padding: 0;
      &:nth-child(1){
        width: 40px;
      }
      &:nth-child(2){
        width: 450px;
        @include sliceText()
      }
      &:nth-child(3){
        @include sliceText()
      }
    }

    &__tooltip-title {
      padding: 2px;
      margin-left: -2px;
      color: orange;
      cursor: pointer;
      font-style: italic;
      font-weight: bold;
    }
  }
}
</style>
