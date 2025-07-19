import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: {
    id: number;
    email: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/admin/auth/login', credentials);
    // Save token to localStorage
    localStorage.setItem('adminToken', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('adminToken');
  // Redirect to login page
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('adminToken');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('adminToken');
};
