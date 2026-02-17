const AUTH_TOKEN_KEY = 'EXPENSE_AUTH_TOKEN';
const USER_PROFILE_KEY = 'EXPENSE_USER_PROFILE';

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const setAuthToken = (token) => localStorage.setItem(AUTH_TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);

export const getUserProfile = () => {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};
export const setUserProfile = (profile) => localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
export const removeUserProfile = () => localStorage.removeItem(USER_PROFILE_KEY);

export const clearAuth = () => {
  removeAuthToken();
  removeUserProfile();
};

const DELETED_FRIEND_NAMES_KEY = 'EXPENSE_DELETED_FRIEND_NAMES';

export const getDeletedFriendNames = () => {
  try {
    const data = localStorage.getItem(DELETED_FRIEND_NAMES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const setDeletedFriendName = (friendId, name) => {
  const map = getDeletedFriendNames();
  if (friendId != null && name != null) map[String(friendId)] = String(name);
  localStorage.setItem(DELETED_FRIEND_NAMES_KEY, JSON.stringify(map));
};
