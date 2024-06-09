import { API } from "./index";
import { IParams } from "./models";
import { IExternal } from "./models/external";

export const getExternalLogs = async (params?: IParams): Promise<IExternal> => {
  const { data } = await API.get("/api/admin/external-logs", {
    params,
  });
  return data;
};
