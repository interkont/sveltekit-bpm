import { PUBLIC_API_BASE_URL } from '$env/static/public';

class ApiService {
  private baseUrl: string;

  constructor() {
    // Use the environment variable defined in .env files
    // PUBLIC_ prefix is required for client-side environment variables in SvelteKit
    this.baseUrl = PUBLIC_API_BASE_URL;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json() as T;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  // Add other methods like post, put, delete as needed
  // async post<T>(endpoint: string, data: any): Promise<T> {
  //   const url = `${this.baseUrl}${endpoint}`;
  //   try {
  //     const response = await fetch(url, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(data),
  //     });
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     return await response.json() as T;
  //   } catch (error) {
  //     console.error('Error posting data:', error);
  //     throw error;
  //   }
  // }
}

export const apiService = new ApiService();