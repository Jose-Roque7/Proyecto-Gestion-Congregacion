import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");

  if (!token) {
    delete config.headers.Authorization;
    return config;
  }

  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      Cookies.remove("auth_token");
      delete config.headers.Authorization;

      // 🚨 NO router aquí
      window.dispatchEvent(new Event("/"));

      return config;
    }

    config.headers.Authorization = `Bearer ${token}`;
  } catch {
    Cookies.remove("auth_token");
    delete config.headers.Authorization;
    window.dispatchEvent(new Event("/"));
  }

  return config;
});

export default api;
