import axiosCall from 'configurations/redux/AxiosCall';
import { instance } from 'configurations/redux/AxiosCall';

const GET_USERS = 'GET_USERS';
const ADD_USER = 'ADD_USER';
const UPDATE_USER = 'UPDATE_USER';
const DELETE_USER = 'DELETE_USER';

export const getUsersAction = () => (dispatch) => {
  return dispatch(axiosCall('get', '/users', GET_USERS));
};

export const addUserAction = (payload) => (dispatch) => {
  return dispatch(axiosCall('post', '/users', ADD_USER, payload));
};

export const updateUserAction = (id, payload) => (dispatch) => {
  return dispatch(axiosCall('patch', '/users/' + id, UPDATE_USER, payload));
};

export const deleteUserAction = (id) => (dispatch) => {
  return instance
    .delete('/users/' + id)
    .then((response) => {
      dispatch({ type: DELETE_USER + '_SUCCESS', updatePayload: response.data, payload: { id } });
      return response.data;
    })
    .catch((err) => {
      const payload = err.response?.data || { message: err.message };
      dispatch({ type: DELETE_USER + '_ERROR', updatePayload: payload });
      return Promise.reject(payload);
    });
};
