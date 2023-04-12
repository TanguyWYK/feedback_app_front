<template>
  <v-container>
    <v-toolbar class="elevation-1 text-center">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title>
        Feedback App - {{ store.managerEmail }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        size="small"
        icon="mdi-arrow-left"
        class="mx-6"
        @click="changeMonth(-1)"
      ></v-btn>
      <p class="month-title">{{ monthTitle }}</p>
      <v-btn
        size="small"
        icon="mdi-arrow-right"
        class="mx-6"
        @click="changeMonth(1)"
      ></v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="feedbacksFiltered"
      item-value="criterionName"
      items-per-page="1000"
      class="elevation-1 text-center"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td
            v-for="header in headers"
            @mouseover="editFeedback(item.columns[header.key])"
          >
            <input
              v-if="isTdInEdition(item.columns[header.key])"
              type="text"
              class="feedback-input"
              @blur="saveFeedback(item.columns[header.key], $event)"
            />
            <p v-else>
              {{
                item.columns[header.key].value
                  ? item.columns[header.key].value
                  : item.columns[header.key]
              }}
            </p>
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
import { onMounted } from "vue";
import { Criterion } from "@/models/CriterionModel";
import { Feedback_post } from "@/models/FeedbackModel";
import { useAppStore } from "../store/appStore";
import { computed } from "@vue/reactivity";

const store = useAppStore();
const feedbacks = ref({});
const feedbacksFiltered = computed(() => {
  if (feedbacks.value[month.value] !== undefined) {
    return Object.values(feedbacks.value[month.value]);
  } else {
    return generateEmptyTable();
  }
});
const addFeedbackInput = ref({
  criterionId: 0,
  memberId: "",
  value: 0,
});

const editFeedbackInput = ref({
  id: 0,
});

const month = ref(getDateNow());
const monthTitle = computed(() => getMonthAndYearFromDate(month.value));
type headerValue = {
  title: String;
  key: String | number;
  sortable?: boolean;
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
const dataIsLoaded = ref(false);

onMounted(() => {
  getFeedbacksByManagerId(store.managerId);
  store.criteria.forEach((criterion: Criterion) => {
    headers.value.push({
      title: criterion.name,
      key: criterion.id.toString(),
      sortable: false,
    });
  });
});

function getDateNow() {
  let date = new Date();
  return [
    date.getFullYear(),
    ("0" + (date.getMonth() + 1)).slice(-2),
    "01",
  ].join("-");
}

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
          line[feedback.criterionId] = {
            value: feedback.value,
            id: feedback.id,
          };
          rowToShows[feedback.date][feedback.memberEmail] = line;
          rowToShows[feedback.date][feedback.memberEmail].memberEmail =
            feedback.memberEmail;
          rowToShows[feedback.date][feedback.memberEmail].managerEmail =
            feedback.managerEmailThisMonth;
        } else {
          rowToShows[feedback.date][feedback.memberEmail][
            feedback.criterionId
          ] = { value: feedback.value, id: feedback.id };
        }
        for (let member of store.members) {
          if (rowToShows[feedback.date][member.email] === undefined) {
            rowToShows[feedback.date][member.email] = {
              memberEmail: member.email,
              memberId: member.id,
              managerEmail: store.managerEmail,
            };
          }
        }
      }
      for (let month in rowToShows) {
        for (let memberEmail in rowToShows[month]) {
          for (let header of headers.value) {
            if (rowToShows[month][memberEmail][header.key] === undefined) {
              rowToShows[month][memberEmail][header.key] = {
                value: "-",
                criterionId: Number(header.key),
                memberId: store.findMemberIdFromEmail(memberEmail),
              };
            }
          }
        }
      }
      feedbacks.value = rowToShows;
      console.log(rowToShows);
      dataIsLoaded.value = true;
    }
  );
}

function changeMonth(incrementMonth: number) {
  let [y, m, d] = month.value.split("-").map(Number);
  m = m + incrementMonth;
  if (m < 1 || m > 12) {
    m -= incrementMonth * 12;
    y += incrementMonth;
  }
  month.value = [y, ("0" + m).slice(-2), "01"].join("-");
}

function getMonthAndYearFromDate(dateToConvert: string): string {
  const date = new Date(dateToConvert);
  const options = { year: "numeric", month: "long" };
  return date.toLocaleDateString("fr-FR", options);
}

function generateEmptyTable() {
  if (dataIsLoaded.value) {
    let rowToShows = {};
    for (let memberEmail of store.memberEmails) {
      rowToShows[memberEmail] = {
        memberEmail: memberEmail,
        managerEmail: store.managerEmail,
      };
      for (let criterion of store.criteria) {
        rowToShows[memberEmail][criterion.id] = "-";
      }
    }
    console.log(rowToShows);
    return Object.values(rowToShows);
  } else {
    return [];
  }
}

function editFeedback(feedback: any) {
  if (feedback.value) {
    if (feedback.id === undefined) {
      addFeedbackInput.value.criterionId = feedback.criterionId;
      addFeedbackInput.value.memberId = feedback.memberId;
    } else {
      console.log("put", feedback);
    }
  }
}
function saveFeedback(feedback: any, event: any) {
  let paylaod: Feedback_post = {
    date: month.value,
    criterionId: feedback.criterionId,
    memberId: feedback.memberId,
    managerId: store.managerId,
    value: Number(event.target.value),
  };
  FeedbackService.postFeedback(paylaod).then((response) => {
    console.log(response);
  });
}

function isTdInEdition(td: any) {
  if (
    addFeedbackInput.value.criterionId === td.criterionId &&
    addFeedbackInput.value.memberId === td.memberId
  ) {
    return true;
  }
  return false;
}
</script>
<style lang="scss" scoped>
.v-container {
  min-width: 99%;
}

.month-title {
  width: 150px;
  text-align: center;
}

:deep(.v-data-table-header__content) {
  display: block;
  text-align: center;
}

:deep(.v-data-table-footer) {
  display: none;
}

.feedback-input {
  width: 50px;
  border: 1px black solid;
}
</style>
