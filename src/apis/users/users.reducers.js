const initialState = {
  list: [],
  loading: false,
};

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case 'GET_USERS_SUCCESS': {
      const list = Array.isArray(action.updatePayload) ? action.updatePayload : (action.updatePayload?.data || []);
      return { ...state, list: Array.isArray(list) ? list : [], loading: false };
    }
    case 'GET_USERS_ERROR':
      return { ...state, loading: false };
    case 'ADD_USER_SUCCESS': {
      const newUser = action.updatePayload?.id ? action.updatePayload : action.updatePayload?.data;
      return { ...state, list: newUser ? [...state.list, newUser] : state.list };
    }
    case 'UPDATE_USER_SUCCESS': {
      const updated = action.updatePayload?.id ? action.updatePayload : action.updatePayload?.data;
      if (!updated) return state;
      return {
        ...state,
        list: state.list.map((u) => (String(u.id) === String(updated.id) ? { ...u, ...updated } : u)),
      };
    }
    case 'DELETE_USER_SUCCESS': {
      const id = action.payload?.id ?? action.updatePayload?.id;
      if (id == null || id === '') return state;
      return { ...state, list: state.list.filter((u) => String(u.id) !== String(id)) };
    }
    default:
      return state;
  }
}
