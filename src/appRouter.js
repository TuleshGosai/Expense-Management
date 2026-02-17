import React, { Suspense } from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import { getAuthToken } from 'helpers/storageHandlers';
import Authentication from 'modules/pages/authentication';
import MainLayout from 'modules/containers/MainLayout';
import { Spin } from 'antd';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = getAuthToken();
  return (
    <Route
      {...rest}
      render={(props) =>
        token ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const AppRouter = () => (
  <HashRouter>
    <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '40px auto' }} />}>
      <Switch>
        <Route exact path="/login" component={Authentication} />
        <PrivateRoute path="/app" component={MainLayout} />
        <Route exact path="/">
          <Redirect to={getAuthToken() ? '/app' : '/login'} />
        </Route>
        <Redirect to={getAuthToken() ? '/app' : '/login'} />
      </Switch>
    </Suspense>
  </HashRouter>
);

export default AppRouter;
