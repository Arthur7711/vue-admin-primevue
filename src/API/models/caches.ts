import { IBranch } from "@/API/models/branches";
import { IBuild } from "@/API/models/builds";

export interface ICaches {
  items: ICache[];
  total: number;
}

export interface ICache {
  branches?: IBranch[];
  id: number;
  name: string;
  depth: number;
  description?: string;
  host?: string;
  token: string;
  created_at: string;
  updated_at: string;
  pre_create_users: number;
  ip_address?: string;
  ping_at?: string;
  port?: number | null;
  external_data?: IExternalData | null;
  type: string;
  status: string;
  is_builds: boolean;
  cache_users: ICacheUser[];
}

export interface ICacheUser {
  id: number;
  login: string;
  build_id: number;
  cache_storage_id: number;
  created_at: string;
  updated_at: string;
  build: IBuild | null;
}

export interface IExternalData {
  laravel: string;
  php: string;
  qbt_url: string;
  build_number: string | number;
  build_number_full: string;
  build_date: string;
  git_commit_branch: string;
  git_commit_hash: string;
  git_commit_author: string;
  git_commit_desc: string;
  git_commit_date: string;
  free_space?: number;
}

export interface ICacheSearch {
  id: number | number[] | null;
  name: string;
  host: string;
  ip_address: string;
  type: string | null;
  status: string | null;
}
export interface ICreateCache {
  name: string;
  description?: string;
  token?: string;
  pre_create_users?: string;
  type?: string;
  status?: string;
  depth?: number;
}
