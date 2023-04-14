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
            @click="editFeedback(item.columns[header.key])"
          >
            <p
              v-if="!item.columns[header.key].edit"
              :class="
                item.columns[header.key].action !== undefined ? 'pointer' : ''
              "
            >
              {{
                item.columns[header.key].action !== undefined
                  ? item.columns[header.key].value
                  : item.columns[header.key]
              }}
            </p>
            <input
              v-else
              type="text"
              class="feedback-input"
              @mouseleave="saveFeedback(item.columns[header.key], $event)"
              @mouseenter="focusInput($event)"
            />
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
import { Feedback_post, Feedback_patch } from "@/models/FeedbackModel";
import { useAppStore } from "../store/appStore";
import { computed } from "@vue/reactivity";
import { Member } from "@/models/MemberModel";
import { Feedback } from "@/models/FeedbackModel";
import { useFeedbackMapper } from "./../composables/useFeedbackMapper";
import { cp } from "fs";

const store = useAppStore();
const feedbacks = ref({});
const feedbacksFiltered = computed(() => {
  if (feedbacks.value[month.value] !== undefined) {
    return Object.values(feedbacks.value[month.value]).sort((a, b) => {
      return a.memberEmail < b.memberEmail ? -1 : 1;
    });
  } else {
    return generateEmptyTable();
  }
});

const month = ref(getDateNow());
const monthTitle = computed(() => getMonthAndYearFromDate(month.value));
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
  let dateStart = getDateNow();
  let dateEnd = getDateNow();
  FeedbackService.getFeedbacksByManagerId(managerId, dateStart, dateEnd).then(
    (response: any) => {
      feedbacks.value = useFeedbackMapper(
        response.data,
        headers.value,
        month.value
      );
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
  if (!Object.keys(feedbacks.value).includes(month.value)) {
    console.log("request " + month.value);
    FeedbackService.getFeedbacksByManagerId(
      store.managerId,
      month.value,
      lastDayOfMonth(month.value)
    ).then((response: any) => {
      feedbacks.value[month.value] = useFeedbackMapper(
        response.data,
        headers.value,
        month.value
      )[month.value];
    });
  }
}

function lastDayOfMonth(date: string) {
  let [y, m, d] = date.split("-");
  const getDaysInMonth = (m, y) => {
    return m === 2
      ? y & 3 || (!(y % 25) && y & 15)
        ? 28
        : 29
      : 30 + ((m + (m >> 3)) & 1);
  };
  return [y, m, getDaysInMonth(Number(m), Number(y))].join("-");
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
        rowToShows[memberEmail][criterion.id] = {
          value: "-",
          criterionId: criterion.id,
          memberId: store.findMemberIdFromEmail(memberEmail),
          action: "post",
          edit: false,
        };
      }
    }
    return Object.values(rowToShows).sort((a, b) => {
      return a.memberEmail < b.memberEmail ? -1 : 1;
    });
  } else {
    return [];
  }
}

function editFeedback(feedback: any) {
  if (feedback.action) {
    feedback.edit = true;
  }
}

function saveFeedback(feedback: any, event: any) {
  feedback.edit = false;
  if (event.target.value !== "") {
    if (
      feedback.action === "post" &&
      Number(event.target.value) !== feedback.value
    ) {
      const paylaod: Feedback_post = {
        date: month.value,
        criterionId: feedback.criterionId,
        memberId: feedback.memberId,
        managerId: store.managerId,
        value: Number(event.target.value),
      };
      FeedbackService.postFeedback(paylaod).then((response) => {
        console.log(response);
        feedback.value = response.data.value;
        feedback.id = response.data.id;
        feedback.action = "patch";
      });
    } else if (feedback.action === "patch") {
      const paylaod: Feedback_patch = {
        id: feedback.id,
        value: Number(event.target.value),
      };
      FeedbackService.patchFeedback(paylaod).then((response) => {
        console.log(response);
        feedback.value = response.data.value;
      });
    }
  }
}

function focusInput(event: any) {
  event.srcElement.focus();
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
  width: 70px;
  text-align: center;
  height: 100%;
  border: 1px solid black;
  border-radius: 2px;
}

.pointer {
  cursor: pointer;
}
</style>
