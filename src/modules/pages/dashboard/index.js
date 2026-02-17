import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { EsCard, EsRow, EsCol, EsList, EsButton, EsStatistic, EsModal } from 'components';
import { RingChart, AreaChart, BarChart } from 'components/charts';
import { TeamOutlined, UnorderedListOutlined, PlusCircleOutlined } from 'components/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from 'helpers/storageHandlers';
import { computeBalancesFromExpenses } from 'helpers/balanceUtils';
import { getDisplayName } from 'helpers/displayUtils';
import { getBalanceRingData, getExpensesByMonth, getTopExpensesByAmount } from 'helpers/chartDataUtils';
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

  const balanceRingData = getBalanceRingData(totalYouOwe, totalTheyOwe);
  const expensesByMonth = getExpensesByMonth(expenses);
  const topExpensesData = getTopExpensesByAmount(expenses, 6);

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      <EsRow gutter={[16, 16]} className="dashboard-cards">
        <EsCol xs={24} sm={24} md={8}>
          <EsCard className="dashboard-card dashboard-card-clickable" size="small" onClick={() => history.push('/app/expenses')}>
            <EsStatistic title="Total Expenses" value={expenses.length} prefix={<UnorderedListOutlined />} />
            <p className="stat-hint">Number of expenses recorded.</p>
            <EsButton type="link" style={{ padding: 0 }}>View all</EsButton>
          </EsCard>
        </EsCol>
        <EsCol xs={24} sm={12} md={8}>
          <EsCard className="dashboard-card dashboard-card-clickable" size="small" onClick={() => setYouOweModalVisible(true)}>
            <EsStatistic title="You owe" value={totalYouOwe.toFixed(2)} prefix="$" valueStyle={{ color: '#ff4d4f' }} />
            <p className="stat-hint">Total you need to pay back.</p>
            {youOweList.length > 0 && <EsButton type="link" style={{ padding: 0, marginTop: 4 }}>View list</EsButton>}
          </EsCard>
        </EsCol>
        <EsCol xs={24} sm={12} md={8}>
          <EsCard className="dashboard-card dashboard-card-clickable" size="small" onClick={() => setTheyOweYouModalVisible(true)}>
            <EsStatistic title="You are owed" value={totalTheyOwe.toFixed(2)} prefix="$" valueStyle={{ color: '#52c41a' }} />
            <p className="stat-hint">Total others owe you.</p>
            {theyOweYouList.length > 0 && <EsButton type="link" style={{ padding: 0, marginTop: 4 }}>View list</EsButton>}
          </EsCard>
        </EsCol>
      </EsRow>
      <EsRow gutter={[16, 16]} className="dashboard-charts-row">
        <EsCol xs={24} md={8}>
          <EsCard title="Balance overview (ring)" size="small" className="dashboard-card dashboard-chart-card">
            <RingChart data={balanceRingData} height={220} />
          </EsCard>
        </EsCol>
        <EsCol xs={24} md={8}>
          <EsCard title="Expenses over time (area)" size="small" className="dashboard-card dashboard-chart-card">
            <AreaChart data={expensesByMonth} height={220} />
          </EsCard>
        </EsCol>
        <EsCol xs={24} md={8}>
          <EsCard title="Top expenses (bar)" size="small" className="dashboard-card dashboard-chart-card">
            <BarChart data={topExpensesData} height={220} />
          </EsCard>
        </EsCol>
      </EsRow>
      <EsRow gutter={[16, 16]} className="dashboard-row-2">
        <EsCol xs={24} sm={24} md={12}>
          <EsCard title="Quick actions" size="small" className="dashboard-card">
            <EsButton type="primary" icon={<PlusCircleOutlined />} onClick={() => history.push('/app/add-expense')} block style={{ marginBottom: 8 }}>Add Expense</EsButton>
            <EsButton icon={<TeamOutlined />} onClick={() => history.push('/app/friends')} block>Friends</EsButton>
          </EsCard>
        </EsCol>
        <EsCol xs={24} sm={24} md={12}>
          <EsCard title="Recent expenses" size="small" className="dashboard-card">
            {expenses.length === 0 ? <p style={{ color: '#999' }}>No expenses yet.</p> : (
              <EsList size="small" dataSource={expenses.slice(0, 5)} renderItem={(item) => (
                <EsList.Item style={{ cursor: 'pointer' }} onClick={() => history.push('/app/expenses/' + item.id)}>
                  {item.description} — ${Number(item.amount).toFixed(2)}
                </EsList.Item>
              )} />
            )}
          </EsCard>
        </EsCol>
      </EsRow>
      <EsModal title="You owe" visible={youOweModalVisible} onCancel={() => setYouOweModalVisible(false)} footer={[
        <EsButton key="close" onClick={() => setYouOweModalVisible(false)}>Close</EsButton>,
        <EsButton key="friends" type="primary" onClick={() => { setYouOweModalVisible(false); history.push('/app/friends'); }}>Go to Friends</EsButton>,
      ]}>
        <p style={{ marginBottom: 16, color: '#666' }}>How much you need to pay to each person:</p>
        {youOweList.length === 0 ? <p style={{ color: '#999' }}>You do not owe anyone.</p> : (
          <EsList dataSource={youOweList} renderItem={({ personId, amount }) => (
            <EsList.Item><span>{getDisplayName(personId, friends, user?.id)}</span><strong style={{ color: '#ff4d4f' }}>${Number(amount).toFixed(2)}</strong></EsList.Item>
          )} />
        )}
      </EsModal>
      <EsModal title="You are owed" visible={theyOweYouModalVisible} onCancel={() => setTheyOweYouModalVisible(false)} footer={[
        <EsButton key="close" onClick={() => setTheyOweYouModalVisible(false)}>Close</EsButton>,
        <EsButton key="friends" type="primary" onClick={() => { setTheyOweYouModalVisible(false); history.push('/app/friends'); }}>Go to Friends</EsButton>,
      ]}>
        <p style={{ marginBottom: 16, color: '#666' }}>How much each person owes you:</p>
        {theyOweYouList.length === 0 ? <p style={{ color: '#999' }}>No one owes you.</p> : (
          <EsList dataSource={theyOweYouList} renderItem={({ personId, amount }) => (
            <EsList.Item><span>{getDisplayName(personId, friends, user?.id)}</span><strong style={{ color: '#52c41a' }}>${Number(amount).toFixed(2)}</strong></EsList.Item>
          )} />
        )}
      </EsModal>
    </div>
  );
};

Dashboard.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
};

export default Dashboard;
