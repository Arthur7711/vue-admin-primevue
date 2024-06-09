import { API } from "@/API";
import { ICache, ICaches, ICreateCache } from "@/API/models/caches";
import { IParams } from "./models";

export const getAdminCaches = async (params?: {}): Promise<ICaches> => {
  const { data } = await API.get("/api/admin/cache-storages", { params });
  return data;
};

export const getAdminCache = async (
  id: number | string,
  params?: IParams
): Promise<ICache> => {
  const { data } = await API.get(`/api/admin/cache-storages/${id}`, { params });
  return data;
};

export const postAdminCache = async (
  payload?: ICreateCache
): Promise<ICache> => {
  const { data } = await API.post("/api/admin/cache-storages", payload);
  return data;
};

export const putAdminCache = async (
  id: number,
  payload?: Partial<ICreateCache>
): Promise<ICache> => {
  const { data } = await API.put(`/api/admin/cache-storages/${id}`, payload);
  return data;
};

export const deleteAdminCache = async (
  id: number | string
): Promise<ICache> => {
  const { data } = await API.delete(`/api/admin/cache-storages/${id}`);
  return data;
};
