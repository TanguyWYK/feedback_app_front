import { FeedbackPayload, headerValue } from "@/models/TableModel";
import { useAppStore } from "../store/appStore";

const store = useAppStore();

export function useFeedbackMapper(feedbackList: FeedbackPayload[],headers: headerValue[],month: string): any{
  let rowToShows = {};
  if(feedbackList.length === 0){
    rowToShows[month] = generateEmptyTable();
    console.log(rowToShows);
  } else {
    for (let feedback of feedbackList) {
      rowToShows[feedback.date] = {};
    }
    for (let feedback of feedbackList) {
      if (rowToShows[feedback.date][feedback.memberEmail] === undefined) {
        let line = {};
        line[feedback.criterionId] = {
          value: feedback.value,
          id: feedback.id,
          action: "patch",
          edit: false,
        };
        rowToShows[feedback.date][feedback.memberEmail] = line;
        rowToShows[feedback.date][feedback.memberEmail].memberEmail =
          feedback.memberEmail;
        rowToShows[feedback.date][feedback.memberEmail].managerEmail =
          feedback.managerEmailThisMonth;
      } else {
        rowToShows[feedback.date][feedback.memberEmail][feedback.criterionId] = {
          value: feedback.value,
          id: feedback.id,
          action: "patch",
          edit: false,
        };
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
        for (let header of headers) {
          if (rowToShows[month][memberEmail][header.key] === undefined) {
            rowToShows[month][memberEmail][header.key] = {
              value: "-",
              criterionId: Number(header.key),
              memberId: store.findMemberIdFromEmail(memberEmail),
              action: "post",
              edit: false,
            };
          }
        }
      }
    }
  }
  return rowToShows;
}

function generateEmptyTable() {
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
    return rowToShows;
  }
