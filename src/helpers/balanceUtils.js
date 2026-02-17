/**
 * Recalculate contribution amounts when the expense total amount is updated.
 * Preserves split ratios; adjusts so sum equals newAmount (handles rounding).
 * @param {number} oldAmount - Previous total amount
 * @param {number} newAmount - New total amount
 * @param {Array<{ friendId, amount }>} contributions - Existing contributions
 * @returns {Array<{ friendId, amount }>} New contributions with updated amounts
 */
export function recalculateContributionsForNewAmount(oldAmount, newAmount, contributions) {
  const list = Array.isArray(contributions) ? contributions : [];
  if (list.length === 0) return [];
  const oldTotal = Number(oldAmount) || 0;
  if (oldTotal <= 0) return list.map((c) => ({ ...c, amount: Number(newAmount) / list.length }));

  const newTotal = Number(newAmount) || 0;
  const scaled = list.map((c) => {
    const amt = Number(c.amount) || 0;
    const newAmt = (amt / oldTotal) * newTotal;
    return { ...c, amount: Math.round(newAmt * 100) / 100 };
  });
  const sum = scaled.reduce((s, c) => s + c.amount, 0);
  const diff = Math.round((newTotal - sum) * 100) / 100;
  if (diff !== 0 && scaled.length > 0) scaled[0].amount = Math.round((scaled[0].amount + diff) * 100) / 100;
  return scaled;
}

/**
 * Compute balances from expenses for a user.
 * Returns: { youOwe: { friendId: amount }, theyOweYou: { friendId: amount } }
 * contributions: [{ friendId, amount }] per expense (positive = friend owes payer)
 */
export function computeBalancesFromExpenses(expenses, currentUserId) {
  const youOwe = {};
  const theyOweYou = {};

  if (!expenses || !Array.isArray(expenses)) return { youOwe, theyOweYou };

  expenses.forEach((exp) => {
    const payerId = exp.paidBy || exp.userId;
    const contributions = exp.contributions || exp.splits || [];
    contributions.forEach((c) => {
      const friendId = c.friendId || c.userId;
      const amount = Number(c.amount) || 0;
      if (!friendId || amount <= 0) return;
      if (payerId === currentUserId) {
        theyOweYou[friendId] = (theyOweYou[friendId] || 0) + amount;
      } else if (friendId === currentUserId) {
        youOwe[payerId] = (youOwe[payerId] || 0) + amount;
      }
    });
  });

  return { youOwe, theyOweYou };
}

/**
 * Simplify balances: if A owes B $40 and B owes C $40, simplify to A owes C $40.
 * Returns array of { from, to, amount }.
 */
export function simplifyBalances(youOwe, theyOweYou, friendIds, currentUserId) {
  const net = {};
  const allIds = new Set([
    ...(friendIds || []),
    ...(currentUserId ? [currentUserId] : []),
    ...Object.keys(youOwe),
    ...Object.keys(theyOweYou),
  ]);
  allIds.forEach((id) => {
    net[id] = (theyOweYou[id] || 0) - (youOwe[id] || 0);
  });

  const debtors = [];
  const creditors = [];
  Object.entries(net).forEach(([id, balance]) => {
    if (balance > 0) creditors.push({ id, amount: balance });
    if (balance < 0) debtors.push({ id, amount: -balance });
  });

  const result = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amount = Math.min(d.amount, c.amount);
    if (amount > 0) result.push({ from: d.id, to: c.id, amount });
    d.amount -= amount;
    c.amount -= amount;
    if (d.amount <= 0) i += 1;
    if (c.amount <= 0) j += 1;
  }
  return result;
}
