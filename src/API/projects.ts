import { API } from "@/API";
import { IProjects, IProjectProps } from "@/API/models/projects";

export const getAdminProjects = async (
  params?: IProjectProps
): Promise<IProjects> => {
  const { data } = await API.get("/api/admin/projects", { params });
  return data;
};
