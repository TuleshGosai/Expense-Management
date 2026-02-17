# Expense Management System

A React-based expense splitting app (similar to Splitwise) to split expenses with friends. Built with React, Redux, Ant Design, Recharts, and a mock backend (JSON Server). Includes login, registration, role-based access (admin/user), profile with change password, and a dedicated Users module for admins.

## Features

### Core
- **Dashboard** – Total expenses count, “You owe” / “You are owed” cards (click to see breakdown), quick actions (Add Expense, Friends), and recent expenses list. Three charts: balance overview (ring), expenses over time (area), top expenses (bar). Empty state with “No data” + icon when there’s no data.
- **Add Expense** – Enter amount, description, select who paid, select friends to split with, split equally or by amount. Optional group.
- **Expenses List** – All transactions; click to view details. Edit or delete an expense; contributions and balances update across the app.
- **Expense Detail** – View amount, date, paid-by, contributions; edit or delete with contribution recalculation.
- **Friends** – Add friends, view balances (you owe / they owe you), simplified balances. Remove friends when settled.
- **Groups** – Create groups, add friends as members, link expenses to groups, view per-group balances and expenses.

### Auth & Users
- **Login / Logout** – Email/password login against `/users`; token and user profile in localStorage. Logout from the topbar profile menu.
- **Registration** – “Create account” on the login card: name, email, password, confirm password. New users get `role: user`.
- **Forgot password** – “Forgot password?” opens a modal: “Contact your administration” and shows an admin email (configurable via `REACT_APP_ADMIN_EMAIL`; default from seed).
- **Profile** – Topbar profile dropdown: **View profile** and **Logout**. View profile page shows name, email, role and a **Change password** button (current password + new password + confirm).
- **User-wise data** – Current user in Redux and restored from localStorage on refresh. All data (expenses, friends, groups) is scoped by the logged-in user.
- **Roles** – Users have `role`: `admin` or `user`. Admin-only: Users menu and route `/app/users`.
- **Users module (admin only)** – List all users; add user (name, email, password, role); edit user (name, password, role; email fixed). Delete user (cannot delete own account). Admin cannot change their own role when editing self.

### UX
- **Splash screen** – Shown on first load and after successful login, then dashboard.
- **Responsive layout** – Sidebar, header (with profile dropdown), content; collapsible menu on small screens.
- **Charts** – Reusable chart components under `components/charts` (RingChart, AreaChart, BarChart) with shared empty state.
- **Centralized UI** – Es-prefixed components (EsCard, EsForm, EsInputBase, EsButton, EsModal, etc.) and icons from `components` / `components/icons`.

### Data & Validation
- **Edit expense** – Changing the total amount recalculates contributions and balances.
- **PropTypes** – Used for prop validation.
- **ESLint** – `npm run lint` and `npm run lint:fix`.

## How to Run Locally

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

1. **Install dependencies**
   ```bash
   cd expense-management-system
   npm install
   ```

2. **Start the API server** (one terminal)
   ```bash
   npm run server
   ```
   Runs json-server on `http://localhost:3002` and serves `db.json`.

3. **Start the React app** (second terminal)
   ```bash
   npm start
   ```
   App runs at `http://localhost:3000` and uses the API at `http://localhost:3002` (override with `REACT_APP_API_URL` or `REACT_APP_API_PORT` in `.env`).

4. **Log in (admin)**
   - Email: `tuleshgosai@expense.com`
   - Password: `Admin@123`  
   This user has `role: admin`, so the **Users** menu is visible.

### Scripts
| Command            | Description                    |
|--------------------|--------------------------------|
| `npm start`        | Run the app (development)     |
| `npm run build`    | Production build into `build/`|
| `npm run server`   | Start json-server (port 3002) |
| `npm run lint`     | Run ESLint on `src`           |
| `npm run lint:fix` | ESLint with auto-fix          |

## Deploy on Vercel (React + API in one project)

This project is set up so you can deploy **both** the React app and the JSON Server API on Vercel.

