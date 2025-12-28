import api from './apiClient';

export const getGoogleAuthUrl = ({ returnTo } = {}) => {
  const url = new URL(`${api.defaults.baseURL}/api/auth/google`);
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
  const { data } = await api.get(`/api/auth/user`, {
    withCredentials: true,
  });
  return data;
};

export const logout = async () => {
  const response = await api.get(`/api/auth/logout`, {
    withCredentials: true,
  });
  return response.data;
};


