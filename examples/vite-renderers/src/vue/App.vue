<script setup lang="ts">
import type { Spec } from "@json-render/core";
import { StateProvider } from "@json-render/vue";
import DemoRenderer from "./DemoRenderer.vue";

const props = defineProps<{ 
  initialRenderer?: string; spec: Spec }>();
const initialState = { 
  ...props.spec.state, 
  renderer: props.initialRenderer ?? "vue" };
</script>

<template>
  <StateProvider :initial-state="initialState">
    <DemoRenderer :spec="props.spec" />
  </StateProvider>
</template>
