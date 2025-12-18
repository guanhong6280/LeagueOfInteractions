import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5174';

export const getGoogleAuthUrl = ({ returnTo } = {}) => {
  const url = new URL(`${baseURL}/api/auth/google`);
  if (returnTo) url.searchParams.set('returnTo', returnTo);
  return url.toString();
};

// Optional helper for redirect-based OAuth flows
export const redirectToGoogleAuth = ({ returnTo } = {}) => {
  try {
    if (returnTo) {
      sessionStorage.setItem('postLoginRedirect', returnTo);
    }
  } catch {
    // ignore storage failures (private mode / blocked)
  }

  // assign() keeps the page in the same tab and is the standard redirect primitive
  window.location.assign(getGoogleAuthUrl({ returnTo }));
};

export const getCurrentUser = async () => {
  const { data } = await axios.get(`${baseURL}/api/auth/user`, {
    withCredentials: true,
  });
  return data;
};

export const logout = async () => {
  const response = await axios.get(`${baseURL}/api/auth/logout`, {
    withCredentials: true,
  });
  return response.data;
};


