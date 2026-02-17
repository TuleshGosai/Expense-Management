import moment from 'moment';

/**
 * Data for balance ring (donut) chart: You owe vs You are owed.
 */
export function getBalanceRingData(totalYouOwe, totalTheyOwe) {
  const a = Number(totalYouOwe) || 0;
  const b = Number(totalTheyOwe) || 0;
  if (a === 0 && b === 0) {
    return [{ name: 'Settled', value: 1, fill: '#d9d9d9' }];
  }
  const data = [];
  if (a > 0) data.push({ name: 'You owe', value: Math.round(a * 100) / 100, fill: '#ff4d4f' });
  if (b > 0) data.push({ name: 'You are owed', value: Math.round(b * 100) / 100, fill: '#52c41a' });
  return data.length ? data : [{ name: 'Settled', value: 1, fill: '#d9d9d9' }];
}

/**
 * Group expenses by month and return for area (cumulative) and bar (monthly total) charts.
 */
export function getExpensesByMonth(expenses) {
  const byMonth = {};
  (expenses || []).forEach((exp) => {
    const date = exp.createdAt ? moment(exp.createdAt) : moment();
    const key = date.format('YYYY-MM');
    const label = date.format('MMM YYYY');
    const amount = Number(exp.amount) || 0;
    if (!byMonth[key]) byMonth[key] = { key, label, amount: 0, count: 0 };
    byMonth[key].amount += amount;
    byMonth[key].count += 1;
  });
  const sorted = Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key));
  let cumulative = 0;
  return sorted.map((row) => {
    cumulative += row.amount;
    return { ...row, cumulative: Math.round(cumulative * 100) / 100 };
  });
}

/**
 * Top N expenses by amount for bar chart (alternative view).
 */
export function getTopExpensesByAmount(expenses, limit = 6) {
  const withAmount = (expenses || [])
    .map((exp) => ({ ...exp, amount: Number(exp.amount) || 0 }))
    .filter((exp) => exp.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
  return withAmount.map((exp) => ({
    name: (exp.description || 'Expense').slice(0, 20) + (exp.description && exp.description.length > 20 ? '…' : ''),
    amount: Math.round(exp.amount * 100) / 100,
  }));
}
