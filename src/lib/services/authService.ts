import { post, put, setAuthToken } from './apiService';
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

// Interface for the profile update payload
interface UpdateProfilePayload {
  fullName: string;
  email: string;
  oldPassword?: string;
  newPassword?: string;
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
      const response = await post<LoginResponse>('/auth/login', credentials);
      
      if (response.token && response.user) {
        // --- DATA TRANSFORMATION ---
        // To minimize impact on existing components, we transform the incoming `roles` array
        // into the `processRoles` array of strings that components expect.
        const userForStore: User = {
          ...response.user,
          processRoles: response.user.roles.map(role => role.name)
        };

        setAuthToken(response.token);
        authStore.set({ user: userForStore, token: response.token });
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(userForStore));
        }
      }
      
      return response;
    } catch (error) {
      // On failure, ensure the auth state is cleared
      this.logout();
      console.error('Login failed in authService:', error);
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
   * Checks for an existing session on page load.
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
          this.logout();
        }
      }
    }
  }
    /**
   * Updates the user's profile information.
   * @param payload The data to update.
   * @returns The updated user information.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    try {
      const updatedData = await put<Partial<User>>('/auth/profile', payload);
      
      authStore.updateUser(updatedData);

      // We need to get the updated user from the store to save it to localStorage
      let userToSave: User | null = null;
      const unsubscribe = authStore.subscribe(state => {
        userToSave = state.user;
      });
      unsubscribe(); // Unsubscribe immediately to avoid memory leaks

      if (userToSave && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userToSave));
      } else {
        throw new Error('Failed to retrieve updated user from the store.');
      }
      
      return userToSave;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
