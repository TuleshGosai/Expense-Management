const initialState = {
  list: [],
  loading: false,
};

export default function groupsReducer(state = initialState, action) {
  switch (action.type) {
    case 'GET_GROUPS_SUCCESS': {
      const list = Array.isArray(action.updatePayload) ? action.updatePayload : (action.updatePayload?.data || []);
      return { ...state, list: Array.isArray(list) ? list : [], loading: false };
    }
    case 'GET_GROUPS_ERROR':
      return { ...state, loading: false };
    case 'ADD_GROUP_SUCCESS': {
      const newGrp = action.updatePayload?.id ? action.updatePayload : action.updatePayload?.data;
      return { ...state, list: newGrp ? [...state.list, newGrp] : state.list };
    }
    case 'UPDATE_GROUP_SUCCESS': {
      const updated = action.updatePayload?.id ? action.updatePayload : action.updatePayload?.data;
      if (!updated) return state;
      return { ...state, list: state.list.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)) };
    }
    case 'DELETE_GROUP_SUCCESS': {
      const id = action.payload?.id ?? action.updatePayload?.id;
      if (!id) return state;
      return { ...state, list: state.list.filter((g) => String(g.id) !== String(id)) };
    }
    default:
      return state;
  }
}
