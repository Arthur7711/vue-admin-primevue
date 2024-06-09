<template>
  <div class="main-header">
    <a v-if="route.path === '/builds'" href="/" class="main-header__logo">
      <img
        src="/images/delivery.svg"
        class="main-header__image"
        alt="delivery logo"
      />
    </a>
    <router-link v-else to="/" class="main-header__logo">
      <img
        src="/images/delivery.svg"
        class="main-header__image"
        alt="delivery logo"
      />
    </router-link>
    <div class="main-header__menu">
      <router-link
        v-for="item in menu"
        :key="item.name"
        :to="item.link"
        class="main-header__menu-item colored-href"
        :class="{ 'main-header__menu-item_active': checkForOverlap(item.name) }"
      >
        {{ item.name }}
        <span class="main-header__menu-item-shadow">{{ item.name }}</span>
      </router-link>
    </div>
    <div class="main-header__user">
      <UserFrame />
    </div>
  </div>
</template>

<script setup lang="ts">
import UserFrame from '@/components/Users/UserFrame.vue';
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import useUserStore from '@/store/user';
import { MENU } from './constants';

const route = useRoute();
const router = useRouter();
const menu = ref();

const checkForOverlap = (linkName: string) => {
  const { path } = router.resolve({ name: linkName });
  return route.path.includes(path);
};
onMounted(() => {
  if (useUserStore.self.value) {
    const { menus } = useUserStore.self.value;
    const menuInfo = menus.map((el) => el.name);
    menu.value = MENU.filter((menuItem) => menuInfo.includes(menuItem.name));
  }
});
</script>

<style lang="scss" scoped>
.main-header {
  padding: 12px 20px;
  background-color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow-x: auto;
  gap: 2rem;
  @include custom-scroll();

  &__logo {
    display: flex;
    align-items: center;
    &:deep(.main-header__image) {
      min-width: 100px;
      width: 100px;
    }

    & > * + * {
      margin-left: 16px;
    }
  }

  &__menu {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    // & > * + * {
    //   margin-left: 32px;
    // }
  }

  &__menu-item {
    position: relative;
    font-family: 'Source Sans Pro';
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 22px;

    &_active {
      font-weight: 700;
      color: $main-green;
      pointer-events: none;
    }
  }

  &__menu-item-shadow {
    display: block;
    margin-top: -22px;
    font-weight: 700;
    opacity: 0;
    pointer-events: none;
  }
}
</style>
