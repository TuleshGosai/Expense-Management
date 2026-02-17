import { getUserProfile } from 'helpers/storageHandlers';

/**
 * Get current user from Redux state, with fallback to localStorage.
 * Use in components: useSelector(selectCurrentUser) or pass state to selectCurrentUser(state).
 */
export const selectCurrentUser = (state) => {
  const fromRedux = state?.User?.currentUser;
  if (fromRedux && fromRedux.id) return fromRedux;
  return getUserProfile();
};
