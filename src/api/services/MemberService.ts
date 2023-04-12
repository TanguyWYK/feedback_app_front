import { Member } from "@/models/MemberModel";
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { url_path } from "../config";

export class MemberService
{

  public static async getMembersByManagerId(managerId: Number): Promise<AxiosResponse<Member[]>> {
    let url =  `${url_path.server}/members/${managerId}`;
    return await axios.get(url);
  }

}
