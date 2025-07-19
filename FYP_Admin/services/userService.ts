import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  avatar_url?: string;
  role: 'admin' | 'vendor' | 'user';
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>("/admin/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return []; // fallback
  }
};


export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

export const updateUserStatus = async (id: number, isActive: boolean): Promise<User> => {
  try {
    const response = await api.patch<User>(`/admin/users/${id}/status`, { is_active: isActive });
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id} status:`, error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/users/${id}`);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};
