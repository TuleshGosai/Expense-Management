import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginAction } from 'apis/auth/auth.actions';
import { getAuthToken } from 'helpers/storageHandlers';
import './auth.scss';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const error = useSelector((state) => state.Auth?.SignInResponse?.message);

  const onFinish = (values) => {
    setLoading(true);
    dispatch(loginAction({ email: values.email, password: values.password }))
      .then(() => {
        message.success('Login successful');
      })
      .catch(() => {
        message.error(typeof error === 'string' ? error : (error && error.message) || 'Invalid credentials');
      })
      .finally(() => setLoading(false));
  };

  if (getAuthToken()) {
    return <Redirect to="/app" />;
  }

  return (
    <div className="auth-page">
      <Card className="auth-card" title="Expense Management" bordered={false}>
        <p className="auth-hint">Use demo@expense.com / demo123 to sign in</p>
        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Enter your email' }, { type: 'email' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
