import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { EsCard, EsList, EsModal, EsForm, EsInputBase, EsButton, EsSelect, message, EsPopconfirm } from 'components';
import { UserAddOutlined, EditOutlined, DeleteOutlined } from 'components/icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from 'apis/user/user.selectors';
import { getUsersAction, addUserAction, updateUserAction, deleteUserAction } from 'apis/users/users.actions';
import './users.scss';

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

const UsersPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const users = useSelector((state) => state.Users?.list || []);
  const [form] = EsForm.useForm();

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) dispatch(getUsersAction());
  }, [isAdmin, dispatch]);

  if (!isAdmin) {
    return <Redirect to="/app" />;
  }

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    });
    setModalVisible(true);
  };

  const isEditingSelf = editingUser && String(editingUser.id) === String(currentUser?.id);

  const handleSaveUser = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      const payload = {
        name: values.name,
        email: values.email,
        role: isEditingSelf ? (editingUser?.role || 'admin') : (values.role || 'user'),
      };
      if (!editingUser) {
        payload.password = values.password;
      } else if (values.password && values.password.trim()) {
        payload.password = values.password;
      }
      const action = editingUser
        ? dispatch(updateUserAction(editingUser.id, payload))
        : dispatch(addUserAction(payload));
      action
        .then(() => {
          message.success(editingUser ? 'User updated' : 'User created');
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
          dispatch(getUsersAction());
        })
        .catch((err) => {
          const msg = err?.message || (editingUser ? 'Failed to update user' : 'Failed to create user');
          message.error(msg);
        })
        .finally(() => setLoading(false));
    });
  };

  const handleDeleteUser = (user) => {
    const id = user?.id;
    if (!id) return;
    if (String(id) === String(currentUser?.id)) {
      message.warning('You cannot delete your own account from here.');
      return;
    }
    dispatch(deleteUserAction(id))
      .then(() => {
        message.success('User deleted');
        dispatch(getUsersAction());
      })
      .catch((err) => message.error(err?.message || 'Failed to delete user'));
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <EsButton type="primary" icon={<UserAddOutlined />} onClick={openCreateModal}>
          Add User
        </EsButton>
      </div>
      <EsCard>
        <EsList
          itemLayout="horizontal"
          dataSource={users}
          renderItem={(user) => (
            <EsList.Item
              actions={[
                <EsButton
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(user)}
                >
                  Edit
                </EsButton>,
                String(user.id) === String(currentUser?.id) ? (
                  <EsButton type="link" size="small" danger disabled>
                    Delete (current user)
                  </EsButton>
                ) : (
                  <EsPopconfirm
                    key="del"
                    title="Delete this user? This cannot be undone."
                    onConfirm={() => handleDeleteUser(user)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <EsButton type="link" size="small" danger icon={<DeleteOutlined />}>
                      Delete
                    </EsButton>
                  </EsPopconfirm>
                ),
              ]}
            >
              <EsList.Item.Meta
                title={user.name}
                description={
                  <>
                    {user.email}
                    {user.role && (
                      <span className="user-role-badge" style={{ marginLeft: 8 }}>
                        {user.role}
                      </span>
                    )}
                  </>
                }
              />
            </EsList.Item>
          )}
        />
        {users.length === 0 && <p style={{ color: '#999', padding: 16 }}>No users yet.</p>}
      </EsCard>
      <EsModal
        title={editingUser ? 'Edit User' : 'Add User'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        onOk={handleSaveUser}
        confirmLoading={loading}
        destroyOnClose
      >
        <EsForm form={form} layout="vertical">
          <EsForm.Item name="name" label="Name" rules={[{ required: true, message: 'Enter name' }]}>
            <EsInputBase placeholder="Full name" />
          </EsForm.Item>
          <EsForm.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Enter email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <EsInputBase placeholder="Email" disabled={!!editingUser} />
          </EsForm.Item>
          <EsForm.Item
            name="password"
            label={editingUser ? 'New password (leave blank to keep current)' : 'Password'}
            rules={editingUser ? [] : [{ required: true, message: 'Enter password' }]}
          >
            <EsInputBase.Password placeholder={editingUser ? 'Optional' : 'Password'} autoComplete="new-password" />
          </EsForm.Item>
          <EsForm.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
            initialValue="user"
            extra={isEditingSelf ? 'You cannot change your own role.' : null}
          >
            <EsSelect options={ROLE_OPTIONS} placeholder="Select role" disabled={isEditingSelf} />
          </EsForm.Item>
        </EsForm>
      </EsModal>
    </div>
  );
};

UsersPage.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
};

export default UsersPage;
