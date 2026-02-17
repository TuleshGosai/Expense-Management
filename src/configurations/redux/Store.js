import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducers from './RootReducer';

const middlewares = [thunk];
const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
  : compose;

const rootReducer = combineReducers({ ...reducers });
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(...middlewares)));

export { store, middlewares, rootReducer };
