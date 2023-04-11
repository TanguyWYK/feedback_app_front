<template>
  <v-app-bar flat>
    <v-app-bar-title>
      <v-icon icon="mdi-circle-slice-6" />

      Feedback App - {{ store.managerEmail }}
    </v-app-bar-title>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { useAppStore } from "./../../store/appStore";

const store = useAppStore();
</script>
