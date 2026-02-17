import axios from 'axios';
import { apiEndPoint } from 'helpers/apiEndpoint';

export const instance = axios.create({
  baseURL: apiEndPoint || '/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export default function axiosCall(method, url, responseType, data) {
  return (dispatch) => {
    const config = data ? { method, url, data } : { method, url };
    return instance(config)
      .then((response) => {
        dispatch({ type: `${responseType}_SUCCESS`, updatePayload: response.data, payload: data });
        return response.data;
      })
      .catch((err) => {
        const payload = err.response?.data || { message: err.message };
        dispatch({ type: `${responseType}_ERROR`, updatePayload: payload });
        return Promise.reject(payload);
      });
  };
}
