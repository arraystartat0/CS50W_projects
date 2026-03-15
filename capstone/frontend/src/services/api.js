import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.101:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// utility function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    if (isTokenExpired(token)) {
      // remove expired token from storage
      localStorage.removeItem('access_token');
      // then response interceptor will handle the refresh
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

//handle token refresh on 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest.url.includes("/auth/login/")
    ) {
      return Promise.reject(error);
    }

    // token refresh for other 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access } = response.data;
          localStorage.setItem("access_token", access);

          // retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError.response?.data);
          // refresh failed -> logout user
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_type");
          localStorage.removeItem("user_profile");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        console.log("No refresh token found");
        // no refresh token -> logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_type");
        localStorage.removeItem("user_profile");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;