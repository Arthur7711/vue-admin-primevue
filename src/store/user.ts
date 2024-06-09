import { IUser } from '@/API/models/users';
import { auth } from '@/API/users';
import { logout } from '@/API';
import { ref } from 'vue';

const useUserStore = () => {
  const self = ref<IUser | null>(null);
  const authUser = async () => {
    try {
      self.value = await auth();
    } catch (error) {

    }
  };
  const logoutUser = () => logout();
  return { authUser, self, logoutUser };
};

export default useUserStore();
