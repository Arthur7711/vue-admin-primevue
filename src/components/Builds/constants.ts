import { IColumnKey } from './types';

export enum EColumnsKey {
  // show_remove = "show_remove",
  index = 'index',
  user = 'user',
  install_id = 'install_id',
  ip = 'ip',
  date = 'date',
  download = 'download',
  status = 'status',
}
export const COLUMNS: Array<IColumnKey> = [
  // { title: "", key: "show_remove", class: "" },
  { title: '', key: 'index', class: 'index' },
  { title: 'user', key: 'user', class: 'user' },
  { title: 'install ID', key: 'install_id', class: 'install' },
  { title: 'IP', key: 'ip', class: 'ip' },
  { title: 'date', key: 'date', class: 'date' },
  { title: 'download t', key: 'download', class: 'download' },
  { title: 'latest status', key: 'status', class: 'status' },
];
export const ApiImg = import.meta.env.VITE_APP_API_URL;

export const pendingStatuses = ['pending','uploaded', 'missed', 'error'];
export const missedStatuses = ['missed', 'pending', 'uploaded', 'error',  'deleting'];
export const errorStatuses = ['error', 'pending', 'uploaded', 'missed', 'deleting'];
export const seedingStatus = ['deleting' , 'seeding'];
