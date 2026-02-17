import React, { useState, useEffect } from 'react';
import { useHistory, useLocation, Switch, Route } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space, Button } from 'antd';
import {
  TeamOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  ApartmentOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { getUserProfile } from 'helpers/storageHandlers';
import { store } from 'configurations/redux/Store';
import { logoutAction } from 'apis/auth/auth.actions';
import { getFriendsAction } from 'apis/friends/friends.actions';
import { getExpensesAction } from 'apis/expenses/expenses.actions';
import { getGroupsAction } from 'apis/groups/groups.actions';
import Dashboard from 'modules/pages/dashboard';
import FriendsList from 'modules/pages/friends';
import ExpensesList from 'modules/pages/expenses';
import ExpenseDetail from 'modules/pages/expense-detail';
import AddExpense from 'modules/pages/add-expense';
import GroupsPage from 'modules/pages/groups';
import './MainLayout.scss';

const { Header, Sider, Content } = Layout;
const MOBILE_BREAKPOINT = 992;

const MainLayout = () => {
  const history = useHistory();
  const location = useLocation();
  const [user, setUser] = useState(getUserProfile());
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const uid = user?.id;
    if (uid) {
      store.dispatch(getFriendsAction(uid));
      store.dispatch(getExpensesAction(uid));
      store.dispatch(getGroupsAction(uid));
    }
  }, [user?.id]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setCollapsed(false);
      else setCollapsed(true);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    store.dispatch(logoutAction());
    history.push('/login');
    window.location.reload();
  };

  const menuItems = [
    { key: '/app', path: '/app', icon: <UnorderedListOutlined />, label: 'Dashboard' },
    { key: '/app/expenses', path: '/app/expenses', icon: <UnorderedListOutlined />, label: 'Expenses' },
    { key: '/app/add-expense', path: '/app/add-expense', icon: <PlusCircleOutlined />, label: 'Add Expense' },
    { key: '/app/friends', path: '/app/friends', icon: <TeamOutlined />, label: 'Friends' },
    { key: '/app/groups', path: '/app/groups', icon: <ApartmentOutlined />, label: 'Groups' },
  ];

  const userMenu = (
    <Menu
      items={[
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: handleLogout,
        },
      ]}
    />
  );

  // Match longest path first so /app/friends selects Friends, not Dashboard
  const selectedKey = [...menuItems]
    .sort((a, b) => b.path.length - a.path.length)
    .find((m) => location.pathname.startsWith(m.path))?.key || '/app';

  const onMenuClick = (path) => {
    history.push(path);
    if (isMobile) setCollapsed(true);
  };

  return (
    <Layout className="app-layout">
      {/* Mobile sidebar backdrop */}
      {isMobile && !collapsed && (
        <div
          className="sider-backdrop"
          role="button"
          tabIndex={0}
          onClick={() => setCollapsed(true)}
          onKeyDown={(e) => e.key === 'Escape' && setCollapsed(true)}
          aria-label="Close menu"
        />
      )}
      <Sider
        breakpoint="lg"
        collapsedWidth={0}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        className={`app-sider ${isMobile && !collapsed ? 'app-sider-open-mobile' : ''}`}
        trigger={null}
      >
        <div className="logo">Expense</div>
        <Menu
          theme="dark"
          selectedKeys={[selectedKey]}
          mode="inline"
          items={menuItems.map((m) => ({
            key: m.key,
            icon: m.icon,
            label: m.label,
            onClick: () => onMenuClick(m.path),
          }))}
        />
      </Sider>
      <Layout className="app-main-wrap">
        <Header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              className="hamburger-btn"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle menu"
            />
            <span className="header-title">Expense Management</span>
          </div>
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Space className="user-dropdown" style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={null} />
              <span className="user-name">{user?.name || 'User'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="app-content">
          <Switch>
            <Route exact path="/app" component={Dashboard} />
            <Route exact path="/app/expenses" component={ExpensesList} />
            <Route exact path="/app/expenses/:id" component={ExpenseDetail} />
            <Route exact path="/app/add-expense" component={AddExpense} />
            <Route exact path="/app/friends" component={FriendsList} />
            <Route exact path="/app/groups" component={GroupsPage} />
            <Route path="/app" component={Dashboard} />
          </Switch>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
