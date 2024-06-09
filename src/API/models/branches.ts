import { IStorage } from '@/API/models/storages';
import { ICache } from '@/API/models/caches';

export interface IBranches {
  items: IBranch[];
  total: number;
}

export interface IBranch {
  builder: IBuilder;
  builds_count: number;
  created_at: string;
  id: number;
  is_manual_uploader: number;
  loader: string;
  name: string;
  platforms: string[];
  project?: IProject;
  project_id: number;
  role_name: string;
  size: number;
  status: string;
  storage: IStorage;
  storage_count: number;
  storage_id: number;
  storage_path: string;
  storage_time: string;
  updated_at: string;
  cache_storages: ICache[];
}
export interface IBranchRef extends Omit<IBranch, 'is_manual_uploader'> {
  is_manual_uploader: boolean;
}

export interface IBuilder {
  id: number;
  created_at: string;
  updated_at: string;
  branch_id: number;
  token: string;
  ssh_key: string;
  ssh_secret: string;
  ssh_username: string;
  password: string;
  public_key: string;
}

export interface IProject {
  id: number;
  name: string;
  color: string;
}

export interface IBranchData {
  name: string;
  storage_id: number | null;
  storage_time: string | null;
  status: string;
  loader: string;
}

export interface IBranchSearch {
  id: number | number[] | null;
  name: string;
  is_manual_uploader: string | null;
  role_name: string;
  storage_id: number | null;
  project_id?: number;
  storage_time: string | null;
  status: string | null;
  builds_count: {
    from: string;
    to: string;
  };
  size: {
    from: string;
    to: string;
    unit: number;
  };
  loader: string | null;
  cacheStorages?: number[];
}
export interface IPostBranchData {
  name: string;
  project_id: number;
  storage_id: number;
  loader?: string;
  is_manual_uploader?: boolean;
  storage_time?: string;
  status?: string;
}

export interface IBranchLocalData {
  name?: string;
  project_id?: number;
  storage_id?: number;
  loader?: string;
  is_manual_uploader?: boolean;
  storage_time?: number;
  status?: string;
  time_measurement: string;
}
