import { API } from "@/API";
import {
  IProxies,
  IProxy,
  IProxyBuilds,
  IProxySubs,
  IProxieCreateProps,
  IProxiesStorageProps,
} from "@/API/models/proxies";
import { IParams } from "./models";

export const getAdminProxies = async (params?: IParams): Promise<IProxies> => {
  const { data } = await API.get("/api/admin/proxy-storages", { params });
  return data;
};

export const getAdminProxy = async (
  id: number,
  params?: IParams
): Promise<IProxy> => {
  const { data } = await API.get(`/api/admin/proxy-storages/${id}`, {
    params,
  });
  return data;
};

export const getAdminProxyBuilds =
  async (params?: IParams): Promise<IProxyBuilds> => {
    const { data } = await API.get("/api/admin/proxy-storage-builds", {
      params,
    });
    return data;
  };

export const getAdminSubscriptions = async (
  id: number,
  params?: IParams
): Promise<IProxySubs> => {
  const { data } = await API.get(
    `/api/admin/proxy-storages/${id}/subscriptions`,
    { params }
  );
  return data;
};

export const postAdminProxy = async (
  payload?: IProxieCreateProps
): Promise<IProxy> => {
  const { data } = await API.post(`/api/admin/proxy-storages`, payload);
  return data;
};

export const postAdminSubscription = async (
  id: number,
  payload?: IProxiesStorageProps
): Promise<void> => {
  await API.post(`/api/admin/proxy-storages/${id}/subscriptions`, payload);
};

export const putAdminProxy = async (
  id: number,
  payload?: Partial<IProxieCreateProps>
): Promise<void> => {
  await API.put(`/api/admin/proxy-storages/${id}`, payload);
};

export const putAdminSubscription = async (
  id: number,
  payload?: Partial<IProxiesStorageProps>
): Promise<void> => {
  await API.put(`/api/admin/proxy-storage-subscriptions/${id}`, payload);
};

export const deleteAdminProxy = async (id: number): Promise<void> => {
  await API.delete(`/api/admin/proxy-storages/${id}`);
};

export const deleteAdminSubscription = async (id: number): Promise<void> => {
  await API.delete(`/api/admin/proxy-storage-subscriptions/${id}`);
};
