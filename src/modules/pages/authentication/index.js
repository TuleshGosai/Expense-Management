import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { EsForm, EsInputBase, EsButton, EsCard, EsModal, message } from 'components';
import { UserOutlined, LockOutlined, MailOutlined } from 'components/icons';
import { loginAction, registerAction } from 'apis/auth/auth.actions';
import { getAuthToken } from 'helpers/storageHandlers';
import { SplashScreen, SPLASH_DURATION_MS } from 'App';
import './auth.scss';

const MODE_LOGIN = 'login';
const MODE_REGISTER = 'register';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'tuleshgosai@expense.com';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(MODE_LOGIN);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSplashAfterLogin, setShowSplashAfterLogin] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const error = useSelector((state) => state.Auth?.SignInResponse?.message);

  const onLoginFinish = (values) => {
    setLoading(true);
    dispatch(loginAction({ email: values.email, password: values.password }))
      .then(() => {
        message.success('Login successful');
        setShowSplashAfterLogin(true);
      })
      .catch(() => {
        message.error(typeof error === 'string' ? error : (error && error.message) || 'Invalid credentials');
      })
      .finally(() => setLoading(false));
  };

  const onRegisterFinish = (values) => {
    setLoading(true);
    dispatch(registerAction({ name: values.name, email: values.email, password: values.password }))
      .then(() => {
        message.success('Account created. You can sign in now.');
        setMode(MODE_LOGIN);
      })
      .catch((err) => {
        const msg =
          err?.message ||
          err?.response?.data?.message ||
          err?.updatePayload?.message ||
          'Registration failed';
        message.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!showSplashAfterLogin) return;
    const timer = setTimeout(() => {
      setShowSplashAfterLogin(false);
      history.push('/app');
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showSplashAfterLogin, history]);

  if (showSplashAfterLogin) {
    return <SplashScreen />;
  }

  if (getAuthToken()) {
    return <Redirect to="/app" />;
  }

  const cardTitle = mode === MODE_LOGIN ? 'Expense Management' : 'Create account';

  return (
    <div className="auth-page">
      <EsCard className="auth-card" title={cardTitle} bordered={false}>
        {mode === MODE_LOGIN && (
          <p className="auth-hint">Use tuleshgosai@expense.com / Admin@123 to sign in</p>
        )}
        {mode === MODE_LOGIN && (
          <EsForm name="login" onFinish={onLoginFinish} layout="vertical" size="large">
            <EsForm.Item
              name="email"
              rules={[{ required: true, message: 'Enter your email' }, { type: 'email' }]}
            >
              <EsInputBase prefix={<UserOutlined />} placeholder="Email" />
            </EsForm.Item>
            <EsForm.Item
              name="password"
              rules={[{ required: true, message: 'Enter your password' }]}
            >
              <EsInputBase.Password prefix={<LockOutlined />} placeholder="Password" />
            </EsForm.Item>
            <EsForm.Item>
              <EsButton type="primary" htmlType="submit" block loading={loading}>
                Sign In
              </EsButton>
            </EsForm.Item>
            <div className="auth-links">
              <button type="button" className="auth-link" onClick={() => setShowForgotModal(true)}>
                Forgot password?
              </button>
              <button type="button" className="auth-link" onClick={() => setMode(MODE_REGISTER)}>
                Create account
              </button>
            </div>
          </EsForm>
        )}
        <EsModal
          title="Forgot password?"
          visible={showForgotModal}
          onCancel={() => setShowForgotModal(false)}
          footer={[
            <EsButton key="close" type="primary" onClick={() => setShowForgotModal(false)}>
              OK
            </EsButton>,
          ]}
        >
          <p>Contact your administration for password reset.</p>
          <p className="auth-forgot-email">
            <strong>Email:</strong>{' '}
            <a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a>
          </p>
        </EsModal>
        {mode === MODE_REGISTER && (
          <EsForm
            name="register"
            onFinish={onRegisterFinish}
            layout="vertical"
            size="large"
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
          >
            <EsForm.Item
              name="name"
              rules={[{ required: true, message: 'Enter your name' }]}
            >
              <EsInputBase prefix={<UserOutlined />} placeholder="Full name" />
            </EsForm.Item>
            <EsForm.Item
              name="email"
              rules={[{ required: true, message: 'Enter your email' }, { type: 'email' }]}
            >
              <EsInputBase prefix={<MailOutlined />} placeholder="Email" />
            </EsForm.Item>
            <EsForm.Item
              name="password"
              rules={[{ required: true, message: 'Enter a password' }]}
            >
              <EsInputBase.Password prefix={<LockOutlined />} placeholder="Password" />
            </EsForm.Item>
            <EsForm.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <EsInputBase.Password prefix={<LockOutlined />} placeholder="Confirm password" />
            </EsForm.Item>
            <EsForm.Item>
              <EsButton type="primary" htmlType="submit" block loading={loading}>
                Register
              </EsButton>
            </EsForm.Item>
            <div className="auth-links">
              <button type="button" className="auth-link" onClick={() => setMode(MODE_LOGIN)}>
                Back to Sign In
              </button>
            </div>
          </EsForm>
        )}
      </EsCard>
    </div>
  );
};

Login.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
};

export default Login;
