import { serialize, parse } from "cookie";

export const setCookie = (name: string, value: string, options = {}) => {
  document.cookie = serialize(name, value, {
    path: "/",
    ...options,
  });
};

export const getCookie = (name: string) => {
  const cookies = parse(document.cookie);
  return cookies[name];
};
