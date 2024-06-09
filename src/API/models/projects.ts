export interface IProjects {
  items: IProject[];
  total: number;
}

export interface IProject {
  id: number;
  name: string;
  color: string;
  description: string;
  host: string;
  port: string;
  path: string;
  vcs_type: string;
  depot_type: string;
  category: string;
  paths: string;
  status: number;
  state: string;
  jira_pid: number;
  image: string;
  deleted: number;
  file_server: string;
  file_server_path: string;
  bb_db_host: string;
  bb_db_schema: string;
  bb_db_user: string;
  bb_db_password: string;
  slug: string;
}
export interface IProjectProps {
  name?: string;
  is_delivery?: 1 | 0;
  limit?: number;
  page?: number;
  ids?: (number | string)[];
}
