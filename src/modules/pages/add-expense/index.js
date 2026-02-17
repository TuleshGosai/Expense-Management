import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { EsCard, EsForm, EsInputBase, EsInputNumber, EsSelect, EsRadio, EsButton, message } from 'components';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from 'helpers/storageHandlers';
import { getFriendsAction } from 'apis/friends/friends.actions';
import { getGroupsAction } from 'apis/groups/groups.actions';
import { addExpenseAction } from 'apis/expenses/expenses.actions';
import './add-expense.scss';

const AddExpense = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const user = getUserProfile();
  const friends = useSelector((state) => state.Friends?.list || []);
  const [splitType, setSplitType] = useState('equal');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [paidBy, setPaidBy] = useState('you');
  const [form] = EsForm.useForm();

  useEffect(() => {
    if (user?.id) {
      dispatch(getFriendsAction(user.id));
      dispatch(getGroupsAction(user.id));
    }
  }, [user?.id, dispatch]);

  const onFinish = (values) => {
    const amount = Number(values.amount);
    const payerId = values.paidBy || user.id;
    const isPaidByYou = payerId === user.id;

    let friendIds = values.friends || [];
    // When a friend paid: you are always in the split (you owe them). Add you + selected friends as participants.
    if (!isPaidByYou) {
      friendIds = [user.id, ...friendIds.filter((id) => id !== user.id)];
    }
    if (friendIds.length === 0) {
      message.warning('Select at least one friend');
      return;
    }

    let contributions = [];
    if (splitType === 'equal') {
      const perPerson = amount / friendIds.length;
      contributions = friendIds.map((fid) => ({ friendId: fid, amount: perPerson }));
    } else {
      const custom = values.customShares || {};
      friendIds.forEach((fid) => {
        const amt = Number(custom[fid]) || 0;
        if (amt > 0) contributions.push({ friendId: fid, amount: amt });
      });
      const sum = contributions.reduce((a, c) => a + c.amount, 0);
      if (Math.abs(sum - amount) > 0.01) {
        message.error('Custom shares must add up to the total amount');
        return;
      }
    }

    const payload = {
      userId: user.id,
      paidBy: payerId,
      amount,
      description: values.description || 'Expense',
      splitType,
      contributions,
      createdAt: new Date().toISOString(),
      ...(values.groupId ? { groupId: values.groupId } : {}),
    };

    dispatch(addExpenseAction(payload))
      .then(() => {
        message.success('Expense added');
        form.resetFields();
        setSelectedFriends([]);
        history.push('/app/expenses');
      })
      .catch(() => message.error('Failed to add expense'));
  };

  const groups = useSelector((state) => state.Groups?.list || []);
  const friendOptions = friends.map((f) => ({ label: f.name, value: f.id }));
  const groupOptions = groups.map((g) => ({ label: g.name, value: g.id }));
  const paidByOptions = [
    { label: 'You', value: user?.id || 'you' },
    ...friends.map((f) => ({ label: f.name, value: f.id })),
  ];
  const isPaidByYou = paidBy === 'you' || paidBy === user?.id;

  return (
    <div className="add-expense-page">
      <h1 className="page-title">Add Expense</h1>
      <EsCard>
        <EsForm form={form} layout="vertical" onFinish={onFinish} initialValues={{ paidBy: user?.id }}>
          <EsForm.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Enter a short description for this expense' }]}
            extra="A short title to identify this expense later (e.g. Dinner at restaurant, Weekend trip, Groceries)."
          >
            <EsInputBase placeholder="e.g. Dinner at restaurant, Weekend trip" />
          </EsForm.Item>
          <EsForm.Item
            name="amount"
            label="Amount ($)"
            rules={[{ required: true, message: 'Enter the total amount' }, { type: 'number', min: 0.01 }]}
            extra="Total amount paid for this expense (will be split among participants)."
          >
            <EsInputNumber min={0.01} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
          </EsForm.Item>
          <EsForm.Item
            name="groupId"
            label="Group (optional)"
            extra="Link this expense to a group to track balances per group (e.g. trip, roommates)."
          >
            <EsSelect placeholder="No group" allowClear options={groupOptions} />
          </EsForm.Item>
          <EsForm.Item
            name="paidBy"
            label="Paid by"
            rules={[{ required: true, message: 'Select who paid for this expense' }]}
            extra={isPaidByYou ? 'You paid — friends you add in &quot;Split with&quot; will owe you their share.' : 'A friend paid — you are included in the split and your share will appear under &quot;You owe&quot; on the dashboard.'}
          >
            <EsSelect
              placeholder="Who paid for this expense?"
              options={paidByOptions}
              onChange={(v) => setPaidBy(v)}
            />
          </EsForm.Item>
          {!isPaidByYou && (
            <div style={{ marginBottom: 16, padding: '8px 12px', background: '#e6f7ff', borderRadius: 6, fontSize: 13, color: '#0050b3' }}>
              <strong>Friend paid:</strong> You will owe your share to the person who paid. Optionally add others in &quot;Split with&quot; if they also owe the same person.
            </div>
          )}
          <EsForm.Item
            name="friends"
            label={isPaidByYou ? 'Split with' : 'Split with'}
            rules={[{ required: isPaidByYou, message: 'Select at least one friend to split with' }]}
            extra={isPaidByYou ? 'Select friends who will owe you their share of this expense.' : 'Optionally select others who also owe the payer (you are included automatically).'}
          >
            <EsSelect
              mode="multiple"
              placeholder={isPaidByYou ? 'Select friends who owe you' : 'Select others (you are included automatically)'}
              options={friendOptions}
              onChange={setSelectedFriends}
            />
          </EsForm.Item>
          <EsForm.Item
            label="Split type"
            extra="Equally: divide the amount evenly. Unequally: enter each person's share manually."
          >
            <EsRadio.Group value={splitType} onChange={(e) => setSplitType(e.target.value)}>
              <EsRadio value="equal">Equally</EsRadio>
              <EsRadio value="unequal">Unequally</EsRadio>
            </EsRadio.Group>
          </EsForm.Item>
          {splitType === 'unequal' && (selectedFriends.length > 0 || !isPaidByYou) && (
            <EsForm.Item label="Amount per person">
              {!isPaidByYou && (
                <EsForm.Item key={user?.id} name={['customShares', user?.id]} label="You" rules={[{ required: true }]}>
                  <EsInputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
                </EsForm.Item>
              )}
              {selectedFriends.filter((fid) => fid !== user?.id).map((fid) => {
                const friend = friends.find((f) => f.id === fid);
                return (
                  <EsForm.Item key={fid} name={['customShares', fid]} label={friend?.name} rules={[{ required: true }]}>
                    <EsInputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
                  </EsForm.Item>
                );
              })}
            </EsForm.Item>
          )}
          <EsForm.Item>
            <EsButton type="primary" htmlType="submit">
              Add Expense
            </EsButton>
            <EsButton style={{ marginLeft: 8 }} onClick={() => history.push('/app')}>
              Cancel
            </EsButton>
          </EsForm.Item>
        </EsForm>
      </EsCard>
    </div>
  );
};

AddExpense.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
};

export default AddExpense;
