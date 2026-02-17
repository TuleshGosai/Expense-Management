import axiosCall from 'configurations/redux/AxiosCall';
import { instance } from 'configurations/redux/AxiosCall';
import { getExpensesAction } from 'apis/expenses/expenses.actions';

const GET_GROUPS = 'GET_GROUPS';
const ADD_GROUP = 'ADD_GROUP';
const UPDATE_GROUP = 'UPDATE_GROUP';
const DELETE_GROUP = 'DELETE_GROUP';

export const getGroupsAction = (userId) => (dispatch) => {
  return dispatch(axiosCall('get', `/groups?userId=${userId}`, GET_GROUPS));
};

export const addGroupAction = (payload) => (dispatch) => {
  return dispatch(axiosCall('post', '/groups', ADD_GROUP, payload));
};

export const updateGroupAction = (id, payload) => (dispatch) => {
  return dispatch(axiosCall('patch', `/groups/${id}`, UPDATE_GROUP, payload));
};

export const deleteGroupAction = (id, userId) => (dispatch) => {
  const deleteExpensesInGroup = () =>
    instance.get(`/expenses?userId=${userId}`).then((res) => {
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const withGroup = list.filter((e) => String(e.groupId) === String(id));
      return Promise.all(withGroup.map((e) => instance.delete(`/expenses/${e.id}`)));
    });

  return deleteExpensesInGroup()
    .then(() => instance.delete(`/groups/${id}`))
    .then(() => {
      dispatch({ type: `${DELETE_GROUP}_SUCCESS`, updatePayload: {}, payload: { id } });
      if (userId) return dispatch(getExpensesAction(userId));
    })
    .catch((err) => {
      const payload = err.response?.data || { message: err.message };
      const msg = typeof payload === 'string' ? payload : payload?.message || 'Failed to delete group';
      dispatch({ type: `${DELETE_GROUP}_ERROR`, updatePayload: payload });
      return Promise.reject(msg);
    });
};
