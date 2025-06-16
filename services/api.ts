import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the correct API URL based on platform and environment
const getApiUrl = () => {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'web') {
      return 'http://localhost:3000/api';
    }
    // For iOS simulator
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000/api';
    }
    // For Android emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    }
  }
  // Production environment
  return 'https://your-production-api-url.com/api';
};

// API Configuration
const API_CONFIG = {
  baseUrl: getApiUrl(),
  endpoints: {
    register: '/auth/register',
    login: '/auth/login',
    profile: '/auth/profile',
  },
};

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface ValidationError {
  msg: string;
  param: string;
  location: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  errors?: ValidationError[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: any;
  errors?: ValidationError[];
}

// API Service
class ApiService {
  private async getHeaders(includeAuth = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    console.log('API Headers:', headers);
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data;
    try {
      data = await response.json();
      console.log('Raw API Response:', {
        status: response.status,
        url: response.url,
        data
      });
    } catch (error) {
      console.error('Error parsing response:', error);
      throw new Error('Invalid response from server');
    }

    if (!response.ok || !data.success) {
      console.error('API Error:', {
        status: response.status,
        url: response.url,
        data
      });

      // Handle specific error cases
      switch (response.status) {
        case 401:
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          throw new Error('Authentication failed. Please log in again.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 404:
          throw new Error('The requested resource was not found.');
        case 400:
          if (data.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors.map((e: ValidationError) => e.msg);
            throw new Error(errorMessages.join(', '));
          }
          break;
        case 500:
          throw new Error('Internal server error. Please try again later.');
        default:
          break;
      }

      throw new Error(data.message || 'An error occurred');
    }

    return data as T;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse['data']> {
    console.log('Registering user:', { name, email });
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`;
    console.log('Register URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getHeaders(false),
      body: JSON.stringify({ name, email, password }),
    });

    const data = await this.handleResponse<AuthResponse['data']>(response);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse['data']> {
    console.log('Logging in user:', { email });
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`;
    console.log('Login URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<AuthResponse>(response);
    return data.data;
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.profile}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    const data = await this.handleResponse<{ success: boolean; data: { user: User } }>(response);
    return data.data.user;
  }

  async get<T>(url: string): Promise<T> {
    console.log('GET Request:', `${API_CONFIG.baseUrl}${url}`);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${url}`, {
        headers: await this.getHeaders(),
      });
      const data = await this.handleResponse<T>(response);
      console.log('Processed GET response:', data);
      return data;
    } catch (error) {
      console.error('GET Request failed:', error);
      throw error;
    }
  }

  async post<T>(url: string, body: any): Promise<T> {
    console.log('POST Request:', {
      url: `${API_CONFIG.baseUrl}${url}`,
      body: JSON.stringify(body, null, 2)
    });
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${url}`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST Request failed:', error);
      throw error;
    }
  }

  async put<T>(url: string, body: any): Promise<T> {
    console.log('PUT Request:', {
      url: `${API_CONFIG.baseUrl}${url}`,
      body: JSON.stringify(body, null, 2)
    });
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${url}`, {
        method: 'PUT',
        headers: await this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('PUT Request failed:', error);
      throw error;
    }
  }

  async delete(url: string): Promise<void> {
    console.log('DELETE Request:', `${API_CONFIG.baseUrl}${url}`);
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${url}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('DELETE Request failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();