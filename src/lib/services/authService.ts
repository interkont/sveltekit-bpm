import { post, setAuthToken } from './apiService';
import type { User } from '$lib/types'; // Assuming your User type is defined here
import { authStore } from '$lib/stores/authStore'; // We'll use a dedicated auth store

// Interface for the login credentials payload
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for the expected response from the login endpoint
interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  /**
   * Attempts to log in the user with the provided credentials.
   * If successful, it sets the authentication token for future API requests
   * and updates the auth store.
   * @param credentials The user's email and password.
   * @returns The user and token from the backend.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // The path should start from the resource, not with /api again.
      const response = await post<LoginResponse>('/auth/login', credentials);
      
      if (response.token && response.user) {
        // Set the token in our apiService for all subsequent requests
        setAuthToken(response.token);
        
        // Update the auth store with the logged-in user's data and token
        authStore.set({ user: response.user, token: response.token });
        
        // For persistence across page reloads, save the token and user to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      
      return response;
    } catch (error) {
      // On failure, ensure the auth state is cleared
      this.logout();
      console.error('Login failed in authService:', error);
      // Re-throw the error to be handled by the UI component
      throw error;
    }
  }

  /**
   * Logs the user out by clearing the token, store, and localStorage.
   */
  logout() {
    setAuthToken(null);
    authStore.set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Checks for an existing session (e.g., on page load)
   * by looking for a token and user data in localStorage.
   * This should be called once when the app initializes (e.g., in a root +layout.svelte).
   */
  initializeAuth() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userJson = localStorage.getItem('user');
    
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          setAuthToken(token);
          authStore.set({ user, token });
        } catch (e) {
          // If parsing fails, the data is corrupt, so log out
          this.logout();
        }
      }
    }
  }
}

export const authService = new AuthService();
