import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-eng-app-ap-is.vercel.app/api",
});

// Attach the JWT to every request automatically, if we have one saved
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
