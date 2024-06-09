import { API } from '@/API';
import { IStaffApi, IUser, IDownloadHistory, IUnusedUsers } from '@/API/models/users';
import { IParams } from './models';

export const auth = async (): Promise<IUser> => {
  const { data } = await API.get('/api/admin/self');
  return data.data;
};

export const getAdminStaff = async (params: IParams): Promise<IStaffApi> => {
  const { data } = await API.get('/api/admin/staff', {
    params,
  });
  return data;
};

export const getAdminUnusedStaff = async (
  params?: IParams
): Promise<IUnusedUsers> => {
  const { data } = await API.get('/api/admin/unused-staff', {
    params,
  });
  return data;
};

export const getAdminDownloadHistory = async (
  params: IParams
): Promise<IDownloadHistory> => {
  const { data } = await API.get('/api/admin/connection-downloads', {
    params,
  });
  return data;
};
