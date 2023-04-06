import { Feedback } from '@/models/FeedbackModel';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { url_path } from '@/api/config'

export class FeedbackService
{

  public static async getAllFeedbacks(): Promise<AxiosResponse<Feedback[]>> {
    let url =  `${url_path.server}/feedbacks`;
    return await axios.get(url);
  }

  public static async getFeedbacksByManagerId(managerId: number): Promise<AxiosResponse<Feedback[]>> {
    let url =  `${url_path.server}/feedbacks/manager/${managerId}`;
    return await axios.get(url);
  }

  public static async getFeedbacksByMemberId(memberId: number): Promise<AxiosResponse<Feedback[]>> {
    let url =  `${url_path.server}/feedbacks/member/${memberId}`;
    return await axios.get(url);
  }

}
