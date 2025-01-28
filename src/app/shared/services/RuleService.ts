import api from "@shared/Interceptors";
import {RuleModel} from "@shared/models/RuleModel.ts";

export interface GetRulesResponse {
  data: {
    data: RuleModel[]
  };
}

export function getRules(): Promise<GetRulesResponse> {
  return api.get('/user/rules');
}
