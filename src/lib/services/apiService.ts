// Correctly import public environment variables for SvelteKit
import { PUBLIC_API_BASE_URL } from '$env/static/public';

// This will hold the JWT token for when we switch to JWT-based auth.
let authToken: string | null = null;

// Function to set the authentication token for subsequent requests
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// A helper function to handle fetch responses and parse JSON
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

// Generic request function that handles headers, methods, and body
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

  // If a JWT token exists, add it.
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
    console.error(`${method} request to ${endpoint} failed:`, error);
    throw error;
  }
};

// Exported convenience methods for each HTTP verb
export const get = <T>(endpoint: string): Promise<T> => {
  return request<T>('GET', endpoint);
};

export const post = <T>(endpoint: string, body: object): Promise<T> => {
  return request<T>('POST', endpoint, body);
};

export const put = <T>(endpoint: string, body: object): Promise<T> => {
  return request<T>('PUT', endpoint, body);
};

export const del = <T>(endpoint: string): Promise<T> => {
  return request<T>('DELETE', endpoint);
};
