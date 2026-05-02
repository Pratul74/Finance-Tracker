import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auto refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const refresh = localStorage.getItem("refresh");

    if (error.response?.status === 401 && refresh) {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,
        { refresh }
      );

      localStorage.setItem("access", res.data.access);

      error.config.headers.Authorization = `Bearer ${res.data.access}`;
      return axios(error.config);
    }

    return Promise.reject(error);
  }
);