<template>
  <v-container>
    <v-text-field v-model="monthTitle" />
    <v-btn class="v-ma-4" @click="getFeedbacksByManagerId(store.managerId)"
      >Mon équipe</v-btn
    >
    <v-data-table
      :headers="headers"
      :items="feedbacksFiltered"
      item-value="criterionName"
      class="elevation-1"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td v-for="header in headers">
            {{ item.columns[header.key] }}
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { FeedbackService } from "../api/services/FeedbackService";
import { VDataTable } from "vuetify/labs/VDataTable";
import { CriterionService } from "@/api/services/CriterionService";
import { onMounted } from "vue";
import { Criterion } from "@/models/CriterionModel";
import { useAppStore } from "../store/appStore";
import { computed } from "@vue/reactivity";

const store = useAppStore();
const feedbacks = ref({});
const feedbacksFiltered = computed(() => {
  if (feedbacks.value[month.value] !== undefined) {
    return Object.values(feedbacks.value[month.value]);
  } else {
    return [];
  }
});
const month = ref("2023-03-01");
const monthTitle = computed(() => getMonthAndYearFromDate(month.value));
type headerValue = {
  title: String;
  key: String | number;
};
const headers = ref(<headerValue[]>[
  {
    title: "ID",
    key: "memberEmail",
  },
  {
    title: "manager",
    key: "managerEmail",
  },
]);

onMounted(() => {
  CriterionService.getCriteriaByManagerId(store.managerId).then(
    (response: any) => {
      const criteria = response.data;
      criteria.forEach((criterion: Criterion) => {
        headers.value.push({
          title: criterion.name,
          key: criterion.id.toString(),
        });
      });
    }
  );
  console.log(headers.value);
});

function getFeedbacksByManagerId(managerId: number) {
  let dateStart = "20230301";
  let dateEnd = "20230401";
  FeedbackService.getFeedbacksByManagerId(managerId, dateStart, dateEnd).then(
    (response: any) => {
      let result = response.data;
      console.log(result);
      let rowToShows = {};
      for (let feedback of result) {
        rowToShows[feedback.date] = {};
      }
      for (let feedback of result) {
        if (rowToShows[feedback.date][feedback.memberEmail] === undefined) {
          let line = {};
          line[feedback.criterionId] = feedback.value;
          rowToShows[feedback.date][feedback.memberEmail] = line;
          rowToShows[feedback.date][feedback.memberEmail].memberEmail =
            feedback.memberEmail;
          rowToShows[feedback.date][feedback.memberEmail].managerEmail =
            feedback.managerEmailThisMonth;
        } else {
          rowToShows[feedback.date][feedback.memberEmail][
            feedback.criterionId
          ] = feedback.value;
        }
      }
      for (let month in rowToShows) {
        for (let memberEmail in rowToShows[month]) {
          for (let header of headers.value) {
            if (rowToShows[month][memberEmail][header.key] === undefined) {
              rowToShows[month][memberEmail][header.key] = "-";
            }
          }
        }
      }
      feedbacks.value = rowToShows;
    }
  );
}

function getActualDate() {}

function getMonthAndYearFromDate(dateToConvert: string): string {
  const date = new Date(dateToConvert);
  const options = { year: "numeric", month: "long" };
  return date.toLocaleDateString("fr-FR", options);
}
</script>
<style lang="scss" scoped>
.v-container {
  min-width: 99%;
}
</style>
