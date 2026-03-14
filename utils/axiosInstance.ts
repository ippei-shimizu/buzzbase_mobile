import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_V1_URL } from "@constants/api";

const axiosInstance = axios.create({
  baseURL: API_V1_URL,
});

axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync("access-token");
  const client = await SecureStore.getItemAsync("client");
  const uid = await SecureStore.getItemAsync("uid");

  if (accessToken && client && uid) {
    config.headers["access-token"] = accessToken;
    config.headers["client"] = client;
    config.headers["uid"] = uid;
  }

  return config;
});

export default axiosInstance;
