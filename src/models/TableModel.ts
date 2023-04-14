export type headerValue = {
  title: String;
  key: String | number;
  sortable?: boolean;
};

export type FeedbackPayload = {
  criterionId: number;
  date: String;
  id: number;
  managerEmailThisMonth: String;
  memberEmail: String;
  value : number;
};