1. **Connect the repo** to [Vercel](https://vercel.com) (GitHub/GitLab/Bitbucket).
2. **Build settings** (usually auto-detected from `vercel.json`):
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`
3. **Deploy.** Vercel will:
   - Build the React app into `build/`.
   - Deploy the serverless API from `api/index.js`, which runs json-server against `db.json`. All `/api/*` requests (e.g. `/api/users`, `/api/expenses`) are handled by this API.
4. **Optional:** To use an external API instead of the built-in one, set the env var **`REACT_APP_API_URL`** in the Vercel project to your API base URL (e.g. `https://your-json-server.railway.app`). The app will then call that URL instead of `/api`.

**Note:** The serverless API uses the same `db.json` as local development. Data is not persisted across serverless invocations unless you use an external database; for a real backend, replace the API with your own or set `REACT_APP_API_URL`. If the API fails on Vercel (e.g. `json-server` not found), move `json-server` from `devDependencies` to `dependencies` in `package.json`.

**If you get 401 Unauthorized when opening the deployment:**  
Vercel is returning 401, not your app. Turn off **Deployment Protection** so the site is public: **Project → Settings → Deployment Protection**. For **Production**, set **Vercel Authentication** to **Off** (or **Only Preview** if you want production public). If your project is under a **Team**, check **Team Settings → Deployment Protection** as well. Then open the site in an **incognito/private** window to avoid cached 401.

## Project Structure

```
src/
├── apis/                        # Redux actions & reducers
│   ├── auth/                   # Login, logout, register, verifyPassword, changePassword
│   ├── user/                   # Current user (set/clear/init, selectors)
│   ├── users/                  # All users CRUD (admin)
│   ├── friends/
│   ├── expenses/
│   └── groups/
├── components/
│   ├── index.js                # Es* re-exports + message
│   ├── icons/                  # Re-exports from @ant-design/icons
│   ├── es/                     # Es-prefixed antd wrappers
│   ├── forms/                  # EsInput, EsButton
│   └── charts/                 # Reusable chart components
│       ├── index.js            # RingChart, AreaChart, BarChart, ChartNoData
│       ├── lib/                # ChartNoData, style.css
│       ├── ringChart/
│       ├── areaChart/
│       └── barChart/
├── configurations/redux/       # Store, root reducer, AxiosCall
├── helpers/
│   ├── apiEndpoint.js          # API base URL (dev: port 3002)
│   ├── storageHandlers.js      # Token, user profile, deleted friend names
│   ├── balanceUtils.js         # computeBalancesFromExpenses, simplifyBalances, etc.
│   ├── chartDataUtils.js       # getBalanceRingData, getExpensesByMonth, getTopExpensesByAmount
│   └── displayUtils.js        # getDisplayName (friends, self)
├── modules/
│   ├── containers/
│   │   └── MainLayout.js       # Sidebar, header (profile dropdown), routes
│   └── pages/
│       ├── authentication/    # Login, Register, Forgot password modal
│       ├── dashboard/          # Stats, charts, quick actions, recent expenses
│       ├── profile/            # User details, Change password
│       ├── add-expense/
│       ├── expenses/
│       ├── expense-detail/
│       ├── friends/
│       ├── groups/
│       └── users/              # Admin: list/add/edit/delete users
├── App.js                      # Provider, splash, init user from storage
├── appRouter.js                # HashRouter, /login, /app/*, PrivateRoute
├── index.js
└── global.scss
```

Imports use `src` as baseUrl (e.g. `import { EsCard } from 'components'`, `import { selectCurrentUser } from 'apis/user/user.selectors'`).

## Routes

| Path           | Description                    | Auth   |
|----------------|--------------------------------|--------|
| `/login`       | Login / Register               | Public |
| `/app`         | Dashboard                      | Private|
| `/app/expenses`| Expenses list                  | Private|
| `/app/expenses/:id` | Expense detail           | Private|
| `/app/add-expense`  | Add expense               | Private|
| `/app/friends`      | Friends & balances        | Private|
| `/app/groups`       | Groups                    | Private|
| `/app/profile`      | My profile (details, change password) | Private |
| `/app/users`        | Users CRUD (admin only)   | Private|

## Mock API

JSON Server serves `db.json` with:

| Method  | Endpoint                      | Description |
|---------|-------------------------------|-------------|
| GET     | `/users?email={email}`        | Get user by email (login). |
| GET     | `/users`                      | List all users (admin). |
| POST    | `/users`                     | Create user. Body: `{ name, email, password, role }`. |
| PATCH   | `/users/:id`                 | Update user (e.g. name, password, role). |
| DELETE  | `/users/:id`                 | Delete user. |
| GET     | `/friends?userId={userId}`   | List friends for user. |
| POST    | `/friends`                   | Add friend. |
| PATCH   | `/friends/:id`               | Update friend. |
| DELETE  | `/friends/:id`               | Delete friend. |
| GET     | `/expenses?userId={userId}`  | List expenses for user. |
| GET     | `/expenses/:id`              | Get one expense. |
| POST    | `/expenses`                  | Create expense. |
| PATCH   | `/expenses/:id`              | Update expense. |
| DELETE  | `/expenses/:id`              | Delete expense. |
| GET     | `/groups?userId={userId}`    | List groups for user. |
| POST    | `/groups`                    | Create group. |
| PATCH   | `/groups/:id`                | Update group. |
| DELETE  | `/groups/:id`                | Delete group. |

Login is handled in the frontend: `GET /users?email=...`, validate password, then store token and user profile in localStorage and set current user in Redux.

## Tech Stack
- React 18  
- Redux, Redux Thunk  
- React Router DOM v5  
- Ant Design 4, @ant-design/icons  
- Recharts (dashboard charts)  
- Axios  
- JSON Server (mock API)  
- SCSS  
- PropTypes  
- ESLint (react-app config)  
- Moment.js (dates in chart data)

## Configuration
- **`.env`** – Optional: `EXTEND_ESLINT=true`, `GENERATE_SOURCEMAP=false`, `REACT_APP_API_PORT=3002`, `REACT_APP_ADMIN_EMAIL=...` (email shown in Forgot password modal).
- **`jsconfig.json`** – baseUrl `"src"` for imports.

## License
MIT
