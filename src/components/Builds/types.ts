import { Dayjs } from "dayjs";
import { EColumnsKey } from "./constants";

export interface IDataTransfer {
  status: boolean;
  id: number;
  build: string;
  branch?: string;
  storage: string;
}

export type TColumnsKeys = {
  [key in EColumnsKey]: string;
};

export type TColumnsKey = keyof typeof EColumnsKey;

export interface IColumnKey {
  title: string;
  key: TColumnsKey;
  class: string;
}

export type TPickedColumns = {
  [key in keyof TColumnsKeys]: string;
};
export interface IBuildData {
  name: string;
  branch_name: string;
  status: string;
  expires_at?: Dayjs;
  is_permanent: boolean;
  storage_name: string;
}