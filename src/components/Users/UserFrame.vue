<template>
  <div class="user-frame">
    <a-dropdown :trigger="['click']">
      <button class="user-frame__btn" :style="style"></button>
      <template #overlay>
        <a-menu class="user-frame__menu">
          <div class="user-frame__inner">
            <a
              :href="`https://start.saber3d.net/#/staff/user/${useUserStore.self.value?.samaccountname}`"
              class="user-frame-info"
              target="_blank"
            >
              <AccountIcon class="user-frame-info__icon" />
              {{ useUserStore.self.value?.displayname }}
            </a>
            <button class="user-frame-exit" @click="useUserStore.logoutUser()">
              <ExitToAppIcon class="user-frame-exit__icon" />
            </button>
          </div>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import utils from '@/utils'
import { computed } from 'vue'
import { AccountIcon, ExitToAppIcon } from 'mdi-vue3'
import  useUserStore  from '@/store/user'

const SIZES = { xs: 20, sm: 27, md: 40, lg: 70 }

const style = computed(() => `background-image: url("${utils.getAvatar(SIZES.md, useUserStore.self.value?.samaccountname!)}");`)
</script>

<style lang="scss" scoped>
.user-frame {
  &__btn {
    display: block;
    flex: none;
    width: 40px;
    height: 40px;
    background-color: gray;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border-radius: 50%;
    transition: 200ms;

    &_link {
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }

    &.size {
      &-xs {
        width: 20px;
        height: 20px;
      }

      &-sm {
        width: 27px;
        height: 27px;
      }

      &-lg {
        width: 70px;
        height: 70px;
      }
    }
  }

  &__menu {
    min-width: 200px;
    padding: 16px;
    background-color: #fff;
    border-radius: 10px;
    border: 1px solid #E3E3E3;
  }

  &__inner {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  &-info {
    display: flex;
    align-items: flex-end;
    gap: 5px;
    color: $main-grey;
    font-size: 14px;
    line-height: 1.2;
    transition: color 0.3s;

    &__icon {
      width: 20px;
      fill: $main-grey;
      transition: fill 0.3s;
    }

    &:hover {
      color: $main-blue;

      .user-frame-info__icon {
        fill: $main-blue;
      }
    }
  }

  &-exit {
    display: flex;

    &__icon {
      margin: auto;
      width: 20px;
      fill: $main-grey;
      transition: fill 0.3s;
    }

    &:hover .user-frame-exit__icon {
      fill: $main-blue;
    }
  }
}
</style>
