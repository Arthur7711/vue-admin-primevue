<template>
  <div class="result">
    <CheckCircleOutlineIcon class="result__icon" />
    <h3 class="result__title">
      <template v-if="fullTitle">{{ fullTitle }}</template>
      <template v-else>{{ title }} created</template>
    </h3>

    <template v-if="!isOnlyName">
      <p class="result__field"><b>{{ fieldName ?? 'name' }}:</b> <AppCopyTooltip :copy-text="name" /></p>
      <p class="result__field"><b>token:</b> <AppCopyTooltip :copy-text="token" /></p>
      <button class="result-copy" @click="utils.copyText(`${name} - ${token}`)">
        <ContentCopyIcon class="result-copy__icon"/>
        copy {{ fieldName ?? 'name' }} + token
      </button>
    </template>

    <template v-else>
      <p class="result__field">{{  prefix ? prefix + name : name }}</p>
      <button class="result-copy" @click="utils.copyText( prefix ? prefix + name : name)">
        <ContentCopyIcon class="result-copy__icon"/>
        copy {{ fieldName ?? 'name' }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import utils from '@/utils'
import { CheckCircleOutlineIcon, ContentCopyIcon } from 'mdi-vue3'
import AppCopyTooltip from '@/components/UI/AppCopyTooltip.vue'

defineProps<{
  title?: string,
  fullTitle?: string,
  name: string,
  token?: string,
  fieldName?: string,
  isOnlyName?: boolean,
  prefix?: string
}>()

</script>

<style lang="scss" scoped>
.result {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  background: rgba(56, 142, 60, 0.05);
  margin-bottom: 20px;
  padding: 14px 45px;
  border: 1px solid rgba(56, 142, 60, 0.30);
  border-radius: 10px;

  &__icon {
    position: absolute;
    top: 14px;
    left: 16px;
    width: 20px;
    fill: #689F38;
  }

  &__title {
    display: inline-block;
    margin-bottom: 5px;
    color: #1A1A1A;
    font-size: 16px;
    font-weight: 600;
    line-height: 1;
  }

  &__field {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-bottom: 3px;
    color: #666;
    font-size: 14px;
  }

  &-copy {
    display: flex;
    gap: 4px;
    margin-top: 5px;
    padding: 0;
    border: none;
    background-color: transparent;
    color: #689F38;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;

    &__icon {
      width: 14px;
      fill: #689F38;
    }
  }
}
</style>
