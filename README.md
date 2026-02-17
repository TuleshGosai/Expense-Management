# Expense Management System

A React-based expense splitting app (similar to Splitwise) to split expenses with friends. Built with React, Redux, Ant Design, and a mock backend (JSON Server).

## Features

- **Add Expense**: Enter amount, description, select friends, and split equally or unequally.
- **Friends List**: View how much you owe friends and how much they owe you; list updates with expenses.
- **Transactions / Expenses**: List all expenses; click an expense to see details and friend contributions.
- **Login / Logout**: Simple auth with mock user (demo@expense.com / demo123).
- **Add Friends**: Add new friends (existing friends are not removable).
- **Groups**: Create groups with friends (e.g. for trips) and track membership.
- **Expense Simplification**: View simplified balances so that circular debts are reduced (e.g. A→B→C becomes A→C).

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

2. **Start the mock API server** (in one terminal)

   ```bash
   npm run server
   ```

   This runs JSON Server on `http://localhost:3001` and serves `db.json`.

3. **Start the React app** (in a second terminal)

   ```bash
   npm start
   ```

   The app runs at `http://localhost:3000` and proxies API requests to port 3001.

4. **Log in**

   - Email: `demo@expense.com`
   - Password: `demo123`

### Build for production

```bash
npm run build
```

Serve the `build` folder with any static host. Note: the mock API is for development only; production would use a real backend.

## Project Structure (aligned with ekasha-style layout)

```
src/
├── apis/                    # Redux actions & reducers
│   ├── auth/
│   ├── friends/
│   ├── expenses/
│   └── groups/
├── configurations/redux/    # Store, root reducer, axios setup
├── helpers/                 # storageHandlers, apiEndpoint, balanceUtils
├── modules/
│   ├── containers/          # Main layout (sidebar, header)
│   └── pages/               # Feature pages
│       ├── authentication/
│       ├── dashboard/
│       ├── friends/
│       ├── expenses/
│       ├── expense-detail/
│       ├── add-expense/
│       └── groups/
├── App.js
├── appRouter.js
├── index.js
└── global.scss
```

Imports use `jsconfig.json` baseUrl `"src"` (e.g. `import x from 'helpers/storageHandlers'`).

## Mock API Contracts

The app assumes the following endpoints (implemented via JSON Server):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users?email={email}` | Get user by email (for login). |
| GET | `/friends?userId={userId}` | List friends for the user. |
| POST | `/friends` | Add a friend. Body: `{ name, email, userId }`. |
| GET | `/expenses?userId={userId}` | List expenses for the user. |
| POST | `/expenses` | Create expense. Body: `{ userId, paidBy, amount, description, splitType, contributions[], createdAt }`. |
| GET | `/expenses/:id` | Get a single expense by id. |
| GET | `/groups?userId={userId}` | List groups for the user. |
| POST | `/groups` | Create group. Body: `{ name, userId, memberIds[] }`. |

**Login** is handled in the frontend: the app calls `GET /users?email=...`, validates the password locally, then stores a mock token and user profile in localStorage.

## Assumptions

- One active user per browser (current user id from login; no multi-user switching in UI).
- Expenses are always “paid by” the logged-in user; friend contributions represent what each friend owes the payer.
- Friends list is scoped by `userId`; initial data is in `db.json` (hardcoded friends for the demo user).
- Groups store only name and member ids; group-scoped expenses and balances can be added later on top of this.
- Expense simplification is shown on the Friends page and considers all expenses (not yet filtered by group).
- UI is responsive: layout and content work on desktop and mobile (reference from assignment wireframes).

## Tech Stack

- React 18
- Redux, Redux Thunk
- React Router DOM v5
- Ant Design 4
- Axios
- JSON Server (mock API)
- SCSS for styles

## License

MIT
