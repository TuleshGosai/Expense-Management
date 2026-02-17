import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Card, Descriptions, List, Button, Modal, Form, InputNumber, Input, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from 'helpers/storageHandlers';
import { getDisplayName } from 'helpers/displayUtils';
import { getExpenseByIdAction, updateExpenseAction, deleteExpenseAction } from 'apis/expenses/expenses.actions';
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
  const [form] = Form.useForm();

  useEffect(() => { if (id) dispatch(getExpenseByIdAction(id)); if (user?.id) dispatch(getFriendsAction(user.id)); }, [id, user?.id, dispatch]);

  const contributions = detail?.contributions || [];
  const payerId = detail?.paidBy || detail?.userId;
  const paidByName = !payerId ? '-' : getDisplayName(payerId, friends, user?.id);

  const openEditModal = () => { if (detail) form.setFieldsValue({ description: detail.description, amount: detail.amount }); setEditModalVisible(true); };
  const handleEditSubmit = () => {
    form.validateFields().then((values) => {
      if (!id) return;
      setLoading(true);
      dispatch(updateExpenseAction(id, { description: values.description, amount: Number(values.amount) }))
        .then(() => { message.success('Expense updated'); setEditModalVisible(false); dispatch(getExpenseByIdAction(id)); })
        .catch(() => message.error('Failed to update expense')).finally(() => setLoading(false));
    });
  };
  const handleDelete = () => dispatch(deleteExpenseAction(id)).then(() => { message.success('Expense deleted'); history.push('/app/expenses'); }).catch((err) => message.error(typeof err === 'string' ? err : 'Failed to delete expense'));

  return (
    <div className="expense-detail-page">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => history.push('/app/expenses')}>Back to Expenses</Button>
        {detail && (<><Button type="default" icon={<EditOutlined />} onClick={openEditModal}>Edit</Button>
          <Popconfirm title="Delete this expense?" onConfirm={handleDelete} okText="Delete" okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm></>)}
      </div>
      <Card title={detail?.description || 'Expense details'}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Amount">${detail ? Number(detail.amount).toFixed(2) : '-'}</Descriptions.Item>
          <Descriptions.Item label="Date">{detail?.createdAt ? moment(detail.createdAt).format('MMM D, YYYY') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Paid by">{paidByName}</Descriptions.Item>
        </Descriptions>
        <h4 style={{ marginTop: 16, marginBottom: 8 }}>Contributions</h4>
        <List size="small" dataSource={contributions} renderItem={(c) => (
          <List.Item><span>{getDisplayName(c.friendId, friends, user?.id)}</span><span className="contribution-amount">${Number(c.amount).toFixed(2)}</span></List.Item>
        )} />
        {contributions.length === 0 && <p style={{ color: '#999' }}>No contributions.</p>}
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

export default ExpenseDetail;
