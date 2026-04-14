// This file manages starting the Google OAuth flow

export const initiateGoogleLogin = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  // Redirecting the window to the backend which performs the OAuth redirect
  window.location.href = `${API_URL}/auth/google`;
};
