import axios from 'axios';
import { setAuthToken, setUserProfile, clearAuth } from 'helpers/storageHandlers';
import { apiEndPoint } from 'helpers/apiEndpoint';
import { setCurrentUser, clearCurrentUser } from 'apis/user/user.actions';

// Mock login: GET /users?email=... then validate password client-side
export const loginAction = (payload) => (dispatch) => {
  const base = apiEndPoint || '/';
  return axios.get(`${base}/users?email=${encodeURIComponent(payload.email)}`)
    .then((res) => {
      const users = res.data && (Array.isArray(res.data) ? res.data : res.data.data);
      const user = Array.isArray(users) && users.length ? users.find((u) => u.email === payload.email) : null;
      if (!user || user.password !== payload.password) {
        dispatch({ type: 'AUTH_LOGIN_ERROR', updatePayload: { message: 'Invalid email or password' } });
        return Promise.reject({ message: 'Invalid email or password' });
      }
      const { password: _, ...profile } = user;
      const token = `mock-jwt-${user.id}`;
      const userProfile = { ...profile, id: user.id };
      setAuthToken(token);
      setUserProfile(userProfile);
      dispatch(setCurrentUser(userProfile));
      dispatch({ type: 'AUTH_LOGIN_SUCCESS', updatePayload: { token, user: userProfile } });
      return { token, user: userProfile };
    })
    .catch((err) => {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      dispatch({ type: 'AUTH_LOGIN_ERROR', updatePayload: { message: msg } });
      return Promise.reject({ message: msg });
    });
};

export const logoutAction = () => (dispatch) => {
  clearAuth();
  dispatch(clearCurrentUser());
  dispatch({ type: 'AUTH_LOGOUT_SUCCESS' });
};

// Verify current password (for change password flow). Does not log in.
export const verifyPasswordAction = (payload) => () => {
  const base = apiEndPoint || '/';
  return axios.get(`${base}/users?email=${encodeURIComponent(payload.email)}`).then((res) => {
    const users = res.data && (Array.isArray(res.data) ? res.data : res.data.data);
    const user = Array.isArray(users) && users.length ? users.find((u) => u.email === payload.email) : null;
    if (!user || user.password !== payload.password) {
      return Promise.reject({ message: 'Current password is incorrect' });
    }
    return { ok: true };
  });
};

// Change password for logged-in user: verify current then PATCH
export const changePasswordAction = (payload) => (dispatch) => {
  const base = apiEndPoint || '/';
  return dispatch(verifyPasswordAction({ email: payload.email, password: payload.currentPassword }))
    .then(() => axios.patch(`${base}/users/${payload.userId}`, { password: payload.newPassword }))
    .then((res) => res.data);
};

// Register: POST new user then resolve (caller can switch to login or auto-login)
export const registerAction = (payload) => () => {
  const base = apiEndPoint || '/';
  const body = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || 'user',
  };
  return axios.post(`${base}/users`, body).then((res) => res.data);
};

