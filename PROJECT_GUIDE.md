# Expense Management System – Project Guide

This document explains **every folder and file** in the project: what it does and how it fits together.

---

## Root-level files and folders

| File / Folder | Purpose |
|---------------|--------|
| **`package.json`** | Defines the app name, version, **dependencies** (React, Redux, Ant Design, axios, recharts, etc.), **devDependencies** (react-scripts, sass, json-server), and **scripts**: `npm start` (dev server), `npm run build` (production build), `npm run server` (json-server on port 3002), `npm run lint` / `lint:fix`. |
| **`db.json`** | Mock database used by **json-server**. Contains `users`, `friends`, `expenses`, `groups`. The API runs with `npm run server` and serves this file at `http://localhost:3002`. |
| **`.env`** | Local environment variables (not committed; see `.gitignore`). You can set `REACT_APP_API_URL`, `REACT_APP_API_PORT`, `REACT_APP_ADMIN_EMAIL` here. |
| **`.gitignore`** | Tells Git to ignore `node_modules/`, `build/`, `.env`, logs, IDE folders, etc. |
| **`.eslintrc.json`** | ESLint config: browser + Node, ES2021, React rules; warns on `prop-types`, `no-unused-vars`, `no-console`; errors on `no-debugger`. |
| **`public/`** | Static assets served as-is. |
| **`src/`** | All React app source code (see below). |
| **`README.md`** | How to run the app, features, and project structure summary. |

---

## `public/`

| File | Purpose |
|------|--------|
| **`index.html`** | Single HTML shell: charset, viewport, theme-color, title “Expense Management”, and `<div id="root"></div>`. React mounts the app into `#root`. |
| **`favicon.ico`** (if present) | Browser tab icon. |

---

## `src/` – Application entry and shell

| File | Purpose |
|------|--------|
| **`index.js`** | **Entry point.** Imports Ant Design CSS, `global.scss`, and `App`. Uses `createRoot` to render `<App />` into `document.getElementById('root')`. |
| **`global.scss`** | Global styles: layout (e.g. `.globalHeight`), `.app-splash` (splash screen), `.app-content`, `.page-header`, `.page-title`, list item hover, chart container, etc. |
| **`App.js`** | Wraps the app in Redux **`<Provider store={store}>`**. Shows **SplashScreen** for ~2.2s, then **AppRouter**. On mount, if a token exists in localStorage, dispatches `initCurrentUserFromStorage()` to restore the logged-in user. |
| **`appRouter.js`** | **Routing.** Uses **HashRouter**. Defines **PrivateRoute**: if no auth token, redirects to `/login`; otherwise renders the given component. Routes: `/login` → Authentication, `/app` → MainLayout (dashboard and all app pages), `/` → redirect to `/app` or `/login` depending on token. |

---

## `src/configurations/redux/` – Redux store and HTTP

| File | Purpose |
|------|--------|
| **`Store.js`** | Creates the Redux store: **combineReducers** with all slice reducers, **thunk** middleware, and Redux DevTools compose in development. Exports `store`, `middlewares`, `rootReducer`. |
| **`RootReducer.js`** | Imports all slice reducers (Auth, User, Users, Friends, Expenses, Groups) and exports them as one object for `combineReducers`. |
| **`AxiosCall.js`** | Creates an **axios instance** with `baseURL` from `apiEndPoint` (see `helpers/apiEndpoint.js`), timeout 10s, JSON header. Exports **axiosCall** helper that dispatches `*_SUCCESS` / `*_ERROR` and returns the promise for chaining. |

---

## `src/helpers/` – Shared utilities

| File | Purpose |
|------|--------|
| **`apiEndpoint.js`** | **API base URL.** In development: `REACT_APP_API_URL` or `http://localhost:3002` (or `REACT_APP_API_PORT`). In production: `''`. Used by axios instance and auth actions. |
| **`storageHandlers.js`** | **localStorage** helpers: `getAuthToken` / `setAuthToken` / `removeAuthToken`, `getUserProfile` / `setUserProfile` / `removeUserProfile`, `clearAuth`. Also **deleted-friend names** cache: `getDeletedFriendNames` / `setDeletedFriendName` (used when a friend is removed so we can still show “Name (deleted)” in old expenses). |
| **`balanceUtils.js`** | **Balance logic:** `recalculateContributionsForNewAmount` (when expense amount changes, scale contributions); `computeBalancesFromExpenses` (youOwe / theyOweYou per friend from expenses); `simplifyBalances` (suggest “A pays B $X” to reduce transactions). |
| **`chartDataUtils.js`** | **Chart data:** `getBalanceRingData` (you owe vs you are owed for ring chart); `getExpensesByMonth` (group by month for area/bar); `getTopExpensesByAmount` (top N expenses by amount). |
| **`displayUtils.js`** | **Display names:** `getDisplayName(id, friends, currentUserId)` – returns “You”, friend name, or “Name (deleted)” using `getDeletedFriendNames`. |

