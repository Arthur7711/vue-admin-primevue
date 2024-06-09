<template>
  <div class="main-content">
    <div class="forbidden-page">
      <img src="/images/401.svg" class="forbidden-page__image" alt="401">
      <div class="forbidden-page__title">no access</div>
      <div class="forbidden-page__description">sorry you are not allowed to see this</div>
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
  height: 100vh;
}

.forbidden-page {
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
    @include Font-16-25-400;
  }
}
</style>
