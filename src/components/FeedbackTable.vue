<template>
  <v-container>
    <v-btn @click="getFeedbacksByManagerId(1)">TEST</v-btn>
    <v-data-table
      :headers="headers"
      :items="feedbacks"
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

const feedbacks = ref([]);
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
  CriterionService.getCriteriaByManagerId(1).then((response: any) => {
    const criteria = response.data;
    criteria.forEach((criterion: Criterion) => {
      headers.value.push({
        title: criterion.name,
        key: criterion.id.toString(),
      });
    });
  });
  console.log(headers.value);
});

function getFeedbacksByManagerId(managerId: number) {
  FeedbackService.getFeedbacksByManagerId(managerId).then((response: any) => {
    let result = response.data;
    console.log(result);
    let rowToShows = {};
    for (let feedback of result) {
      if (rowToShows[feedback.memberEmail] === undefined) {
        let line = {};
        line[feedback.criterionId] = feedback.value;
        rowToShows[feedback.memberEmail] = line;
      } else {
        rowToShows[feedback.memberEmail].memberEmail = feedback.memberEmail;
        rowToShows[feedback.memberEmail].managerEmail = "manager1@sfeir.com";
        rowToShows[feedback.memberEmail][feedback.criterionId] = feedback.value;
      }
    }
    console.log(rowToShows);
    for (let memberEmail in rowToShows) {
      for (let header of headers.value) {
        if (rowToShows[memberEmail][header.key] === undefined) {
          rowToShows[memberEmail][header.key] = "-";
        }
      }
    }

    console.log(Object.values(rowToShows));
    feedbacks.value = Object.values(rowToShows);
    //console.log(feedbacks.value);
  });
}
</script>
