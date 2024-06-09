import { IProject } from './projects';

interface IMenue {
  id: number;
  name: string;
  title: string;
}
export interface IUser {
  id: number;
  samaccountname: string;
  displayname: string;
  title: string;
  office_id: number;
  department_id: number;
  division_id: number;
  head_id: number;
  telegram_username: string;
  hd: {
    id: number;
    office_id: number;
    department_id: number;
    office_shortname: string;
    office_name: string;
    department_name: string;
  };
  responseCheck: number;
  authCheck: boolean;
  permissions: string[];
  projects: IProject[];
  menus: IMenue[];
}

export interface IStaffConnections {
  created_at: string;
  data: string[];
  id: number;
  install_id: string;
  ip_country: null | {
    country_id: number;
    created_at: string;
    emoji: string;
    id: number;
    ip_address: string;
    updated_at: string;
  };
  ip_country_id: null | number;
  is_connected: boolean;
  ping_at: null;
  settings: string[];
  staff_id: number;
  status: string;
  updated_at: string;
  staff: {
    created_at: string;
    displayname: string;
    id: number;
    samaccountname: string;
    updated_at: string;
  };
}

export interface IStaff {
  created_at: string;
  displayname: string;
  id: number;
  samaccountname: string;
  updated_at: string;
  connections: IStaffConnections[];
}
export interface IAssignedRoles {
  project_id: number;
  project_name: string;
  role_id: number;
  role_name: string;
  service_id: number;
  service_name: string;
  user_id: number;
}
export interface IUnusedUserTable {
  id: number;
  name: string;
  project: string;
}

export interface IUnusedUserAssignedRole {
  user_id: number;
  role_id: number;
  role_name: string;
  project_id: number;
  project_name: string;
  service_id: number;
  service_name: string;
}

export interface IUnusedUserWithTable {
  id: number;
  displayname: string;
  samaccountname: string;
  table: IUnusedUserTable[];
  assigned_roles: never;
}

export interface IUnusedUserWithRoles {
  id: number;
  displayname: string;
  samaccountname: string;
  table: never;
  assigned_roles: IUnusedUserAssignedRole[];
}

export type IUnusedUser = IUnusedUserWithTable | IUnusedUserWithRoles

export interface IUnusedStaff {
  displayname: string;
  id: number;
  samaccountname: string;
  assigned_roles: IAssignedRoles[];
  branches: {
    id: number;
    name: string;
    project_id: number;
    role_name: string;
  }[];
}
export interface IUnusedUsers {
  items: IUnusedStaff[];
  total: number;
}
export interface IStaffApi {
  items: IStaff[];
  total: number;
}
export interface IHistoryItem {
  connection_id: number;
  build_id: number | string;
  start_date: string;
  last_date: string;
  download_time: number | string;
  is_finish: boolean;
  connection?: IStaffConnections;
  last_event?: string;
  ip_country?: {
    id: string;
    ip_address: string;
  };
}
export interface IDownloadHistory {
  total: number;
  items: IHistoryItem[];
}
