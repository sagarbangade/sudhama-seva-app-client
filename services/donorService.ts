import { apiService } from './api';

export interface Donor {
  _id: string;
  hundiNo: string;
  name: string;
  mobileNumber: string;
  address: string;
  googleMapLink?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  date: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface DonorResponse {
  success: boolean;
  message?: string;
  data: {
    donor?: Donor;
    donors?: Donor[];
    pagination?: {
      total: number;
      page: number;
      pages: number;
    };
  };
}

export interface DonorFilters {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  longitude?: number;
  latitude?: number;
  radius?: number;
}

class DonorService {
  private readonly baseUrl = '/donors';

  async createDonor(donorData: Omit<Donor, '_id' | 'createdBy' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Donor> {
    try {
      console.log('Creating donor:', donorData);
      const response = await apiService.post<DonorResponse>(this.baseUrl, donorData);
      console.log('Create donor response:', response);

      if (!response.data?.donor) {
        throw new Error('No donor data received');
      }
      return response.data.donor;
    } catch (error) {
      console.error('Error creating donor:', error);
      throw error;
    }
  }

  async getDonors(filters: DonorFilters = {}): Promise<{ donors: Donor[]; pagination: { total: number; page: number; pages: number } }> {
    try {
      console.log('Getting donors with filters:', filters);
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const url = `${this.baseUrl}?${params.toString()}`;
      console.log('Request URL:', url);

      const response = await apiService.get<{
        success: boolean;
        data: {
          donors: Donor[];
          pagination: { total: number; page: number; pages: number };
        }
      }>(url);

      console.log('Get donors response:', response);

      if (!response?.data?.donors || !response?.data?.pagination) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      return {
        donors: response.data.donors,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching donors:', error);
      return {
        donors: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1
        }
      };
    }
  }

  async getDonorsByLocation(longitude: number, latitude: number, radius: number = 10000): Promise<Donor[]> {
    try {
      console.log('Getting donors by location:', { longitude, latitude, radius });
      const params = new URLSearchParams({
        longitude: longitude.toString(),
        latitude: latitude.toString(),
        radius: radius.toString()
      });

      const response = await apiService.get<DonorResponse>(`${this.baseUrl}/location?${params.toString()}`);
      console.log('Get donors by location response:', response);

      if (!response.data?.donors) {
        throw new Error('No donors data received');
      }
      return response.data.donors;
    } catch (error) {
      console.error('Error fetching donors by location:', error);
      return [];
    }
  }

  async getDonorById(id: string): Promise<Donor> {
    try {
      console.log('donorService.getDonorById called with id:', id);
      const response = await apiService.get<{
        success: boolean;
        data: {
          donor: Donor;
        }
      }>(`${this.baseUrl}/${id}`);

      console.log('getDonorById raw response:', response);

      // The donor data is nested under response.data.donor
      if (!response?.data?.donor) {
        console.error('Invalid response format:', response);
        throw new Error('No donor data received');
      }

      return response.data.donor;
    } catch (error) {
      console.error('Error in donorService.getDonorById:', error);
      throw error;
    }
  }

  async updateDonor(id: string, donorData: Partial<Donor>): Promise<Donor> {
    try {
      console.log('Updating donor:', { id, donorData });
      const response = await apiService.put<DonorResponse>(`${this.baseUrl}/${id}`, donorData);
      console.log('Update donor response:', response);

      if (!response.data?.donor) {
        throw new Error('No donor data received');
      }
      return response.data.donor;
    } catch (error) {
      console.error('Error updating donor:', error);
      throw error;
    }
  }

  async deleteDonor(id: string): Promise<void> {
    try {
      console.log('Deleting donor:', id);
      await apiService.delete(`${this.baseUrl}/${id}`);
      console.log('Donor deleted successfully');
    } catch (error) {
      console.error('Error deleting donor:', error);
      throw error;
    }
  }
}

export const donorService = new DonorService();