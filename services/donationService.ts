import { apiService } from './api';

export interface Donation {
  _id: string;
  donor: {
    _id: string;
    name: string;
    hundiNo: string;
  };
  amount: number;
  collectionDate: string;
  collectionMonth: string;
  status: 'pending' | 'collected' | 'skipped';
  collectedBy: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyStatus {
  year: number;
  month: number;
  totalDonors: number;
  collected: number;
  pending: number;
  skipped: number;
  statusReport: {
    donor: {
      id: string;
      name: string;
      hundiNo: string;
    };
    status: 'pending' | 'collected' | 'skipped';
    donation: Donation | null;
  }[];
}

class DonationService {
  private readonly baseUrl = '/donations';

  async createDonation(data: {
    donorId: string;
    amount: number;
    collectionDate: string;
    status: 'pending' | 'collected' | 'skipped';
    notes?: string;
  }): Promise<Donation> {
    try {
      const response = await apiService.post<{ success: boolean; data: { donation: Donation } }>(
        this.baseUrl,
        data
      );
      return response.data.donation;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  }

  async getDonations(params: {
    donorId?: string;
    month?: number;
    year?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ donations: Donation[]; pagination: { total: number; page: number; pages: number } }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await apiService.get<{
        success: boolean;
        data: {
          donations: Donation[];
          pagination: { total: number; page: number; pages: number };
        };
      }>(`${this.baseUrl}?${queryParams.toString()}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  }

  async getMonthlyStatus(year: number, month: number): Promise<MonthlyStatus> {
    try {
      const response = await apiService.get<{ success: boolean; data: MonthlyStatus }>(
        `${this.baseUrl}/monthly-status?year=${year}&month=${month}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly status:', error);
      throw error;
    }
  }

  async updateDonation(
    id: string,
    data: {
      amount?: number;
      status?: 'pending' | 'collected' | 'skipped';
      notes?: string;
    }
  ): Promise<Donation> {
    try {
      const response = await apiService.put<{ success: boolean; data: { donation: Donation } }>(
        `${this.baseUrl}/${id}`,
        data
      );
      return response.data.donation;
    } catch (error) {
      console.error('Error updating donation:', error);
      throw error;
    }
  }

  async deleteDonation(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }
  }
}

export const donationService = new DonationService();