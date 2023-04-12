// Utilities
import { defineStore } from 'pinia'
import { Member } from '@/models/MemberModel';
import { Criterion } from '@/models/CriterionModel';

export const useAppStore = defineStore('appStore', {
  state: () => ({
    manager: {
      email: '',
      id: 0,
    },
    memberList: <Member[]>([]),
    criteriaList: <Criterion[]>([]),

  }),
  getters: {
    managerId(state) {
      return state.manager.id;
    },
    managerEmail(state) {
      return state.manager.email;
    },
    memberEmails(state){
      return state.memberList.map(member=>member.email);
    },
    members(state){
      return state.memberList;
    },
    criteria(state){
      return state.criteriaList;
    }
  },
  actions: {
    // any amount of arguments, return a promise or not
    setManager(id: number, email: string) {
      // you can directly mutate the state
      this.manager = {
        email: email,
        id: id,
      }
    },
    setMembers(members: Member[]){
      this.memberList = members;
    },
    setCriteria(criteria: Criterion[]){
      this.criteriaList = criteria;
    },
    findMemberIdFromEmail(memberEmail: string): number | undefined{
      return this.memberList.find(member=>member.email === memberEmail)?.id;
    }
  },
})
