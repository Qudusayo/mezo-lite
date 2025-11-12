// app/services/auth.ts
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_WEB_URI!;

const X_AUTH_KEY = process.env.EXPO_PUBLIC_X_AUTH_KEY!;

interface UserData {
  email: string;
  username: string;
  walletAddress: string;
}

interface AuthResponse {
  success: boolean;
  user?: UserData;
  sessionToken?: string;
  message?: string;
}

interface SessionValidationResponse {
  valid: boolean;
  user?: UserData;
  message?: string;
}

export async function signInUser(userData: UserData): Promise<AuthResponse> {
  console.log('Making request to:', `${API_URL}/api/mobile-auth`);
  
  const response = await fetch(`${API_URL}/api/mobile-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-key': X_AUTH_KEY,
    },
    body: JSON.stringify(userData),
  });

  const data: AuthResponse = await response.json();
  console.log('Auth Response:', data);
  if (!response.ok) throw new Error(data.message);

  if (response.ok && data?.sessionToken) {
    await SecureStore.setItemAsync('sessionToken', data.sessionToken);
    await SecureStore.setItemAsync('user', JSON.stringify(data?.user ?? {}));
  }

  return data;
}

export const getSessionToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('sessionToken');
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
};

export const getStoredUser = async () => {
  try {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

export async function signOutUser(): Promise<void> {
  await SecureStore.deleteItemAsync('sessionToken');
  await SecureStore.deleteItemAsync('user');
}

export const makeAuthenticatedRequest = async (endpoint: string, options: any = {}) => {
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    throw new Error('No session token available');
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${sessionToken}`,
      'X-AUTH-KEY': X_AUTH_KEY,
      'Content-Type': options.body ? 'application/json' : undefined,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

// export async function validateSession(): Promise<SessionValidationResponse> {
//   try {
//     const sessionToken = await getSessionToken();

//     if (!sessionToken) {
//       return { valid: false, message: 'No session token found' };
//     }

//     const response = await fetch(`${VALIDATE_SESSION_URL}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${sessionToken}`
//       }
//     });

//     const data: SessionValidationResponse = await response.json();

//     if (!response.ok) {
//       // If session is invalid, clear stored data
//       if (response.status === 401) {
//         await signOutUser();
//       }
//       return data;
//     }

//     // Update stored user data if validation was successful
//     if (data.valid && data.user) {
//       await SecureStore.setItemAsync('user', JSON.stringify(data.user));
//     }

//     return data;
//   } catch (error) {
//     console.error('Error validating session:', error);
//     return { valid: false, message: 'Network error during validation' };
//   }
// }

// export async function isUserAuthenticated(): Promise<boolean> {
//   const validation = await validateSession();
//   return validation.valid;
// }
