import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, List, Modal, Form, Input, Button, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from 'helpers/storageHandlers';
import { getDisplayName } from 'helpers/displayUtils';
import { getGroupsAction, addGroupAction, updateGroupAction, deleteGroupAction } from 'apis/groups/groups.actions';
import { getFriendsAction } from 'apis/friends/friends.actions';
import { getExpensesAction } from 'apis/expenses/expenses.actions';
import { computeBalancesFromExpenses } from 'helpers/balanceUtils';
import './groups.scss';

const GroupsPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const user = getUserProfile();
  const groups = useSelector((state) => state.Groups?.list || []);
  const friends = useSelector((state) => state.Friends?.list || []);
  const expenses = useSelector((state) => state.Expenses?.list || []);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      dispatch(getGroupsAction(user.id));
      dispatch(getFriendsAction(user.id));
      dispatch(getExpensesAction(user.id));
    }
  }, [user?.id, dispatch]);

  const openCreateModal = () => {
    setEditingGroup(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (g) => {
    setEditingGroup(g);
    form.setFieldsValue({ name: g.name, members: g.memberIds || [] });
    setModalVisible(true);
  };

  const handleAddGroup = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      const payload = { name: values.name, userId: user.id, memberIds: values.members || [] };
      const action = editingGroup
        ? dispatch(updateGroupAction(editingGroup.id, { name: payload.name, memberIds: payload.memberIds }))
        : dispatch(addGroupAction(payload));
      action
        .then(() => {
          message.success(editingGroup ? 'Group updated' : 'Group created');
          setModalVisible(false);
          setEditingGroup(null);
          form.resetFields();
        })
        .catch(() => message.error(editingGroup ? 'Failed to update group' : 'Failed to create group'))
        .finally(() => setLoading(false));
    });
  };

  const handleDeleteGroup = (id) => {
    dispatch(deleteGroupAction(id, user?.id))
      .then(() => message.success('Group and its expenses deleted'))
      .catch((err) => message.error(typeof err === 'string' ? err : 'Failed to delete group'));
  };

  const friendOptions = friends.map((f) => ({ label: f.name, value: f.id }));
  const getFriendName = (id) => getDisplayName(id, friends, user?.id);

  return (
    <div className="groups-page">
      <div className="page-header">
        <h1 className="page-title">Groups</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>Create Group</Button>
      </div>
      <Card>
        <p style={{ marginBottom: 16, color: '#666', fontSize: 13 }}>
          Track expenses and balances per group. Create a group, add friends as members. When adding an expense, choose a group to track per-group balances.
        </p>
        {groups.length === 0 ? (
          <p style={{ color: '#999' }}>No groups yet. Create a group and add friends as members.</p>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={groups}
            renderItem={(g) => {
              const groupExpenses = expenses.filter((e) => String(e.groupId) === String(g.id));
              const { youOwe, theyOweYou } = computeBalancesFromExpenses(groupExpenses, user?.id);
              const youOweList = Object.entries(youOwe).filter(([, amt]) => amt > 0);
              const theyOweYouList = Object.entries(theyOweYou).filter(([, amt]) => amt > 0);
              return (
                <List.Item
                  key={g.id}
                  actions={[
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(g)}>Edit</Button>,
                    <Popconfirm key="del" title="Delete this group? All expenses in this group will be deleted." onConfirm={() => handleDeleteGroup(g.id)} okText="Delete" okButtonProps={{ danger: true }}>
                      <Button type="link" size="small" danger icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta title={g.name} description={Array.isArray(g.memberIds) ? g.memberIds.length + ' member(s)' : '0 members'} />
                  <div className="group-detail">
                    <h4 style={{ marginTop: 12, marginBottom: 8 }}>Expenses in this group ({groupExpenses.length})</h4>
                    {groupExpenses.length === 0 ? (
                      <p style={{ color: '#999', fontSize: 13 }}>No expenses yet.</p>
                    ) : (
                      <List
                        size="small"
                        dataSource={groupExpenses.slice(0, 10)}
                        renderItem={(item) => (
                          <List.Item style={{ cursor: 'pointer' }} onClick={() => history.push('/app/expenses/' + item.id)}>
                            {item.description} — ${Number(item.amount).toFixed(2)}
                          </List.Item>
                        )}
                      />
                    )}
                    {(youOweList.length > 0 || theyOweYouList.length > 0) && (
                      <>
                        <h4 style={{ marginTop: 16, marginBottom: 8 }}>Balances in this group</h4>
                        {youOweList.length > 0 && (
                          <p style={{ marginBottom: 4, fontSize: 13 }}>You owe: {youOweList.map(([id, amt]) => getFriendName(id) + ' $' + Number(amt).toFixed(2)).join(', ')}</p>
                        )}
                        {theyOweYouList.length > 0 && (
                          <p style={{ marginBottom: 0, fontSize: 13 }}>You are owed: {theyOweYouList.map(([id, amt]) => getFriendName(id) + ' $' + Number(amt).toFixed(2)).join(', ')}</p>
                        )}
                      </>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Card>
      <Modal title={editingGroup ? 'Edit Group' : 'Create Group'} visible={modalVisible} onCancel={() => { setModalVisible(false); setEditingGroup(null); }} onOk={handleAddGroup} confirmLoading={loading} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Group name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Weekend Trip" />
          </Form.Item>
          <Form.Item name="members" label="Add friends">
            <Select mode="multiple" placeholder="Select friends" options={friendOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupsPage;
