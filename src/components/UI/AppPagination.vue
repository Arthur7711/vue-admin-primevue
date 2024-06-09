<template>
  <div ref="element" :class="{ center: center }">
    <Loader :width="50" fill="#509574" />
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount } from "vue";
import Loader from "@/components/icons/Loader.vue";

const props = defineProps<{
  options?: IntersectionObserverInit;
  center?: boolean;
}>();

const emit = defineEmits<{
  (e: "intersect"): void;
}>();

const observer: Ref<IntersectionObserver | null> = ref(null);
const element: Ref<Element | undefined> = ref();

const createObserver = () => {
  observer.value = new IntersectionObserver(callbackObserver, props.options);

  observer.value?.observe(element.value!);
};

const callbackObserver = ([entry]) => {
  if (entry && entry.isIntersecting) {
    emit("intersect");
  }
};

onMounted(() => createObserver());

onBeforeUnmount(() => observer.value?.disconnect());
</script>

<style lang="scss" scoped>
.center {
  text-align: center;
}
</style>
