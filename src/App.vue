<template>
  <router-view />
</template>

<script lang="ts" setup>
import { onBeforeMount } from "vue";
import { useAppStore } from "./store/appStore";
import { MemberService } from "./api/services/MemberService";
import { CriterionService } from "./api/services/CriterionService";

const store = useAppStore();

store.setManager(1, "manager1@sfeir.com");

onBeforeMount(() => {
  CriterionService.getCriteriaByManagerId(store.managerId).then(
    (response: any) => {
      console.log(response.data);
      store.setCriteria(response.data);
      console.log(store.criteria);
    }
  );
  MemberService.getMembersByManagerId(store.managerId).then((response) => {
    store.setMembers(response.data);
  });
});
</script>
