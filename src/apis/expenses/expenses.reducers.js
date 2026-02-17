const initialState = {
  list: [],
  detail: null,
  loading: false,
};

export default function expensesReducer(state = initialState, action) {
  switch (action.type) {
    case 'GET_EXPENSES_SUCCESS': {
      const list = Array.isArray(action.updatePayload) ? action.updatePayload : (action.updatePayload?.data || []);
      return { ...state, list: Array.isArray(list) ? list : [], loading: false };
    }
    case 'GET_EXPENSES_ERROR':
      return { ...state, loading: false };
    case 'ADD_EXPENSE_SUCCESS': {
      const newExp = action.updatePayload?.id ? action.updatePayload : action.updatePayload?.data;
      return { ...state, list: newExp ? [newExp, ...state.list] : state.list };
    }
    case 'GET_EXPENSE_DETAIL_SUCCESS':
      return { ...state, detail: action.updatePayload?.id ? action.updatePayload : action.updatePayload };
    case 'GET_EXPENSE_DETAIL_ERROR':
      return { ...state, detail: null };
    case 'UPDATE_EXPENSE_SUCCESS': {
      const updated = action.updatePayload?.id ? action.updatePayload : action.updatePayload?.data;
      if (!updated) return state;
      return {
        ...state,
        list: state.list.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)),
        detail: state.detail?.id === updated.id ? { ...state.detail, ...updated } : state.detail,
      };
    }
    case 'DELETE_EXPENSE_SUCCESS': {
      const id = action.payload?.id ?? action.updatePayload?.id;
      if (id == null || id === '') return state;
      return {
        ...state,
        list: state.list.filter((e) => String(e.id) !== String(id)),
        detail: state.detail && String(state.detail.id) === String(id) ? null : state.detail,
      };
    }
    default:
      return state;
  }
}