---

## `src/apis/` – Redux slices (actions + reducers)

Each folder corresponds to one slice of state and one resource in `db.json`.

| Folder | Purpose |
|--------|--------|
| **`auth/`** | **auth.actions.js**: `loginAction` (GET users by email, check password, set token/profile, dispatch setCurrentUser), `logoutAction`, `verifyPasswordAction`, `changePasswordAction`, `registerAction` (POST user). **auth.reducers.js**: handles `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_ERROR`, `AUTH_LOGOUT_SUCCESS`. |
| **`user/`** | **user.actions.js**: `setCurrentUser`, `clearCurrentUser`, `initCurrentUserFromStorage` (read profile from localStorage and put in store). **user.reducers.js**: stores current user object. **user.selectors.js**: `selectCurrentUser`. **index.js**: re-exports. |
| **`users/`** | **users.actions.js**: CRUD for all users (admin): getUsers, addUser, updateUser, deleteUser. **users.reducers.js**: list of users. |
| **`friends/`** | **friends.actions.js**: getFriends, addFriend, updateFriend, deleteFriend (with cleanup of groups/expenses). **friends.reducers.js**: list of friends. |
| **`expenses/`** | **expenses.actions.js**: getExpenses, getExpenseById (detail), updateExpense, deleteExpense. **expenses.reducers.js**: `list` and `detail`. |
| **`groups/`** | **groups.actions.js**: getGroups, createGroup, updateGroup, deleteGroup (cascade delete group expenses). **groups.reducers.js**: list of groups. |

All API calls use the **axios instance** from `configurations/redux/AxiosCall.js` (so they use `apiEndPoint`). Auth uses the same base URL in `auth.actions.js` for login/register/change-password.

---

## `src/components/` – Reusable UI

