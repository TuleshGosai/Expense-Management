import { getUserProfile } from 'helpers/storageHandlers';

export const setCurrentUser = (user) => ({
  type: 'USER_SET_CURRENT',
  payload: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null,
});

export const clearCurrentUser = () => ({
  type: 'USER_CLEAR_CURRENT',
});

/**
 * Restore current user from localStorage into Redux (e.g. on app load / refresh).
 * Call after checking that the user is authenticated (e.g. token exists).
 */
export const initCurrentUserFromStorage = () => (dispatch) => {
  const profile = getUserProfile();
  if (profile && profile.id) {
    dispatch(setCurrentUser(profile));
  } else {
    dispatch(clearCurrentUser());
  }
};
