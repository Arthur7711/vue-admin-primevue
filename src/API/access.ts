import { API } from '@/API'

export const syncRoles = async (): Promise<void> => {
   await API.post("/api/admin/access-roles/reload")
}
