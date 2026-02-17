import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, List, Empty, Button, Modal, Form, InputNumber, Input, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from 'helpers/storageHandlers';
import { getExpensesAction, updateExpenseAction, deleteExpenseAction } from 'apis/expenses/expenses.actions';
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
  const [form] = Form.useForm();

  useEffect(() => { if (user?.id) dispatch(getExpensesAction(user.id)); }, [user?.id, dispatch]);

  const openEditModal = (item, e) => { if (e) e.stopPropagation(); setEditingExpense(item); form.setFieldsValue({ description: item.description, amount: item.amount }); setEditModalVisible(true); };
  const handleEditSubmit = () => {
    form.validateFields().then((values) => {
      if (!editingExpense) return;
      setLoading(true);
      dispatch(updateExpenseAction(editingExpense.id, { description: values.description, amount: Number(values.amount) }))
        .then(() => { message.success('Expense updated'); setEditModalVisible(false); setEditingExpense(null); form.resetFields(); })
        .catch(() => message.error('Failed to update expense')).finally(() => setLoading(false));
    });
  };
  const handleDelete = (id, e) => { if (e) e.stopPropagation(); dispatch(deleteExpenseAction(id)).then(() => message.success('Expense deleted')).catch((err) => message.error(typeof err === 'string' ? err : 'Failed to delete expense')); };

  return (
    <div className="expenses-page">
      <h1 className="page-title">Transactions / Expenses</h1>
      <Card>
        {expenses.length === 0 ? <Empty description="No expenses yet" /> : (
          <List dataSource={expenses} renderItem={(item) => (
            <List.Item className="expense-item" onClick={() => history.push('/app/expenses/' + item.id)} actions={[
              <Button type="link" size="small" icon={<EditOutlined />} onClick={(e) => openEditModal(item, e)}>Edit</Button>,
              <Popconfirm key="del" title="Delete this expense?" onConfirm={() => handleDelete(item.id)} okText="Delete" okButtonProps={{ danger: true }}>
                <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>Delete</Button>
              </Popconfirm>,
            ]}>
              <List.Item.Meta title={item.description} description={item.createdAt ? moment(item.createdAt).format('MMM D, YYYY') : ''} />
              <span className="expense-amount">${Number(item.amount).toFixed(2)}</span>
            </List.Item>
          )} />
        )}
      </Card>
      <Modal title="Edit Expense" visible={editModalVisible} onCancel={() => setEditModalVisible(false)} onOk={handleEditSubmit} confirmLoading={loading} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="description" label="Description" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="amount" label="Amount ($)" rules={[{ required: true }, { type: 'number', min: 0.01 }]}><InputNumber min={0.01} step={0.01} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpensesList;
