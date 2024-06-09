export default (size: number | string, userName: string) =>
  `${import.meta.env.VITE_APP_API_URL_AVATAR}/?size=${size}&user=${userName}`;
