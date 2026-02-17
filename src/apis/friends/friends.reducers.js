const initialState = { list: [], loading: false };

export default function friendsReducer(state = initialState, action) {
  switch (action.type) {
    case 'GET_FRIENDS_SUCCESS':
      return {
        ...state,
        list: Array.isArray(action.updatePayload) ? action.updatePayload : (action.updatePayload?.data || []),
        loading: false,
      };
    case 'GET_FRIENDS_ERROR':
      return { ...state, loading: false };
    case 'ADD_FRIEND_SUCCESS': {
      const newFriend = action.updatePayload?.id ? action.updatePayload : action.updatePayload?.data;
      return { ...state, list: newFriend ? [...state.list, newFriend] : state.list };
    }
    case 'UPDATE_FRIEND_SUCCESS': {
      const updated = action.updatePayload?.id ? action.updatePayload : action.updatePayload?.data;
      if (!updated) return state;
      return { ...state, list: state.list.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)) };
    }
    case 'DELETE_FRIEND_SUCCESS': {
      const id = action.payload?.id ?? action.updatePayload?.id;
      if (!id) return state;
      return { ...state, list: state.list.filter((f) => String(f.id) !== String(id)) };
    }
    default:
      return state;
  }
}
