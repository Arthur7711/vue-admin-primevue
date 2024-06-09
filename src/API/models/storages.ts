export interface IStorages {
  items: IStorage[];
  total: number;
}

export interface IProjects {
  items: IStorageProject[];
  total: number;
}

export interface IBranches {
  items: IStorageBranch[];
  total: number;
}

export interface IStorage {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  base_url: string;
  builds_root_path: string;
  builds_mapped_path: string;
  qbt_url: string;
  server_name: string;
  qbt_username: string;
  qbt_password: string;
  shortname: string;
  free: number;
  used: number;
  status: string;
  projects: IStorageProject[];
  other_projects: IStorageProject[];
}

export interface IStorageProject {
  color: string;
  name: string;
  project_id: number;
  storage_id: number;
  total_size: number;
  percent?: number;
  branches?: IStorageBranch[];
}

export interface IStorageBranch {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  project_id: number;
  storage_id: number;
  storage_path: string;
  role_name: string;
  storage_time: string;
  status: string;
  platforms: string[];
  size: number;
  expires_at: string;
}
export type TActiveBranch = Pick<IStorageBranch, "id" | "storage_id">;

export interface IStorageCreateProps {
  name: string;
  shortname?: string;
  base_url?: string;
  builds_root_path?: string;
  builds_mapped_path?: string;
  qbt_url?: string;
  server_name?: string;
  qbt_username?: string;
  qbt_password?: string;
  status?: string;
  cache_storage_id?: number;
}
