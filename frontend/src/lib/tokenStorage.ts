const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const tokenStorage = {
  save(access: string, refresh: string, remember: boolean) {
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    store.setItem(ACCESS_KEY, access);
    store.setItem(REFRESH_KEY, refresh);
    other.removeItem(ACCESS_KEY);
    other.removeItem(REFRESH_KEY);
  },
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};
