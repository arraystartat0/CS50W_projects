import axios from "axios";
const API_BASE_URL = "http://192.168.0.101:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.defaults.headers.common["X-Frontend-Origin"] = window.location.origin;

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 responses
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

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          authService.logout();
          window.location.href = "/login";
        }
      } else {
        // No refresh token, logout user
        authService.logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

const authService = {
  // Login function
  async login(email, password, userType) {
    try {
      const response = await api.post("/auth/login/", {
        email,
        password,
        user_type: userType,
      });

      const { access_token, refresh_token, user_type, profile } = response.data;

      // Store tokens and user data
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user_type", user_type);
      localStorage.setItem("user_profile", JSON.stringify(profile));

      return {
        success: true,
        data: {
          user_type: user_type,
          profile: profile,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  },

  // Company registration
  async registerCompany(formData) {
    try {
      // data as expected by the backend
      const payload = {
        company: {
          name: formData.companyName,
          description: formData.description,
          registration_number: formData.registrationNumber,
          incorporation_date: formData.incorporationDate,
          company_type: formData.companyType,
          address: formData.address,
          city: formData.city,
          state_province: formData.state,
          country: formData.country,
          postal_code: formData.postalCode,
          email: formData.CompanyEmail,
          phone: formData.phone,
          website: formData.website,
        },
        admin: {
          first_name: formData.AdminFirstName,
          last_name: formData.AdminLastName,
          email: formData.AdminEmail,
          password: formData.AdminPassword,
        },
        reps: formData.reps.map((r) => ({
          last_name: r.lastName,
          email: r.RepEmail,
        })),
      };

      const response = await api.post("/auth/register/company/", payload);

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  },

  async validateInvitation(token) {
    try {
      const response = await api.get(`/auth/invitation/validate/${token}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Validation failed",
      };
    }
  },

  async acceptInvitation(formData) {
    try {
      const response = await api.post(
        "/auth/register/representative/accept/",
        formData
      );
      return { success: true, data: response.data };
    } catch (error) {
      const e = error.response?.data?.error;
      const message = Array.isArray(e) ? e[1] : e;
      return { success: false, error: message || "Registration failed" };
    }
  },

  async registerApplicant(formData) {
    try {
      const response = await api.post("/auth/register/applicant/", formData);

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_type");
    localStorage.removeItem("user_profile");
  },

  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem("access_token") !== null;
  },

  // Get user type
  getUserType() {
    return localStorage.getItem("user_type");
  },

  // Get user profile
  getUserProfile() {
    const profile = localStorage.getItem("user_profile");
    return profile ? JSON.parse(profile) : null;
  },

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

export default authService;
export { api };
