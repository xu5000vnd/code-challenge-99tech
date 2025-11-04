import axios from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  Session,
  PaginatedResponse,
  UserQueryParams,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // avoid 401 in login page
    if (window.location.pathname === "/login") {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Try to refresh the token
        const response = await axios.post<RefreshTokenResponse>(
          "/api/auth/refresh",
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        // Update tokens
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),

  refreshToken: (data: RefreshTokenRequest) =>
    api.post<RefreshTokenResponse>("/auth/refresh", data),

  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),

  logoutAll: () => api.post("/auth/logout-all"),

  getSessions: () => api.get<{ sessions: Session[] }>("/auth/sessions"),
};

export const userAPI = {
  getMe: () => api.get<User>("/users/me"),

  getUsers: (params?: UserQueryParams) =>
    api.get<PaginatedResponse<User>>("/users", { params }),

  getUser: (id: string) => api.get<User>(`/users/${id}`),

  createUser: (data: { name: string; email: string; password: string }) =>
    api.post<User>("/users", data),

  updateUser: (id: string, data: { name?: string; email?: string }) =>
    api.put<User>(`/users/${id}`, data),

  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export default api;
