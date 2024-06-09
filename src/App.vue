<template>
  <div class="main" :class="{ full: isLoading }">
    <a-spin v-if="isLoading" size="large" tip="Loading..." />
    <!-- <template v-else-if="useUserStore.self.value && Object.keys(useUserStore.self.value).length"> -->
    <Header
      v-if="
        useUserStore.self.value && Object.keys(useUserStore.self.value).length
      "
    />
    <router-view />
    <!-- </template> -->
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue';
import { ref, onMounted } from 'vue';
import useUserStore from '@/store/user';
import { useRoute } from 'vue-router';
// const userStore = useUserStore();
const isLoading = ref(true);
const route = useRoute();
onMounted(async () => {
  try {
    await useUserStore.authUser();
    const menus = useUserStore.self.value?.menus.map((el) => el.name);
    if (!menus?.includes(route.name)) {
      location.href = `/${menus[0]}`;
    }
  } catch (e) {
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.main {
  background-color: #f4f4f4;
}

body .main {
  font-family: 'Source Sans Pro';
}
</style>
