const initialState = {
  currentUser: null,
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case 'USER_SET_CURRENT':
      return {
        ...state,
        currentUser: action.payload || null,
      };
    case 'USER_CLEAR_CURRENT':
      return {
        ...state,
        currentUser: null,
      };
    default:
      return state;
  }
}
