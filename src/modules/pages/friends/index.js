import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EsCard, EsList, EsModal, EsForm, EsInputBase, EsButton, message, EsPopconfirm, EsTooltip } from 'components';
import { UserAddOutlined, EditOutlined, DeleteOutlined } from 'components/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile, setDeletedFriendName } from 'helpers/storageHandlers';
import { computeBalancesFromExpenses, simplifyBalances } from 'helpers/balanceUtils';
import { getDisplayName } from 'helpers/displayUtils';
import { getFriendsAction, addFriendAction, updateFriendAction, deleteFriendAction } from 'apis/friends/friends.actions';
import { getExpensesAction } from 'apis/expenses/expenses.actions';
import './friends.scss';

const FriendsList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFriend, setEditingFriend] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const user = getUserProfile();
  const friends = useSelector((state) => state.Friends?.list || []);
  const expenses = useSelector((state) => state.Expenses?.list || []);
  const { youOwe, theyOweYou } = computeBalancesFromExpenses(expenses, user?.id);
  const [form] = EsForm.useForm();

  useEffect(() => {
    if (user?.id) {
      dispatch(getFriendsAction(user.id));
      dispatch(getExpensesAction(user.id));
    }
  }, [user?.id, dispatch]);

  const getBalance = (friendId) => {
    const owe = youOwe[friendId] || 0;
    const owed = theyOweYou[friendId] || 0;
    return { owe, owed, net: owed - owe };
  };

  const hasPendingBalance = (friendId) => {
    const { owe, owed } = getBalance(friendId);
    return owe > 0 || owed > 0;
  };

  const openCreateModal = () => {
    setEditingFriend(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (friend) => {
    setEditingFriend(friend);
    form.setFieldsValue({ name: friend.name, email: friend.email });
    setModalVisible(true);
  };

  const handleSaveFriend = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      const action = editingFriend
        ? dispatch(updateFriendAction(editingFriend.id, { name: values.name, email: values.email }))
        : dispatch(addFriendAction({ ...values, userId: user.id }));
      action
        .then(() => {
          message.success(editingFriend ? 'Friend updated' : 'Friend added');
          setModalVisible(false);
          setEditingFriend(null);
          form.resetFields();
        })
        .catch(() => message.error(editingFriend ? 'Failed to update friend' : 'Failed to add friend'))
        .finally(() => setLoading(false));
    });
  };

  const handleDeleteFriend = (friend) => {
    const id = friend?.id;
    if (!id) return;
    if (friend?.name) setDeletedFriendName(id, friend.name);
    dispatch(deleteFriendAction(id, user?.id))
      .then(() => message.success('Friend removed from everywhere'))
      .catch((err) => message.error(typeof err === 'string' ? err : 'Failed to remove friend'));
  };

  const simplified = simplifyBalances(youOwe, theyOweYou, friends.map((f) => f.id), user?.id);
  const getName = (id) => getDisplayName(id, friends, user?.id);

  return (
    <div className="friends-page">
      <div className="page-header">
        <h1 className="page-title">Friends</h1>
        <EsButton type="primary" icon={<UserAddOutlined />} onClick={openCreateModal}>
          Add Friend
        </EsButton>
      </div>
      <EsCard>
        <EsList
          itemLayout="horizontal"
          dataSource={friends}
          renderItem={(friend) => {
            const { owe, owed } = getBalance(friend.id);
            return (
              <EsList.Item
                actions={[
                  <EsButton type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(friend)}>Edit</EsButton>,
                  hasPendingBalance(friend.id) ? (
                    <EsTooltip key="del" title="Settle up first to remove this friend">
                      <span>
                        <EsButton type="link" size="small" danger icon={<DeleteOutlined />} disabled>Delete</EsButton>
                      </span>
                    </EsTooltip>
                  ) : (
                    <EsPopconfirm
                      key="del"
                      title="Remove this friend?"
                      onConfirm={() => handleDeleteFriend(friend)}
                      okText="Remove"
                      okButtonProps={{ danger: true }}
                    >
                      <EsButton type="link" size="small" danger icon={<DeleteOutlined />}>Delete</EsButton>
                    </EsPopconfirm>
                  ),
                ]}
              >
                <EsList.Item.Meta title={friend.name} description={friend.email} />
                <div className="balance-cell">
                  {owe > 0 && <span className="you-owe">You owe $ {owe.toFixed(2)}</span>}
                  {owed > 0 && <span className="they-owe">Owes you $ {owed.toFixed(2)}</span>}
                  {owe === 0 && owed === 0 && <span className="settled">Settled up</span>}
                </div>
              </EsList.Item>
            );
          }}
        />
        {simplified.length > 0 && (
          <>
            <h4 style={{ marginTop: 24, marginBottom: 12 }}>Simplified (fewer transactions)</h4>
            <EsList
              size="small"
              dataSource={simplified}
              renderItem={(s) => (
                <EsList.Item>
                  <span>{getName(s.from)}</span>
                  <span className="simplified-arrow"> → </span>
                  <span>{getName(s.to)}</span>
                  <span className="simplified-amount"> $ {s.amount.toFixed(2)}</span>
                </EsList.Item>
              )}
            />
          </>
        )}
      </EsCard>
      <EsModal
        title={editingFriend ? 'Edit Friend' : 'Add Friend'}
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingFriend(null); }}
        onOk={handleSaveFriend}
        confirmLoading={loading}
        destroyOnClose
      >
        <EsForm form={form} layout="vertical">
          <EsForm.Item name="name" label="Name" rules={[{ required: true }]}>
            <EsInputBase placeholder="Friend's name" />
          </EsForm.Item>
          <EsForm.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <EsInputBase placeholder="Friend's email" />
          </EsForm.Item>
        </EsForm>
      </EsModal>
    </div>
  );
};

FriendsList.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
};

export default FriendsList;
