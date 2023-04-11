<template>
  <router-view />
</template>

<script lang="ts" setup>
import { useAppStore } from "./store/appStore";

const store = useAppStore();

store.setManager(1, "manager1@sfeir.com");
</script>
