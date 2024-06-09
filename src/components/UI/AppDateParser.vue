<template>
  {{ computedDate }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';

const props = defineProps<{
  date: string;
  timeNeeded?: boolean;
}>();

const computedDate = computed(() =>
  props.date
    ? format(
        new Date(props.date),
        props.timeNeeded ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd '
      )
    : ''
);
</script>
