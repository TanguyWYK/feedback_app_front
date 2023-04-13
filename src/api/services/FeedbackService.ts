import { Feedback_post, Feedback , Feedback_patch } from '@/models/FeedbackModel';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { url_path } from '@/api/config'

export class FeedbackService
{

  public static async getAllFeedbacks(): Promise<AxiosResponse<Feedback[]>> {
    let url =  `${url_path.server}/feedbacks`;
    return await axios.get(url);
  }

  public static async getFeedbacksByManagerId(managerId: number,dateStart: string, dateEnd: string): Promise<AxiosResponse<Feedback[]>> {
    let url =  `${url_path.server}/feedbacks/manager/${managerId}?start=${dateStart}&end=${dateEnd}`;
    return await axios.get(url);
  }

  public static async getFeedbacksByMemberId(memberId: number): Promise<AxiosResponse<Feedback[]>> {
    let url =  `${url_path.server}/feedbacks/member/${memberId}`;
    return await axios.get(url);
  }

  public static async postFeedback(requestBody: Feedback_post): Promise<AxiosResponse<Feedback>> {
    let url =  `${url_path.server}/feedback`;
    return await axios.post(url, requestBody);
  }

  public static async patchFeedback(requestBody: Feedback_patch): Promise<AxiosResponse<Feedback>> {
    let url =  `${url_path.server}/feedback`;
    return await axios.patch(url, requestBody);
  }

}
