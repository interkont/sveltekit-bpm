// Correctly import public environment variables for SvelteKit
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { toast } from '$lib/stores/toast'; // <-- 1. Import the toast store

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } else {
    const errorBody = await response.json().catch(() => ({
      message: `HTTP error! Status: ${response.status} ${response.statusText}`,
    }));
    throw new Error(errorBody.message || 'An unknown error occurred');
  }
};

const request = async <T>(
  method: string,
  endpoint: string,
  body: object | null = null,
): Promise<T> => {
  if (!PUBLIC_API_BASE_URL) {
    throw new Error("PUBLIC_API_BASE_URL is not defined in your .env file.");
  }
  
  const url = `${PUBLIC_API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    return await handleResponse<T>(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    // --- 2. Show a toast notification for any API error ---
    toast.show(errorMessage, 'error');

    console.error(`${method} request to ${endpoint} failed:`, error);
    // Re-throw the error so that individual components/stores can still handle it if they need to
    throw error;
  }
};

// Exported convenience methods for each HTTP verb
export const get = <T>(endpoint: string): Promise<T> => request<T>('GET', endpoint);
export const post = <T>(endpoint: string, body: object): Promise<T> => request<T>('POST', endpoint, body);
export const put = <T>(endpoint: string, body: object): Promise<T> => request<T>('PUT', endpoint, body);
export const del = <T>(endpoint: string): Promise<T> => request<T>('DELETE', endpoint);
