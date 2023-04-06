import { Criterion } from "@/models/CriterionModel";
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { url_path } from "../config";

export class CriterionService
{

  public static async getCriteriaByManagerId(managerId: Number): Promise<AxiosResponse<Criterion[]>> {
    let url =  `${url_path.server}/criteria/${managerId}`;
    return await axios.get(url);
  }

}
