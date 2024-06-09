export interface ExternalItem {
  id: number;
  service: string;
  service_id: string;
  type: string;
  message: string;
  file: string;
  line: number;
  trace: string;
  created_at: string;
  updated_at: string;
}
export interface IExternal {
  items: ExternalItem[];
  total: number;
}
