import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { EsCard, EsDescriptions, EsButton, EsModal, EsForm, EsInputBase, message } from 'components';
import { LockOutlined } from 'components/icons';
import { selectCurrentUser } from 'apis/user/user.selectors';
import { changePasswordAction } from 'apis/auth/auth.actions';
import './profile.scss';

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = EsForm.useForm();

  const handleChangePassword = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      dispatch(
        changePasswordAction({
          userId: user.id,
          email: user.email,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      )
        .then(() => {
          message.success('Password changed successfully.');
          setChangePasswordVisible(false);
          form.resetFields();
        })
        .catch((err) => {
          message.error(err?.message || 'Failed to change password.');
        })
        .finally(() => setLoading(false));
    });
  };

  const closeChangePasswordModal = () => {
    setChangePasswordVisible(false);
    form.resetFields();
  };

  if (!user) {
    return (
      <div className="profile-page">
        <EsCard><p style={{ color: '#999' }}>Loading profile…</p></EsCard>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">My Profile</h1>
      <EsCard title="User details" className="profile-card">
        <EsDescriptions column={1} bordered size="small">
          <EsDescriptions.Item label="Name">{user.name || '—'}</EsDescriptions.Item>
          <EsDescriptions.Item label="Email">{user.email || '—'}</EsDescriptions.Item>
          <EsDescriptions.Item label="Role">
            <span className="profile-role-badge">{user.role || 'user'}</span>
          </EsDescriptions.Item>
        </EsDescriptions>
        <div className="profile-actions">
          <EsButton type="primary" icon={<LockOutlined />} onClick={() => setChangePasswordVisible(true)}>
            Change password
          </EsButton>
        </div>
      </EsCard>
      <EsModal
        title="Change password"
        visible={changePasswordVisible}
        onCancel={closeChangePasswordModal}
        onOk={handleChangePassword}
        confirmLoading={loading}
        destroyOnClose
        okText="Update password"
      >
        <EsForm form={form} layout="vertical" style={{ marginTop: 16 }}>
          <EsForm.Item
            name="currentPassword"
            label="Current password"
            rules={[{ required: true, message: 'Enter your current password' }]}
          >
            <EsInputBase.Password placeholder="Current password" autoComplete="current-password" />
          </EsForm.Item>
          <EsForm.Item
            name="newPassword"
            label="New password"
            rules={[{ required: true, message: 'Enter new password' }]}
          >
            <EsInputBase.Password placeholder="New password" autoComplete="new-password" />
          </EsForm.Item>
          <EsForm.Item
            name="confirmPassword"
            label="Confirm new password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <EsInputBase.Password placeholder="Confirm new password" autoComplete="new-password" />
          </EsForm.Item>
        </EsForm>
      </EsModal>
    </div>
  );
};

ProfilePage.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
};

export default ProfilePage;
