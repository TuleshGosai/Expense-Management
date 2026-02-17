import axios from 'axios';
import { setAuthToken, setUserProfile, clearAuth } from 'helpers/storageHandlers';
import { apiEndPoint } from 'helpers/apiEndpoint';

const AUTH_LOGIN = 'AUTH_LOGIN';

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
      setAuthToken(token);
      setUserProfile({ ...profile, id: user.id });
      dispatch({ type: 'AUTH_LOGIN_SUCCESS', updatePayload: { token, user: { ...profile, id: user.id } } });
      return { token, user: { ...profile, id: user.id } };
    })
    .catch((err) => {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      dispatch({ type: 'AUTH_LOGIN_ERROR', updatePayload: { message: msg } });
      return Promise.reject({ message: msg });
    });
};

export const logoutAction = () => (dispatch) => {
  clearAuth();
  dispatch({ type: 'AUTH_LOGOUT_SUCCESS' });
};
