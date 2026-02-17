import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import AppRouter from './appRouter';
import { store } from 'configurations/redux/Store';
import { initCurrentUserFromStorage } from 'apis/user/user.actions';
import { getAuthToken } from 'helpers/storageHandlers';
import { EsSpin } from 'components';

export const SPLASH_DURATION_MS = 2200;

export function SplashScreen() {
  return (
    <div className="app-splash">
      <div className="app-splash-content">
        <h1 className="app-splash-title">Expense Management</h1>
        <p className="app-splash-subtitle">Split expenses, settle up easily</p>
        <EsSpin size="large" className="app-splash-spinner" />
      </div>
    </div>
  );
}
SplashScreen.propTypes = {};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (getAuthToken()) store.dispatch(initCurrentUserFromStorage());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="globalHeight">
      <Provider store={store}>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <div className="app-main-fade">
            <AppRouter />
          </div>
        )}
      </Provider>
    </div>
  );
}
App.propTypes = {};

export default App;
