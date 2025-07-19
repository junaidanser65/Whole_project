import api from './api';

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  business_name: string;
  is_verified: boolean;
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

export const getVendors = async (): Promise<Vendor[]> => {
  try {
    const response = await api.get<Vendor[]>("/admin/vendors");
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return []; // fallback
  }
};



export const getVendorById = async (id: number): Promise<Vendor> => {
  try {
    const response = await api.get<Vendor>(`/admin/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vendor ${id}:`, error);
    throw error;
  }
};

export const updateVendorVerification = async (id: number, isVerified: boolean): Promise<Vendor> => {
  try {
    const response = await api.patch<Vendor>(`/admin/vendors/${id}/verify`, { is_verified: isVerified });
    return response.data;
  } catch (error) {
    console.error(`Error updating vendor ${id} verification:`, error);
    throw error;
  }
};

export const deleteVendor = async (id: number): Promise<void> => {
  try {
    await api.delete(`/admin/vendors/${id}`);
  } catch (error) {
    console.error(`Error deleting vendor ${id}:`, error);
    throw error;
  }
};
