export interface Feedback {
  id?: number;
  criterionName: String;
  date: String;
  memberEmail: String;
  value: number;
}

export interface Feedback_post {
  date: String;
  criterionId: number;
  memberId: number;
  managerId: number;
  value: number;
}

export interface Feedback_patch {
  id: number;
  value: number;
}
