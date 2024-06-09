import { IBranch } from '@/API/models/branches';
import { IBuild } from '@/API/models/builds';

export interface IProxies {
  items: IProxy[];
  total: number;
}

export interface IProxySubs {
  items: IProxySub[];
  total: number;
}

export interface IProxyBuilds {
  items: IProxyBuild[];
  total: number;
}
interface ExternalData {
  build_date: string;
  build_number: string;
  build_number_full: string;
  git_commit_author: string;
  git_commit_branch: string;
  git_commit_date: string;
  git_commit_desc: string;
  git_commit_hash: string;
  laravel: string;
  php: string;
  qbt_url: string;
  free_space: number;
}
export interface IProxy {
  id: number;
  name: string;
  api_token: string;
  created_at: string;
  updated_at: string;
  ping_at?: string;
  ip?: string;
  deleted_at?: string | null;
  branches?: IProxySub[];
  description?: string;
  external_data?: ExternalData;
}

export interface IProxySub {
  branch: IBranch;
  branch_builds: IBuild;
  branch_id: number;
  created_at: string;
  id: number;
  depth: number;
  proxy_storage_id: number;
  updated_at: string;
  count: number;
}

export interface IProxyBranch {
  id?: number;
  branch_id: number;
  name?: string;
  depth: number;
}

export interface IProxyBuild {
  id: number;
  proxy_storage_id: number;
  build_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  build?: IBuild;
}

export interface IProxyQuery {
  operator?: string;
  id?: number | string;
  name?: string;
  ip?: number;
  branch?: string;
  depth?: string;
  status?: string;
  proxy_storage_id?: number;
}

export interface ISearchBuilds {
  build_id: number | null,
  name: string;
  proxy_storage_id: number | null;
  status: string | null;
  build: string;
  branch_build: string| null;
}

export interface ISearchProxy {
  id: string;
  name: string;
  branch: string;
  depth: {
    from: string;
    to: string;
  };
}
export interface IProxieCreateProps {
  name: string;
  description?: string;
  api_token?: string;
}
export interface IProxiesStorageProps {
  branch_id: number;
  depth: number;
}
