import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, Row, Col, List, Button, Statistic, Modal } from 'antd';
import { TeamOutlined, UnorderedListOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from 'helpers/storageHandlers';
import { computeBalancesFromExpenses } from 'helpers/balanceUtils';
import { getDisplayName } from 'helpers/displayUtils';
import { getExpensesAction } from 'apis/expenses/expenses.actions';
import { getFriendsAction } from 'apis/friends/friends.actions';
import './dashboard.scss';

const Dashboard = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const user = getUserProfile();
  const expenses = useSelector((state) => state.Expenses?.list || []);
  const friends = useSelector((state) => state.Friends?.list || []);
  const [youOweModalVisible, setYouOweModalVisible] = useState(false);
  const [theyOweYouModalVisible, setTheyOweYouModalVisible] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(getExpensesAction(user.id));
      dispatch(getFriendsAction(user.id));
    }
  }, [user?.id, dispatch]);

  const { youOwe, theyOweYou } = computeBalancesFromExpenses(expenses, user?.id);
  const totalYouOwe = Object.values(youOwe).reduce((a, b) => a + b, 0);
  const totalTheyOwe = Object.values(theyOweYou).reduce((a, b) => a + b, 0);
  const youOweList = Object.entries(youOwe).filter(([, amt]) => amt > 0).map(([personId, amount]) => ({ personId, amount }));
  const theyOweYouList = Object.entries(theyOweYou).filter(([, amt]) => amt > 0).map(([personId, amount]) => ({ personId, amount }));

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      <Row gutter={[16, 16]} className="dashboard-cards">
        <Col xs={24} sm={24} md={8}>
          <Card className="dashboard-card dashboard-card-clickable" size="small" onClick={() => history.push('/app/expenses')}>
            <Statistic title="Total Expenses" value={expenses.length} prefix={<UnorderedListOutlined />} />
            <p className="stat-hint">Number of expenses recorded.</p>
            <Button type="link" style={{ padding: 0 }}>View all</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="dashboard-card dashboard-card-clickable" size="small" onClick={() => setYouOweModalVisible(true)}>
            <Statistic title="You owe" value={totalYouOwe.toFixed(2)} prefix="$" valueStyle={{ color: '#ff4d4f' }} />
            <p className="stat-hint">Total you need to pay back.</p>
            {youOweList.length > 0 && <Button type="link" style={{ padding: 0, marginTop: 4 }}>View list</Button>}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="dashboard-card dashboard-card-clickable" size="small" onClick={() => setTheyOweYouModalVisible(true)}>
            <Statistic title="You are owed" value={totalTheyOwe.toFixed(2)} prefix="$" valueStyle={{ color: '#52c41a' }} />
            <p className="stat-hint">Total others owe you.</p>
            {theyOweYouList.length > 0 && <Button type="link" style={{ padding: 0, marginTop: 4 }}>View list</Button>}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="dashboard-row-2">
        <Col xs={24} sm={24} md={12}>
          <Card title="Quick actions" size="small" className="dashboard-card">
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => history.push('/app/add-expense')} block style={{ marginBottom: 8 }}>Add Expense</Button>
            <Button icon={<TeamOutlined />} onClick={() => history.push('/app/friends')} block>Friends</Button>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Card title="Recent expenses" size="small" className="dashboard-card">
            {expenses.length === 0 ? <p style={{ color: '#999' }}>No expenses yet.</p> : (
              <List size="small" dataSource={expenses.slice(0, 5)} renderItem={(item) => (
                <List.Item style={{ cursor: 'pointer' }} onClick={() => history.push('/app/expenses/' + item.id)}>
                  {item.description} — ${Number(item.amount).toFixed(2)}
                </List.Item>
              )} />
            )}
          </Card>
        </Col>
      </Row>
      <Modal title="You owe" visible={youOweModalVisible} onCancel={() => setYouOweModalVisible(false)} footer={[
        <Button key="close" onClick={() => setYouOweModalVisible(false)}>Close</Button>,
        <Button key="friends" type="primary" onClick={() => { setYouOweModalVisible(false); history.push('/app/friends'); }}>Go to Friends</Button>,
      ]}>
        <p style={{ marginBottom: 16, color: '#666' }}>How much you need to pay to each person:</p>
        {youOweList.length === 0 ? <p style={{ color: '#999' }}>You do not owe anyone.</p> : (
          <List dataSource={youOweList} renderItem={({ personId, amount }) => (
            <List.Item><span>{getDisplayName(personId, friends, user?.id)}</span><strong style={{ color: '#ff4d4f' }}>${Number(amount).toFixed(2)}</strong></List.Item>
          )} />
        )}
      </Modal>
      <Modal title="You are owed" visible={theyOweYouModalVisible} onCancel={() => setTheyOweYouModalVisible(false)} footer={[
        <Button key="close" onClick={() => setTheyOweYouModalVisible(false)}>Close</Button>,
        <Button key="friends" type="primary" onClick={() => { setTheyOweYouModalVisible(false); history.push('/app/friends'); }}>Go to Friends</Button>,
      ]}>
        <p style={{ marginBottom: 16, color: '#666' }}>How much each person owes you:</p>
        {theyOweYouList.length === 0 ? <p style={{ color: '#999' }}>No one owes you.</p> : (
          <List dataSource={theyOweYouList} renderItem={({ personId, amount }) => (
            <List.Item><span>{getDisplayName(personId, friends, user?.id)}</span><strong style={{ color: '#52c41a' }}>${Number(amount).toFixed(2)}</strong></List.Item>
          )} />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
