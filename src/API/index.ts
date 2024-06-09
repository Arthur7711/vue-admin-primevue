import axios, { InternalAxiosRequestConfig } from 'axios';
import cookie from 'js-cookie';
import { COOKIE_TOKEN, COOKIE_PATH, getCookieDomain } from './constants';
import { notification } from 'ant-design-vue';

const COOKIE_DOMAIN = getCookieDomain();
const REDIRECT_AUTH_URL = `https://login${COOKIE_DOMAIN}`;
const COOKIE_OPTIONS = { path: COOKIE_PATH, domain: COOKIE_DOMAIN };

export function logout() {
  cookie.remove(COOKIE_TOKEN, COOKIE_OPTIONS);
  window.location.replace(
    `${REDIRECT_AUTH_URL}?redirect=${window.location.href}`
  );
}

export const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
  if (cookie.get(COOKIE_TOKEN)) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${cookie.get(COOKIE_TOKEN)}`,
      },
    } as InternalAxiosRequestConfig;
  }
  logout();
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      logout();
    }
    if (error?.response?.status === 403 && error.config.url!=='/api/admin/self') {
      location.href='/401'
    }
    notification.warn({
      message: error?.response?.data?.message || 'Неожиданная ошибка',
    });
    throw new Error(error);
  }
);
