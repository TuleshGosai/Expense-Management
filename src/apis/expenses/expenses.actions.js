import axiosCall from 'configurations/redux/AxiosCall';
import { instance } from 'configurations/redux/AxiosCall';

const GET_EXPENSES = 'GET_EXPENSES';
const ADD_EXPENSE = 'ADD_EXPENSE';
const UPDATE_EXPENSE = 'UPDATE_EXPENSE';
const DELETE_EXPENSE = 'DELETE_EXPENSE';
const GET_EXPENSE_DETAIL = 'GET_EXPENSE_DETAIL';

export const getExpensesAction = (userId) => (dispatch) => {
  return dispatch(axiosCall('get', '/expenses?userId=' + userId, GET_EXPENSES));
};

export const addExpenseAction = (payload) => (dispatch) => {
  return dispatch(axiosCall('post', '/expenses', ADD_EXPENSE, payload));
};

export const updateExpenseAction = (id, payload) => (dispatch) => {
  return dispatch(axiosCall('patch', '/expenses/' + id, UPDATE_EXPENSE, payload));
};

export const deleteExpenseAction = (id) => (dispatch) => {
  return instance.delete('/expenses/' + id)
    .then((response) => {
      dispatch({ type: DELETE_EXPENSE + '_SUCCESS', updatePayload: response.data, payload: { id } });
      return response.data;
    })
    .catch((err) => {
      const payload = err.response && err.response.data ? err.response.data : { message: err.message };
      const msg = typeof payload === 'string' ? payload : (payload && payload.message) || 'Failed to delete expense';
      dispatch({ type: DELETE_EXPENSE + '_ERROR', updatePayload: payload });
      return Promise.reject(msg);
    });
};

export const getExpenseByIdAction = (id) => (dispatch) => {
  return dispatch(axiosCall('get', '/expenses/' + id, GET_EXPENSE_DETAIL));
};