| Folder / File | Purpose |
|---------------|--------|
| **`index.js`** | **Single import for UI:** re-exports Es-prefixed components from `es/`, `message` from antd, EsInput/EsButton from forms, and chart components. |
| **`es/index.js`** | **Es-prefixed wrappers** for Ant Design: EsCard, EsForm, EsInputBase, EsInputNumber, EsSelect, EsRadio, EsList, EsModal, EsEmpty, EsDescriptions, EsPopconfirm, EsTooltip, EsSpin, EsStatistic, EsRow, EsCol, EsLayout, EsMenu, EsDropdown, EsAvatar, EsSpace, EsMessage. Same API as antd; consistent naming. |
| **`icons/index.js`** | Re-exports from `@ant-design/icons`: UserOutlined, LockOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UnorderedListOutlined, PlusCircleOutlined, HomeOutlined, etc. Import from `components/icons`. |
| **`forms/input/`** | **EsInput** (wrapper), **EsNormalInput**, **EsPasswordInput** (with show/hide password). Used by login, register, profile, etc. |
| **`forms/button/`** | **EsButton** – wrapper around antd Button. |
| **`charts/`** | **index.js**: exports RingChart, AreaChart, BarChart, ChartNoData. **lib/ChartNoData.js**: “No data” placeholder. **ringChart/**: donut (balance: you owe vs you are owed). **areaChart/**: cumulative expenses over time. **barChart/**: top expenses by amount. All use **Recharts** and shared empty state. |

---

## `src/modules/` – App-specific screens and layout

### `src/modules/containers/`

| File | Purpose |
|------|--------|
| **MainLayout.js** | **Shell after login:** sidebar (Dashboard, Expenses, Add Expense, Friends, Groups, Users for admin), header (title + profile dropdown), and **Switch/Route** for all app pages. On mobile: no sidebar; **bottom navigation bar** with same menu items (icons only). Profile dropdown: View profile, Logout. Dispatches getFriends, getExpenses, getGroups when user is set. **MainLayout.scss**: sidebar styles, mobile bottom nav (theme primary color, tooltips), header, content padding, mobile padding-bottom for nav. |

### `src/modules/pages/`

| Folder | Purpose |
|--------|--------|
| **authentication/** | **index.js**: Login form (email/password), “Create account” (register), “Forgot password?” modal (shows admin email from `REACT_APP_ADMIN_EMAIL`). Uses auth actions; on success redirects to `/app`. **auth.scss**: login card and layout. |
| **dashboard/** | **index.js**: Page title, stat cards (Total Expenses, You owe, You are owed – click to open modals with lists), Balance ring chart, Expenses over time (area), Top expenses (bar), Recent expenses list, Add Expense / Friends buttons. **dashboard.scss**: card layout and chart styling. |
| **expenses/** | **index.js**: “Transactions / Expenses” list (description, date, amount, Edit/Delete). Empty state. Click row → expense detail. Edit modal (description, amount; recalculates contributions). **expenses.scss**: list item and amount; mobile stack layout. |
| **expense-detail/** | **index.js**: Single expense view (amount, date, paid-by, contributions). Edit and Delete with contribution recalculation. Back to list. **expense-detail.scss**: layout. |
| **add-expense/** | **index.js**: Form: amount, description, who paid, friends to split with, equal vs unequal split. Optional group. Submit creates expense and contributions. **add-expense.scss**: form layout. |
| **friends/** | **index.js**: Friends list (name, email, you owe / they owe you / settled). Add/Edit/Delete friend. Simplified balances section. Delete disabled until settled. **friends.scss**: balance colors; mobile stack. |
| **groups/** | **index.js**: Groups list; create group, add members (friends), view expenses per group and balances. Delete group (cascade expenses). **groups/** (folder) may have its own scss. |
| **users/** | **index.js**: **Admin only.** List users (name, email, role badge), Add user, Edit (name, password, role; email fixed; admin can’t change own role), Delete (not self). **users.scss**: role badge; mobile stack. |
| **profile/** | **index.js**: View name, email, role. “Change password” opens modal: current password, new password, confirm; uses verifyPassword + PATCH user. **profile/** may have scss. |

Each page folder typically has **index.js** (the React component) and a **`.scss`** file for that page’s styles. Some use **EsCard**, **EsList**, **EsModal**, **EsForm**, etc., from `components`.

---

## How data flows

1. **Login**  
   User enters email/password → `loginAction` → GET `/users?email=...` → find user, compare password → set token + profile in localStorage, dispatch `setCurrentUser` and `AUTH_LOGIN_SUCCESS` → redirect to `/app`.

2. **App load (already logged in)**  
   `App.js` runs `initCurrentUserFromStorage()` → reads profile from localStorage → dispatch `setCurrentUser` → MainLayout mounts and dispatches `getFriendsAction`, `getExpensesAction`, `getGroupsAction` for current user.

3. **API base URL**  
   `apiEndpoint.js` sets `apiEndPoint` (dev: localhost:3002; prod: `''`). **AxiosCall.js** creates axios with that baseURL. All apis/* actions use this instance, so all requests go to json-server (or whatever you set in `.env`).

4. **State**  
   Redux holds: Auth (token/login state), User (current user), Users (admin list), Friends, Expenses (list + detail), Groups. Pages **useSelector** to read and **dispatch** actions to change.

5. **Routing**  
   **appRouter.js**: `/login` = public; `/app` = private (MainLayout). MainLayout’s **Switch** renders Dashboard, Expenses, ExpenseDetail, AddExpense, Friends, Groups, Users, Profile by path.

---

## Summary table

| Layer | What it is |
|-------|------------|
| **Entry** | `index.js` → `App.js` → `AppRouter` |
| **Router** | HashRouter; PrivateRoute guards `/app` |
| **Layout** | MainLayout: sidebar (or bottom nav on mobile), header, content area with routes |
| **State** | Redux store (Auth, User, Users, Friends, Expenses, Groups) |
| **API** | Axios instance + apiEndPoint; actions in `apis/*` |
| **UI** | Es-prefixed components (antd) + charts (Recharts) from `components` |
| **Data** | json-server serves `db.json` at port 3002 |
| **Styles** | `global.scss` + per-page/module `.scss` files |

If you want more detail on a specific file (e.g. one action or one page), say which file and what you want (e.g. “step-by-step login flow” or “how expense edit recalculates contributions”).
