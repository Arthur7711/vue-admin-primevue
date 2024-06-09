import IDayjs from '@/API/models/IDayjs';
import { Dayjs } from 'dayjs';
import { IBranch } from '@/API/models/branches';
import { IProxy } from '@/API/models/proxies';
import { IStorage } from '@/API/models/storages';

export interface IBuild {
  branch?: IBranch;
  branch_id: number;
  build_size: number;
  created_at: string;
  deleted_at: string | null;
  download_url: string;
  executable_file: string;
  expires_at: string;
  extract_status: string;
  filename: string;
  hash_id: string;
  id: number;
  is_archived: string | null;
  is_permanent: number;
  name: string;
  parent_id: string;
  platform: string;
  project: {
    id: number;
    name: string;
  };
  proxy_storages?: IProxy[];
  source: string;
  status: string;
  storage?: IStorage;
  storage_folder_path: string;
  storage_id: number;
  storage_path: string | null;
  torrent_file: string | null;
  torrent_hash: string | null;
  type: string;
  updated_at: string;
  uploaded_by: string;
  external_data: {
    hostname: string;
    ip: string;
  } | null
}
export interface IBuilds {
  items: IBuild[];
  total: number;
}
export interface IBuildData {
  expires_at: IDayjs | Dayjs | null;
  is_permanent: boolean;
}

export interface IBuildSearch {
  id: number | number[] | null;
  name: string;
  hash_id: string;
  role_name: string;
  branch_id: number | null;
  storage_id: number | null;
  project_id: number | null;
  is_permanent: string | null;
  build_size: {
    from: string;
    to: string;
    unit: number;
  };
  status: string | null;
  uploaded_by: string | null;
  created_at: [IDayjs | undefined | null, IDayjs | undefined | null];
  expires_at: [IDayjs | undefined | null, IDayjs | undefined | null];
}

export interface IBuildCreate {
  name?: string;
  storage_path?: string;
  download_url?: string;
  filename?: string;
  branch_id?: number;
  hash_id?: string;
  executable_file?: string;
  build_size?: number;
  expires_at?: string;
  platform?: string;
  torrent_file?: string;
  storage_folder_path?: string;
  extract_status?: string;
  source?: string;
  uploaded_by?: string;
  parent_id?: number;
  torrent_hash?: string;
  is_permanent?: number;
}

export interface IBuildsUploadedBy {
  items: string[];
  total: number;
}

export interface IBuildStatus {
  id: number;
  title: string;
  icon: string;
}
