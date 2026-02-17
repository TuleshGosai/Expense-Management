const initialState = {
  SignInResponse: null,
  isAuthenticated: false,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        SignInResponse: action.updatePayload,
        isAuthenticated: !!action.updatePayload?.token,
      };
    case 'AUTH_LOGIN_ERROR':
      return { ...state, SignInResponse: action.updatePayload, isAuthenticated: false };
    case 'AUTH_LOGOUT_SUCCESS':
      return { ...state, SignInResponse: null, isAuthenticated: false };
    default:
      return state;
  }
}
