<template>
  <div class="main-content">
    <div class="not-found-page">
      <img src="/images/404.svg" class="not-found-page__image" alt="404">
      <div class="not-found-page__title">oops... page not found</div>
      <router-link to="/" class="not-found-page__description">go to homepage</router-link>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
<style lang="scss" scoped>
.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
  height: 100%;

  &__image {
    margin-bottom: 36px;
  }

  &__title {
    @include Font-24-18-700;
    margin-bottom: 12px;
  }

  &__description {
    @include Font-18-22-600;
    color: $main-green;
  }
}
</style>
