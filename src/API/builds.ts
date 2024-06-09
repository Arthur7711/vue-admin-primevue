import { API } from '@/API';
import { IBuildCreate, IBuilds, IBuildsUploadedBy } from '@/API/models/builds';
import cookie from 'js-cookie';
import { IParams } from '@/API/models';
import { COOKIE_TOKEN } from './constants';

export const getAdminBuilds = async (params?: IParams): Promise<IBuilds> => {
  const { data } = await API.get('/api/admin/builds', { params });
  return data;
};

export const getAdminBuildsUploadedBy = async (
  params?: IParams
): Promise<IBuildsUploadedBy> => {
  const { data } = await API.get('api/admin/build-uploaded-by', { params });
  return data;
};

export const putAdminBuild = async (
  id: number,
  payload: Partial<IBuildCreate>
): Promise<void> => {
  await API.put(`/api/admin/builds/${id}`, payload);
};
export const getDownloadsBuild = (
  hash: string | number,
  name: string
): void => {
  fetch(`${import.meta.env.VITE_APP_API_URL}/download/${hash}`, {
    headers: {
      Authorization: `Bearer ${cookie.get(COOKIE_TOKEN)}`,
    },
  })
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}.torrent`;
      link.click();
    })
    .catch((error) => {
      throw new Error(error?.message);
    });
};
export const getBuildStatuses = async (): Promise<{
  items: string[];
  total: number;
}> => {
  const { data } = await API.get('api/admin/build-statuses');
  return data;
};

export const transferingBuilds = async (
  id: number,
  build_ids: number[]
): Promise<{ status: string }> => {
  const { data } = await API.post(`api/admin/storages/${id}/transfer-builds`, {
    build_ids,
  });
  return data;
};
