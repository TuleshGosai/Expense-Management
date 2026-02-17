import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { EsCard, EsList, EsEmpty, EsButton, EsModal, EsForm, EsInputNumber, EsInputBase, message, EsPopconfirm } from 'components';
import { EditOutlined, DeleteOutlined } from 'components/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from 'helpers/storageHandlers';
import { getExpensesAction, updateExpenseAction, deleteExpenseAction } from 'apis/expenses/expenses.actions';
import { recalculateContributionsForNewAmount } from 'helpers/balanceUtils';
import moment from 'moment';
import './expenses.scss';

const ExpensesList = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const user = getUserProfile();
  const expenses = useSelector((state) => state.Expenses?.list || []);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = EsForm.useForm();

  useEffect(() => { if (user?.id) dispatch(getExpensesAction(user.id)); }, [user?.id, dispatch]);

  const openEditModal = (item, e) => { if (e?.stopPropagation) e.stopPropagation(); setEditingExpense(item); form.setFieldsValue({ description: item.description, amount: item.amount }); setEditModalVisible(true); };
  const handleEditSubmit = () => {
    form.validateFields().then((values) => {
      if (!editingExpense) return;
      setLoading(true);
      const newAmount = Number(values.amount);
      const oldAmount = Number(editingExpense.amount) || 0;
      const contributions = recalculateContributionsForNewAmount(
        oldAmount,
        newAmount,
        editingExpense.contributions || []
      );
      const payload = { description: values.description, amount: newAmount };
      if (contributions.length > 0) payload.contributions = contributions;
      dispatch(updateExpenseAction(editingExpense.id, payload))
        .then(() => {
          message.success('Expense updated');
          setEditModalVisible(false);
          setEditingExpense(null);
          form.resetFields();
          if (user?.id) dispatch(getExpensesAction(user.id));
        })
        .catch(() => message.error('Failed to update expense'))
        .finally(() => setLoading(false));
    });
  };
  const handleDelete = (id, e) => { if (e?.stopPropagation) e.stopPropagation(); dispatch(deleteExpenseAction(id)).then(() => message.success('Expense deleted')).catch((err) => message.error(typeof err === 'string' ? err : 'Failed to delete expense')); };

  return (
    <div className="expenses-page">
      <h1 className="page-title">Transactions / Expenses</h1>
      <EsCard>
        {expenses.length === 0 ? <EsEmpty description="No expenses yet" /> : (
          <EsList dataSource={expenses} renderItem={(item) => (
            <EsList.Item className="expense-item" actions={[
              <EsButton type="link" size="small" icon={<EditOutlined />} onClick={(e) => openEditModal(item, e)}>Edit</EsButton>,
              <EsPopconfirm key="del" title="Delete this expense?" onConfirm={() => handleDelete(item.id)} okText="Delete" okButtonProps={{ danger: true }}>
                <EsButton type="link" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e?.stopPropagation?.()}>Delete</EsButton>
              </EsPopconfirm>,
            ]}>
              <EsList.Item.Meta onClick={() => history.push('/app/expenses/' + item.id)} title={item.description} description={item.createdAt ? moment(item.createdAt).format('MMM D, YYYY') : ''} />
              <span className="expense-amount">${Number(item.amount).toFixed(2)}</span>
            </EsList.Item>
          )} />
        )}
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

ExpensesList.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
};

export default ExpensesList;
