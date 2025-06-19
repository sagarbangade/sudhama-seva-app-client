import { apiService } from './api';

export interface Group {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

class GroupService {
  private readonly baseUrl = '/groups';

  async createGroup(data: {
    name: string;
    description?: string;
  }): Promise<Group> {
    try {
      const response = await apiService.post<{ success: boolean; data: { group: Group } }>(
        this.baseUrl,
        data
      );
      return response.data.group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroups(): Promise<Group[]> {
    try {
      const response = await apiService.get<{ success: boolean; data: { groups: Group[] } }>(
        this.baseUrl
      );
      return response.data.groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  async getGroupById(id: string): Promise<{ group: Group; donors: any[] }> {
    try {
      const response = await apiService.get<{
        success: boolean;
        data: { group: Group; donors: any[] };
      }>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  async updateGroup(id: string, data: {
    name?: string;
    description?: string;
  }): Promise<Group> {
    try {
      const response = await apiService.put<{ success: boolean; data: { group: Group } }>(
        `${this.baseUrl}/${id}`,
        data
      );
      return response.data.group;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  async assignDonorsToGroup(groupId: string, donorIds: string[]): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/${groupId}/assign`, { donorIds });
    } catch (error) {
      console.error('Error assigning donors to group:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService();