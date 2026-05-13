import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, getDaysInMonth, getDate, startOfMonth, endOfMonth } from 'date-fns'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal' },
]

const CATEGORIES = [
  { emoji: '🍔', label: 'Food' },
  { emoji: '🚗', label: 'Transport' },
  { emoji: '🛍️', label: 'Shopping' },
  { emoji: '🎬', label: 'Entertainment' },
  { emoji: '💡', label: 'Bills' },
  { emoji: '💊', label: 'Health' },
  { emoji: '📚', label: 'Education' },
  { emoji: '🏠', label: 'Housing' },
  { emoji: '✈️', label: 'Travel' },
  { emoji: '💰', label: 'Other' },
]

function fmt(symbol, amount) {
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const now = new Date()
  const [currentMonth] = useState(format(now, 'yyyy-MM'))
  const monthLabel = format(now, 'MMMM yyyy')

  const [budget, setBudget] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  // Budget form
  const [budgetAmount, setBudgetAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [savingBudget, setSavingBudget] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)

  // Expense form
  const [expName, setExpName] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCategory, setExpCategory] = useState('🍔')
  const [addingExp, setAddingExp] = useState(false)

  const currencyObj = CURRENCIES.find(c => c.code === (budget?.currency || currency)) || CURRENCIES[0]

  useEffect(() => {
    if (user) loadData()
  }, [user, currentMonth])

  async function loadData() {
    setLoadingData(true)
    const [{ data: b }, { data: e }] = await Promise.all([
      supabase.from('budgets').select('*').eq('user_id', user.id).eq('month', currentMonth).maybeSingle(),
      supabase.from('expenses').select('*').eq('user_id', user.id).eq('month', currentMonth).order('created_at', { ascending: false })
    ])
    setBudget(b || null)
    setExpenses(e || [])
    if (b) { setBudgetAmount(b.amount); setCurrency(b.currency) }
    setLoadingData(false)
  }

  async function saveBudget() {
    if (!budgetAmount || isNaN(budgetAmount) || Number(budgetAmount) <= 0) return
    setSavingBudget(true)
    const payload = { user_id: user.id, month: currentMonth, amount: Number(budgetAmount), currency }
    if (budget) {
      await supabase.from('budgets').update({ amount: Number(budgetAmount), currency }).eq('id', budget.id)
    } else {
      await supabase.from('budgets').insert(payload)
    }
    await loadData()
    setEditingBudget(false)
    setSavingBudget(false)
  }

  async function addExpense() {
    if (!expName.trim() || !expAmount || isNaN(expAmount) || Number(expAmount) <= 0) return
    setAddingExp(true)
    await supabase.from('expenses').insert({
      user_id: user.id,
      month: currentMonth,
      name: expName.trim(),
      amount: Number(expAmount),
      category: expCategory,
      created_at: new Date().toISOString()
    })
    setExpName(''); setExpAmount('')
    await loadData()
    setAddingExp(false)
  }

  async function deleteExpense(id) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  // Calculations
  const totalBudget = budget ? Number(budget.amount) : 0
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const remaining = totalBudget - totalSpent
  const spentPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  const daysInMonth = getDaysInMonth(now)
  const dayOfMonth = getDate(now)
  const daysLeft = daysInMonth - dayOfMonth + 1
  const dailyAllowance = daysLeft > 0 && remaining > 0 ? remaining / daysLeft : 0

  const progressColor = spentPct > 85 ? '#ff5f5f' : spentPct > 60 ? '#ffb347' : '#c8f05a'

  const remainingClass = remaining < 0 ? 'danger' : remaining < totalBudget * 0.2 ? 'danger' : 'success'

  if (loadingData) {
    return <div className="loading">Loading your budget...</div>
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-logo">Spend<span>ly</span></div>
        <div className="dash-user">
          <span className="dash-email">{user.email}</span>
          <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={signOut}>Sign out</button>
        </div>
      </div>

      {/* Month */}
      <div className="month-bar">
        <div className="month-label">{monthLabel}</div>
        {budget && !editingBudget && (
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setEditingBudget(true)}>
            Edit Budget
          </button>
        )}
      </div>

      {/* Budget setup */}
      {!budget && !editingBudget ? (
        <div className="setup-card">
          <h2>Set your budget for {monthLabel}</h2>
          <p>Enter how much money you have this month to get started.</p>
          <div className="field-row" style={{ marginBottom: 16 }}>
            <div className="field">
              <label>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Monthly Budget</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveBudget()}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveBudget} disabled={savingBudget}>
            {savingBudget ? 'Saving...' : 'Set Budget →'}
          </button>
        </div>
      ) : editingBudget ? (
        <div className="edit-budget-form">
          <h3>Update Budget</h3>
          <div className="field-row" style={{ marginBottom: 14 }}>
            <div className="field">
              <label>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Monthly Budget</label>
              <input
                type="number"
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveBudget()}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, marginTop: 0 }} onClick={saveBudget} disabled={savingBudget}>
              {savingBudget ? 'Saving...' : 'Update →'}
            </button>
            <button className="btn btn-ghost" onClick={() => setEditingBudget(false)}>Cancel</button>
          </div>
        </div>
      ) : null}

      {/* Stats */}
      {budget && (
        <>
          <div className="stats-grid">
            <div className="stat-card accent">
              <div className="stat-label">Monthly Budget</div>
              <div className="stat-value">{fmt(currencyObj.symbol, totalBudget)}</div>
              <div className="stat-sub">{currency} · {monthLabel}</div>
            </div>
            <div className={`stat-card ${remainingClass}`}>
              <div className="stat-label">Remaining</div>
              <div className="stat-value">{fmt(currencyObj.symbol, Math.abs(remaining))}</div>
              <div className="stat-sub">{remaining < 0 ? '⚠️ Over budget' : `${daysLeft} days left`}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Daily Allowance</div>
              <div className="stat-value" style={{ color: dailyAllowance > 0 ? '#c8f05a' : '#ff5f5f' }}>
                {dailyAllowance > 0 ? fmt(currencyObj.symbol, dailyAllowance) : '—'}
              </div>
              <div className="stat-sub">{dailyAllowance > 0 ? `per day for ${daysLeft} days` : 'Budget exceeded'}</div>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-title">Spent this month</span>
              <span className="progress-pct" style={{ color: progressColor }}>{spentPct.toFixed(1)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${spentPct}%`, background: progressColor }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Spent: {fmt(currencyObj.symbol, totalSpent)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Budget: {fmt(currencyObj.symbol, totalBudget)}
              </span>
            </div>
          </div>

          {/* Log expense */}
          <div className="section-title">
            <span>💸</span> Log an Expense
          </div>
          <div className="log-form">
            <div className="field-row">
              <div className="field">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Lunch, Uber, Groceries"
                  value={expName}
                  onChange={e => setExpName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addExpense()}
                />
              </div>
              <div className="field">
                <label>Amount ({currencyObj.symbol})</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={expAmount}
                  onChange={e => setExpAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addExpense()}
                />
              </div>
              <div className="field">
                <label>Category</label>
                <select value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.emoji} value={c.emoji}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 0 }} onClick={addExpense} disabled={addingExp}>
              {addingExp ? 'Adding...' : '+ Add Expense'}
            </button>
          </div>

          {/* Expense list */}
          <div className="section-title">
            <span>📋</span> Expenses ({expenses.length})
          </div>
          {expenses.length === 0 ? (
            <div className="empty-state">
              <span className="emoji">💤</span>
              No expenses logged yet.<br />Add your first one above.
            </div>
          ) : (
            <div className="expense-list">
              {expenses.map(exp => (
                <div className="expense-item" key={exp.id}>
                  <div className="expense-emoji">{exp.category}</div>
                  <div className="expense-info">
                    <div className="expense-name">{exp.name}</div>
                    <div className="expense-date">{format(new Date(exp.created_at), 'MMM d, h:mm a')}</div>
                  </div>
                  <div className="expense-amount">−{fmt(currencyObj.symbol, exp.amount)}</div>
                  <button className="expense-delete" onClick={() => deleteExpense(exp.id)} title="Delete">×</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
