import { API } from "@/API";
import {
  IBranches,
  IProjects,
  IStorage,
  IStorages,
  IStorageCreateProps,
} from "@/API/models/storages";

export const getAdminStorages = async (params?: {
  limit?: number;
  filters?: string;
}): Promise<IStorages> => {
  const { data } = await API.get("/api/admin/storages", { params });
  return data;
};

export const getAdminStorage = async (id: number): Promise<IStorage> => {
  const { data } = await API.get(`/api/admin/storages/${id}`);
  return data;
};

export const getAdminStoragesProjects = async (params?: {
  limit?: number;
}): Promise<IProjects> => {
  const { data } = await API.get("/api/admin/storages/projects", { params });
  return data;
};

export const getAdminStoragesBranches = async (params?: {
  limit?: number;
  with?: string[];
}): Promise<IBranches> => {
  const { data } = await API.get("/api/admin/storages/branches", { params });
  return data;
};

export const postAdminStorage = async (
  payload: IStorageCreateProps
): Promise<IStorage> => {
  const { data } = await API.post(`/api/admin/storages`, payload);
  return data;
};

export const putAdminStorage = async (
  id: number,
  payload: Partial<IStorageCreateProps>
): Promise<void> => {
  await API.put(`/api/admin/storages/${id}`, payload);
};
export const deleteAdminStorage = async (
  id: number | string
): Promise<void> => {
  await API.delete(`/api/admin/storages/${id}`);
};
