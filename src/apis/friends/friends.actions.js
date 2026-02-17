import axiosCall from 'configurations/redux/AxiosCall';
import { instance } from 'configurations/redux/AxiosCall';
import { getGroupsAction } from 'apis/groups/groups.actions';
import { getExpensesAction } from 'apis/expenses/expenses.actions';

const GET_FRIENDS = 'GET_FRIENDS';
const ADD_FRIEND = 'ADD_FRIEND';
const UPDATE_FRIEND = 'UPDATE_FRIEND';
const DELETE_FRIEND = 'DELETE_FRIEND';

export const getFriendsAction = (userId) => (dispatch) => {
  return dispatch(axiosCall('get', '/friends?userId=' + userId, GET_FRIENDS));
};

export const addFriendAction = (payload) => (dispatch) => {
  return dispatch(axiosCall('post', '/friends', ADD_FRIEND, payload));
};

export const updateFriendAction = (id, payload) => (dispatch) => {
  return dispatch(axiosCall('patch', '/friends/' + id, UPDATE_FRIEND, payload));
};

export const deleteFriendAction = (id, userId) => (dispatch) => {
  const removeFromGroups = () =>
    instance.get('/groups?userId=' + userId).then((res) => {
      const list = Array.isArray(res.data) ? res.data : (res.data && res.data.data) || [];
      const withFriend = list.filter((g) => (g.memberIds || []).includes(id));
      return Promise.all(
        withFriend.map((g) =>
          instance.patch('/groups/' + g.id, { ...g, memberIds: (g.memberIds || []).filter((m) => m !== id) })
        )
      );
    });

  const removeFromExpenses = () =>
    instance.get('/expenses?userId=' + userId).then((res) => {
      const list = Array.isArray(res.data) ? res.data : (res.data && res.data.data) || [];
      const affected = list.filter(
        (e) => e.paidBy === id || (e.contributions || []).some((c) => String(c.friendId) === String(id))
      );
      return Promise.all(
        affected.map((e) => {
          const contributions = (e.contributions || []).filter((c) => String(c.friendId) !== String(id));
          const paidBy = e.paidBy === id ? userId : e.paidBy;
          return instance.patch('/expenses/' + e.id, { ...e, contributions, paidBy });
        })
      );
    });

  return removeFromGroups()
    .then(() => removeFromExpenses())
    .then(() => instance.delete('/friends/' + id))
    .then(() => {
      dispatch({ type: DELETE_FRIEND + '_SUCCESS', updatePayload: {}, payload: { id } });
      if (userId) {
        dispatch(getGroupsAction(userId));
        return dispatch(getExpensesAction(userId));
      }
    })
    .catch((err) => {
      const payload = err.response && err.response.data ? err.response.data : { message: err.message };
      const msg = typeof payload === 'string' ? payload : (payload && payload.message) || 'Failed to remove friend';
      dispatch({ type: DELETE_FRIEND + '_ERROR', updatePayload: payload });
      return Promise.reject(msg);
    });
};
