import { API } from "@/API";
import { IBranch, IBranches, IPostBranchData } from "@/API/models/branches";
import { IParams } from "./models";

export const getAdminBranches = async (
  params?: IParams
): Promise<IBranches> => {
  const { data } = await API.get("/api/admin/branches", { params });
  return data;
};

export const getAdminBranch = async (id: number): Promise<IBranch> => {
  const { data } = await API.get(`/api/admin/branches/${id}`);
  return data;
};

export const getAdminBranchCaches = async (id: number): Promise<IBranch> => {
  const { data } = await API.get(`/api/admin/branches/${id}/cache-storages`);
  return data;
};

export const getStorageStatuses = async (): Promise<{
  items: string[];
  total: number;
}> => {
  const { data } = await API.get(`/api/admin/storage-statuses`);
  return data;
};

export const postAdminBranch = async (
  payload: IPostBranchData
): Promise<IBranch> => {
  const { data } = await API.post(`/api/admin/branches`, payload);
  return data;
};

export const postAdminBranchCaches = async (branchId: number, payload): Promise<IBranch> => {
  const { data } = await API.post(`/api/admin/branches/${branchId}/cache-storages`, payload);
  return data;
};

export const putAdminBranch = async (id: number, payload: Partial<IPostBranchData>): Promise<void> => {
  await API.put(`/api/admin/branches/${id}`, payload);
};

export const deleteAdminBranchCaches = async (branchId: number, cache_storage_ids: number[]): Promise<IBranch> => {
  const { data } = await API.delete(`/api/admin/branches/${branchId}/cache-storages`, {
    params: { cache_storage_ids }
  });
  return data;
};
