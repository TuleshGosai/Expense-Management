import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useHistory } from 'react-router-dom';
import { EsCard, EsDescriptions, EsList, EsButton, EsModal, EsForm, EsInputNumber, EsInputBase, message, EsPopconfirm } from 'components';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from 'components/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from 'helpers/storageHandlers';
import { getDisplayName } from 'helpers/displayUtils';
import { getExpenseByIdAction, getExpensesAction, updateExpenseAction, deleteExpenseAction } from 'apis/expenses/expenses.actions';
import { recalculateContributionsForNewAmount } from 'helpers/balanceUtils';
import { getFriendsAction } from 'apis/friends/friends.actions';
import moment from 'moment';
import './expense-detail.scss';

const ExpenseDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const user = getUserProfile();
  const detail = useSelector((state) => state.Expenses?.detail);
  const friends = useSelector((state) => state.Friends?.list || []);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = EsForm.useForm();

  useEffect(() => { if (id) dispatch(getExpenseByIdAction(id)); if (user?.id) dispatch(getFriendsAction(user.id)); }, [id, user?.id, dispatch]);

  const contributions = detail?.contributions || [];
  const payerId = detail?.paidBy || detail?.userId;
  const paidByName = !payerId ? '-' : getDisplayName(payerId, friends, user?.id);

  const openEditModal = () => { if (detail) form.setFieldsValue({ description: detail.description, amount: detail.amount }); setEditModalVisible(true); };
  const handleEditSubmit = () => {
    form.validateFields().then((values) => {
      if (!id || !detail) return;
      setLoading(true);
      const newAmount = Number(values.amount);
      const oldAmount = Number(detail.amount) || 0;
      const contributions = recalculateContributionsForNewAmount(
        oldAmount,
        newAmount,
        detail.contributions || []
      );
      const payload = { description: values.description, amount: newAmount };
      if (contributions.length > 0) payload.contributions = contributions;
      dispatch(updateExpenseAction(id, payload))
        .then(() => {
          message.success('Expense updated');
          setEditModalVisible(false);
          dispatch(getExpenseByIdAction(id));
          if (user?.id) dispatch(getExpensesAction(user.id));
        })
        .catch(() => message.error('Failed to update expense'))
        .finally(() => setLoading(false));
    });
  };
  const handleDelete = () => dispatch(deleteExpenseAction(id)).then(() => { message.success('Expense deleted'); history.push('/app/expenses'); }).catch((err) => message.error(typeof err === 'string' ? err : 'Failed to delete expense'));

  return (
    <div className="expense-detail-page">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <EsButton type="text" icon={<ArrowLeftOutlined />} onClick={() => history.push('/app/expenses')}>Back to Expenses</EsButton>
        {detail && (<><EsButton type="default" icon={<EditOutlined />} onClick={openEditModal}>Edit</EsButton>
          <EsPopconfirm title="Delete this expense?" onConfirm={handleDelete} okText="Delete" okButtonProps={{ danger: true }}>
            <EsButton danger icon={<DeleteOutlined />}>Delete</EsButton>
          </EsPopconfirm></>)}
      </div>
      <EsCard title={detail?.description || 'Expense details'}>
        <EsDescriptions column={1} size="small">
          <EsDescriptions.Item label="Amount">${detail ? Number(detail.amount).toFixed(2) : '-'}</EsDescriptions.Item>
          <EsDescriptions.Item label="Date">{detail?.createdAt ? moment(detail.createdAt).format('MMM D, YYYY') : '-'}</EsDescriptions.Item>
          <EsDescriptions.Item label="Paid by">{paidByName}</EsDescriptions.Item>
        </EsDescriptions>
        <h4 style={{ marginTop: 16, marginBottom: 8 }}>Contributions</h4>
        <EsList size="small" dataSource={contributions} renderItem={(c) => (
          <EsList.Item><span>{getDisplayName(c.friendId, friends, user?.id)}</span><span className="contribution-amount">${Number(c.amount).toFixed(2)}</span></EsList.Item>
        )} />
        {contributions.length === 0 && <p style={{ color: '#999' }}>No contributions.</p>}
      </EsCard>
      <EsModal title="Edit Expense" visible={editModalVisible} onCancel={() => setEditModalVisible(false)} onOk={handleEditSubmit} confirmLoading={loading} destroyOnClose>
        <EsForm form={form} layout="vertical">
          <EsForm.Item name="description" label="Description" rules={[{ required: true }]}><EsInputBase /></EsForm.Item>
          <EsForm.Item name="amount" label="Amount ($)" rules={[{ required: true }, { type: 'number', min: 0.01 }]}><EsInputNumber min={0.01} step={0.01} style={{ width: '100%' }} /></EsForm.Item>
        </EsForm>
      </EsModal>
    </div>
  );
};

ExpenseDetail.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
};

export default ExpenseDetail;
