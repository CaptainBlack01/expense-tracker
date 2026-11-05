/**
 * TrackPulse - Vanilla JS Expense Tracker & Analytics Engine
 * Persistent storage via localStorage with zero external libraries.
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_TRANSACTIONS = 'trackpulse_transactions_v1';
  const STORAGE_KEY_BUDGET = 'trackpulse_budget_limit_v1';
  const STORAGE_KEY_CURRENCY = 'trackpulse_currency_v1';

  // Currency Definitions & Formats
  const CURRENCIES = {
    USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar ($)' },
    NGN: { code: 'NGN', symbol: '₦', locale: 'en-NG', name: 'Nigerian Naira (₦)' },
    GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound (£)' },
    EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro (€)' },
    CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar (C$)' },
    AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar (A$)' },
    JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen (¥)' },
    INR: { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee (₹)' },
    ZAR: { code: 'ZAR', symbol: 'R', locale: 'en-ZA', name: 'South African Rand (R)' },
    KES: { code: 'KES', symbol: 'KSh', locale: 'en-KE', name: 'Kenyan Shilling (KSh)' },
    GHS: { code: 'GHS', symbol: 'GH₵', locale: 'en-GH', name: 'Ghanaian Cedi (GH₵)' },
    AED: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE', name: 'UAE Dirham (د.إ)' }
  };

  // Category Configuration & Colors (Direct values - No CSS Variables)
  const EXPENSE_CATEGORIES = [
    { name: 'Food & Dining', color: '#f97316', icon: '🍔' },
    { name: 'Housing & Rent', color: '#3b82f6', icon: '🏠' },
    { name: 'Transportation', color: '#8b5cf6', icon: '🚗' },
    { name: 'Utilities & Bills', color: '#06b6d4', icon: '⚡' },
    { name: 'Shopping & Goods', color: '#ec4899', icon: '🛍️' },
    { name: 'Entertainment', color: '#a855f7', icon: '🎮' },
    { name: 'Health & Medical', color: '#10b981', icon: '💊' },
    { name: 'Education & Books', color: '#6366f1', icon: '📚' },
    { name: 'Travel & Vacations', color: '#eab308', icon: '✈️' },
    { name: 'Other Expense', color: '#64748b', icon: '📦' }
  ];

  const INCOME_CATEGORIES = [
    { name: 'Salary & Wages', color: '#10b981', icon: '💼' },
    { name: 'Freelance & Gigs', color: '#059669', icon: '💻' },
    { name: 'Investments', color: '#14b8a6', icon: '📈' },
    { name: 'Side Business', color: '#3b82f6', icon: '🚀' },
    { name: 'Gifts & Bonus', color: '#f59e0b', icon: '🎁' },
    { name: 'Other Income', color: '#64748b', icon: '💰' }
  ];

  // App State
  let transactions = [];
  let monthlyBudget = 3500;
  let currentCurrency = 'USD';
  let activePeriod = 'all'; // 'all', 'month', 'week', 'year'
  let searchQuery = '';
  let filterType = 'all';
  let filterCategory = 'all';
  let sortBy = 'date-desc';

  // Canvas Hover State
  let barHoverIndex = -1;
  let currentChartBars = []; // Array of bar bounding coordinates for tooltips

  // DOM Elements Cache
  const elements = {
    currentDateBadge: document.getElementById('currentDateBadge'),
    currencySelect: document.getElementById('currencySelect'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    resetDemoBtn: document.getElementById('resetDemoBtn'),
    timeframeBtns: document.querySelectorAll('.timeframe-btn'),
    activeFilterLabel: document.getElementById('activeFilterLabel'),

    // KPIs
    netBalanceVal: document.getElementById('netBalanceVal'),
    netSavingsRate: document.getElementById('netSavingsRate'),
    totalIncomeVal: document.getElementById('totalIncomeVal'),
    incomeCountVal: document.getElementById('incomeCountVal'),
    totalExpenseVal: document.getElementById('totalExpenseVal'),
    expenseCountVal: document.getElementById('expenseCountVal'),
    budgetSpentVal: document.getElementById('budgetSpentVal'),
    budgetCapVal: document.getElementById('budgetCapVal'),
    budgetProgressBar: document.getElementById('budgetProgressBar'),
    budgetStatusText: document.getElementById('budgetStatusText'),
    editBudgetBtn: document.getElementById('editBudgetBtn'),

    // Insights
    topSpendingCategory: document.getElementById('topSpendingCategory'),
    dailyAvgSpending: document.getElementById('dailyAvgSpending'),
    largestExpenseVal: document.getElementById('largestExpenseVal'),
    activeRecordsCount: document.getElementById('activeRecordsCount'),

    // Charts
    cashFlowCanvas: document.getElementById('cashFlowCanvas'),
    chartTooltip: document.getElementById('chartTooltip'),
    categoryDonutCanvas: document.getElementById('categoryDonutCanvas'),
    donutCenterTotal: document.getElementById('donutCenterTotal'),
    categoryLegendList: document.getElementById('categoryLegendList'),
    categoryCountBadge: document.getElementById('categoryCountBadge'),

    // Table Controls
    filteredCountBadge: document.getElementById('filteredCountBadge'),
    searchInput: document.getElementById('searchInput'),
    typeFilter: document.getElementById('typeFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortBy: document.getElementById('sortBy'),
    transactionsTable: document.getElementById('transactionsTable'),
    transactionsTableBody: document.getElementById('transactionsTableBody'),
    emptyState: document.getElementById('emptyState'),
    emptyAddBtn: document.getElementById('emptyAddBtn'),

    // Modal
    transactionModal: document.getElementById('transactionModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    transactionForm: document.getElementById('transactionForm'),
    editingId: document.getElementById('editingId'),
    txTitle: document.getElementById('txTitle'),
    txAmount: document.getElementById('txAmount'),
    txAmountCurrencyLabel: document.getElementById('txAmountCurrencyLabel'),
    txCategory: document.getElementById('txCategory'),
    txDate: document.getElementById('txDate'),
    txPaymentMethod: document.getElementById('txPaymentMethod'),
    txNotes: document.getElementById('txNotes'),
    titleError: document.getElementById('titleError'),
    amountError: document.getElementById('amountError'),
    dateError: document.getElementById('dateError'),

    // Budget Modal
    budgetModal: document.getElementById('budgetModal'),
    budgetForm: document.getElementById('budgetForm'),
    budgetInput: document.getElementById('budgetInput'),
    budgetCurrencyLabel: document.getElementById('budgetCurrencyLabel'),
    closeBudgetModalBtn: document.getElementById('closeBudgetModalBtn'),
    cancelBudgetBtn: document.getElementById('cancelBudgetBtn'),

    // Toast
    toast: document.getElementById('toast')
  };

  // ==========================================================================
  // Sample Data Generation
  // ==========================================================================
  function generateDefaultDemoTransactions() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const formatDateStr = (year, month, day) => {
      const m = String(month + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      return `${year}-${m}-${d}`;
    };

    return [
      {
        id: 'tx_demo_1',
        title: 'Monthly Tech Salary',
        amount: 4800.0,
        type: 'income',
        category: 'Salary & Wages',
        date: formatDateStr(currentYear, currentMonth, 1),
        paymentMethod: 'Bank Transfer',
        notes: 'Direct deposit primary pay'
      },
      {
        id: 'tx_demo_2',
        title: 'Apartment Rent & Service',
        amount: 1450.0,
        type: 'expense',
        category: 'Housing & Rent',
        date: formatDateStr(currentYear, currentMonth, 2),
        paymentMethod: 'Bank Transfer',
        notes: 'Monthly residence payment'
      },
      {
        id: 'tx_demo_3',
        title: 'Supermarket Grocery Haul',
        amount: 168.45,
        type: 'expense',
        category: 'Food & Dining',
        date: formatDateStr(currentYear, currentMonth, 3),
        paymentMethod: 'Credit Card',
        notes: 'Organic groceries & weekly essentials'
      },
      {
        id: 'tx_demo_4',
        title: 'Freelance UI/UX Project',
        amount: 950.0,
        type: 'income',
        category: 'Freelance & Gigs',
        date: formatDateStr(currentYear, currentMonth, 5),
        paymentMethod: 'PayPal',
        notes: 'Design tokens & dashboard prototypes'
      },
      {
        id: 'tx_demo_5',
        title: 'High-speed Fiber Internet & Electricity',
        amount: 115.3,
        type: 'expense',
        category: 'Utilities & Bills',
        date: formatDateStr(currentYear, currentMonth, 7),
        paymentMethod: 'Debit Card',
        notes: 'Utilities autopay'
      },
      {
        id: 'tx_demo_6',
        title: 'Dining out at Bistro',
        amount: 84.5,
        type: 'expense',
        category: 'Food & Dining',
        date: formatDateStr(currentYear, currentMonth, 10),
        paymentMethod: 'Credit Card',
        notes: 'Weekend dinner with colleagues'
      },
      {
        id: 'tx_demo_7',
        title: 'Metro Transit Monthly Pass',
        amount: 78.0,
        type: 'expense',
        category: 'Transportation',
        date: formatDateStr(currentYear, currentMonth, 12),
        paymentMethod: 'Credit Card',
        notes: 'Commuting recharge'
      },
      {
        id: 'tx_demo_8',
        title: 'Mechanical Keyboard & Desk Mat',
        amount: 189.99,
        type: 'expense',
        category: 'Shopping & Goods',
        date: formatDateStr(currentYear, currentMonth, 15),
        paymentMethod: 'Credit Card',
        notes: 'Ergonomic workspace upgrade'
      },
      {
        id: 'tx_demo_9',
        title: 'Stock Dividend Yield',
        amount: 135.2,
        type: 'income',
        category: 'Investments',
        date: formatDateStr(currentYear, currentMonth, 18),
        paymentMethod: 'Bank Transfer',
        notes: 'Q4 Index fund payout'
      },
      {
        id: 'tx_demo_10',
        title: 'Cinema & Streaming Services',
        amount: 42.0,
        type: 'expense',
        category: 'Entertainment',
        date: formatDateStr(currentYear, currentMonth, 21),
        paymentMethod: 'Credit Card',
        notes: 'Digital subscriptions'
      },
      {
        id: 'tx_demo_11',
        title: 'Annual Dental Checkup',
        amount: 120.0,
        type: 'expense',
        category: 'Health & Medical',
        date: formatDateStr(currentYear, currentMonth, 24),
        paymentMethod: 'Debit Card',
        notes: 'Routine cleaning'
      },
      {
        id: 'tx_demo_12',
        title: 'Web Dev & Architecture Masterclass',
        amount: 95.0,
        type: 'expense',
        category: 'Education & Books',
        date: formatDateStr(currentYear, currentMonth, 27),
        paymentMethod: 'PayPal',
        notes: 'Professional skill development'
      }
    ];
  }

  // ==========================================================================
  // Storage Management
  // ==========================================================================
  function loadFromStorage() {
    try {
      const storedTx = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (storedTx) {
        transactions = JSON.parse(storedTx);
      } else {
        transactions = generateDefaultDemoTransactions();
        saveTransactions();
      }

      const storedBudget = localStorage.getItem(STORAGE_KEY_BUDGET);
      if (storedBudget) {
        monthlyBudget = parseFloat(storedBudget) || 3500;
      }

      const storedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (storedCurrency && CURRENCIES[storedCurrency]) {
        currentCurrency = storedCurrency;
      }
      if (elements.currencySelect) {
        elements.currencySelect.value = currentCurrency;
      }
      updateCurrencyLabels();
    } catch (e) {
      console.warn('WebStorage access error:', e);
      transactions = generateDefaultDemoTransactions();
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
      showToast('Could not save data to WebStorage', true);
    }
  }

  function saveBudget() {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, monthlyBudget.toString());
    } catch (e) {
      console.error('Failed to write budget', e);
    }
  }

  function saveCurrency() {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, currentCurrency);
    } catch (e) {
      console.error('Failed to write currency', e);
    }
  }

  function updateCurrencyLabels() {
    const curr = CURRENCIES[currentCurrency] || CURRENCIES.USD;
    if (elements.txAmountCurrencyLabel) {
      elements.txAmountCurrencyLabel.textContent = curr.symbol;
    }
    if (elements.budgetCurrencyLabel) {
      elements.budgetCurrencyLabel.textContent = curr.symbol;
    }
  }

  function setCurrency(newCode) {
    if (CURRENCIES[newCode] && newCode !== currentCurrency) {
      currentCurrency = newCode;
      saveCurrency();
      updateCurrencyLabels();
      refreshDashboard();
      showToast(`Switched currency to ${CURRENCIES[newCode].name}`);
    }
  }

  // ==========================================================================
  // Toast Notification
  // ==========================================================================
  let toastTimer = null;
  function showToast(message, isError = false) {
    if (toastTimer) clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.style.borderColor = isError ? '#ef4444' : '#334155';
    elements.toast.style.backgroundColor = isError ? '#451a1a' : '#1e293b';
    elements.toast.classList.add('show');
    toastTimer = setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2800);
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================
  function formatCurrency(val, compact = false) {
    const curr = CURRENCIES[currentCurrency] || CURRENCIES.USD;
    const num = Number(val) || 0;
    const sign = num < 0 ? '-' : '';
    const absNum = Math.abs(num);

    if (compact && absNum >= 1000) {
      if (absNum >= 1000000) {
        return `${sign}${curr.symbol}${(absNum / 1000000).toFixed(1)}M`;
      }
      return `${sign}${curr.symbol}${(absNum / 1000).toFixed(1)}k`;
    }

    const minDigits = curr.code === 'JPY' ? 0 : 2;
    const maxDigits = curr.code === 'JPY' ? 0 : 2;

    try {
      return new Intl.NumberFormat(curr.locale, {
        style: 'currency',
        currency: curr.code,
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits
      }).format(num);
    } catch (e) {
      return `${sign}${curr.symbol}${absNum.toLocaleString('en-US', {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits
      })}`;
    }
  }

  function getCategoryMeta(catName, type) {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const match = list.find(c => c.name.toLowerCase() === catName.toLowerCase());
    if (match) return match;
    const fallbackList = type === 'income' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const fallback = fallbackList.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return fallback || { name: catName, color: '#64748b', icon: '🏷️' };
  }

  // Filter transactions by active period
  function getPeriodFilteredTransactions() {
    const now = new Date();
    return transactions.filter(tx => {
      const txDate = new Date(tx.date + 'T00:00:00');
      if (isNaN(txDate.getTime())) return true;

      if (activePeriod === 'month') {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      } else if (activePeriod === 'week') {
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay() || 7;
        startOfWeek.setDate(startOfWeek.getDate() - day + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return txDate >= startOfWeek && txDate <= endOfWeek;
      } else if (activePeriod === 'year') {
        return txDate.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    });
  }

  // Filter and sort for the data table
  function getTableFilteredTransactions() {
    const periodData = getPeriodFilteredTransactions();

    return periodData.filter(tx => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && tx.category !== filterCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const inTitle = (tx.title || '').toLowerCase().includes(q);
        const inCat = (tx.category || '').toLowerCase().includes(q);
        const inNotes = (tx.notes || '').toLowerCase().includes(q);
        const inPayment = (tx.paymentMethod || '').toLowerCase().includes(q);
        if (!inTitle && !inCat && !inNotes && !inPayment) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      } else if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }

  // ==========================================================================
  // Render KPI Metrics & Analytical Insights
  // ==========================================================================
  function renderMetrics(periodData) {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const categorySpending = {};
    const expenseDates = new Set();
    let largestExpense = 0;

    periodData.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
        incomeCount++;
      } else {
        totalExpense += amt;
        expenseCount++;
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + amt;
        expenseDates.add(tx.date);
        if (amt > largestExpense) {
          largestExpense = amt;
        }
      }
    });

    const netBalance = totalIncome - totalExpense;
    let savingsRate = 0;
    if (totalIncome > 0) {
      savingsRate = Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
    }

    // Top Level KPI Cards
    elements.netBalanceVal.textContent = formatCurrency(netBalance);
    elements.netBalanceVal.style.color = netBalance >= 0 ? '#ffffff' : '#ef4444';
    elements.netSavingsRate.textContent = `Savings Rate: ${savingsRate}%`;

    elements.totalIncomeVal.textContent = formatCurrency(totalIncome);
    elements.incomeCountVal.textContent = `${incomeCount} record${incomeCount === 1 ? '' : 's'}`;

    elements.totalExpenseVal.textContent = formatCurrency(totalExpense);
    elements.expenseCountVal.textContent = `${expenseCount} record${expenseCount === 1 ? '' : 's'}`;

    // Monthly Budget Status
    // For budget calculation, we check the current month's expenses specifically
    const now = new Date();
    const currentMonthExpenses = transactions
      .filter(tx => {
        if (tx.type !== 'expense') return false;
        const d = new Date(tx.date + 'T00:00:00');
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    elements.budgetSpentVal.textContent = formatCurrency(currentMonthExpenses);
    elements.budgetCapVal.textContent = `/ ${formatCurrency(monthlyBudget)}`;

    const budgetPercent = Math.min(Math.round((currentMonthExpenses / monthlyBudget) * 100), 100);
    elements.budgetProgressBar.style.width = `${budgetPercent}%`;
    elements.budgetStatusText.textContent = `${Math.round((currentMonthExpenses / monthlyBudget) * 100)}% of monthly target`;

    if (currentMonthExpenses > monthlyBudget) {
      elements.budgetProgressBar.classList.add('danger');
      elements.budgetStatusText.style.color = '#ef4444';
      elements.budgetStatusText.textContent = `Over limit by ${formatCurrency(currentMonthExpenses - monthlyBudget)}`;
    } else {
      elements.budgetProgressBar.classList.remove('danger');
      elements.budgetStatusText.style.color = '#94a3b8';
    }

    // Analytical Insights Strip
    let topCatName = 'None';
    let topCatVal = 0;
    for (const [cat, sum] of Object.entries(categorySpending)) {
      if (sum > topCatVal) {
        topCatVal = sum;
        topCatName = cat;
      }
    }
    elements.topSpendingCategory.textContent = topCatVal > 0 ? `${topCatName} (${formatCurrency(topCatVal)})` : 'None';

    const daysCount = Math.max(expenseDates.size, 1);
    const dailyAvg = totalExpense / daysCount;
    elements.dailyAvgSpending.textContent = formatCurrency(dailyAvg);

    elements.largestExpenseVal.textContent = formatCurrency(largestExpense);
    elements.activeRecordsCount.textContent = periodData.length.toString();
  }

  // ==========================================================================
  // Custom High-DPI Canvas Charts (100% Vanilla JS, No CSS Variables)
  // ==========================================================================

  // Setup canvas resolution for crisp Retina displays
  function setupRetinaCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width || 300;
    const height = rect.height || 260;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);
    return { ctx, width, height, dpr };
  }

  // 1. Cash Flow Dynamics Bar Chart
  function renderCashFlowChart(periodData) {
    const canvas = elements.cashFlowCanvas;
    if (!canvas || !canvas.parentElement) return;

    const { ctx, width, height } = setupRetinaCanvas(canvas);
    currentChartBars = [];

    // Bucket aggregation based on period
    const buckets = {};
    const now = new Date();

    if (activePeriod === 'week') {
      // 7 days of the week: Mon - Sun
      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      dayLabels.forEach(d => { buckets[d] = { label: d, income: 0, expense: 0 }; });

      periodData.forEach(tx => {
        const d = new Date(tx.date + 'T00:00:00');
        const dayIdx = (d.getDay() + 6) % 7; // Monday = 0
        const label = dayLabels[dayIdx];
        if (buckets[label]) {
          if (tx.type === 'income') buckets[label].income += Number(tx.amount) || 0;
          else buckets[label].expense += Number(tx.amount) || 0;
        }
      });
    } else if (activePeriod === 'month') {
      // 4-5 weekly buckets in the month
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      weeks.forEach(w => { buckets[w] = { label: w, income: 0, expense: 0 }; });

      periodData.forEach(tx => {
        const d = new Date(tx.date + 'T00:00:00');
        const dayOfMonth = d.getDate();
        const weekIdx = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);
        const wLabel = weeks[weekIdx];
        if (buckets[wLabel]) {
          if (tx.type === 'income') buckets[wLabel].income += Number(tx.amount) || 0;
          else buckets[wLabel].expense += Number(tx.amount) || 0;
        }
      });
    } else {
      // 'all' or 'year': 12 Months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthNames.forEach(m => { buckets[m] = { label: m, income: 0, expense: 0 }; });

      periodData.forEach(tx => {
        const d = new Date(tx.date + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          const mLabel = monthNames[d.getMonth()];
          if (buckets[mLabel]) {
            if (tx.type === 'income') buckets[mLabel].income += Number(tx.amount) || 0;
            else buckets[mLabel].expense += Number(tx.amount) || 0;
          }
        }
      });
    }

    const dataPoints = Object.values(buckets);

    // Filter out trailing empty months if 'all' time has only recent months
    let displayPoints = dataPoints;
    if (activePeriod === 'all' && displayPoints.length > 6) {
      // Keep months with non-zero or current season
      const hasAnyData = displayPoints.some(p => p.income > 0 || p.expense > 0);
      if (!hasAnyData) displayPoints = displayPoints.slice(0, 6);
    }

    // Chart Layout Dimensions
    const paddingLeft = 65;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Determine max value for scale
    let maxVal = 100;
    displayPoints.forEach(p => {
      if (p.income > maxVal) maxVal = p.income;
      if (p.expense > maxVal) maxVal = p.expense;
    });
    // Add 20% headroom and round nicely
    maxVal = Math.ceil((maxVal * 1.25) / 100) * 100;

    // Draw horizontal grid lines & Y-axis labels
    const gridSteps = 4;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';

    for (let i = 0; i <= gridSteps; i++) {
      const yVal = (maxVal / gridSteps) * i;
      const yPos = paddingTop + chartHeight - (chartHeight * (i / gridSteps));

      // Grid line
      ctx.beginPath();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.setLineDash(i === 0 ? [] : [4, 4]);
      ctx.moveTo(paddingLeft, yPos);
      ctx.lineTo(paddingLeft + chartWidth, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis text
      ctx.fillStyle = '#64748b';
      const formattedY = formatCurrency(yVal, true);
      ctx.fillText(formattedY, paddingLeft - 10, yPos);
    }

    // Draw grouped bars
    const groupCount = displayPoints.length;
    const groupWidth = chartWidth / groupCount;
    const barWidth = Math.min(Math.max(groupWidth * 0.28, 8), 24);
    const barGap = 4;

    displayPoints.forEach((p, idx) => {
      const groupCenterX = paddingLeft + (idx * groupWidth) + (groupWidth / 2);

      // Income bar coords
      const incomeX = groupCenterX - barWidth - (barGap / 2);
      const incomeHeight = Math.max((p.income / maxVal) * chartHeight, 0);
      const incomeY = paddingTop + chartHeight - incomeHeight;

      // Expense bar coords
      const expenseX = groupCenterX + (barGap / 2);
      const expenseHeight = Math.max((p.expense / maxVal) * chartHeight, 0);
      const expenseY = paddingTop + chartHeight - expenseHeight;

      // Save for hover detection
      currentChartBars.push({
        index: idx,
        label: p.label,
        income: p.income,
        expense: p.expense,
        groupCenterX,
        xMin: groupCenterX - (groupWidth / 2),
        xMax: groupCenterX + (groupWidth / 2)
      });

      const isHovered = barHoverIndex === idx;

      // Draw Income Bar
      if (incomeHeight > 0) {
        ctx.beginPath();
        drawRoundedRect(ctx, incomeX, incomeY, barWidth, incomeHeight, 4);
        ctx.fillStyle = isHovered ? '#34d399' : '#10b981';
        ctx.fill();
      }

      // Draw Expense Bar
      if (expenseHeight > 0) {
        ctx.beginPath();
        drawRoundedRect(ctx, expenseX, expenseY, barWidth, expenseHeight, 4);
        ctx.fillStyle = isHovered ? '#f87171' : '#ef4444';
        ctx.fill();
      }

      // X-axis label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isHovered ? '#ffffff' : '#94a3b8';
      ctx.font = isHovered ? '600 11px Plus Jakarta Sans, sans-serif' : '500 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(p.label, groupCenterX, paddingTop + chartHeight + 10);
    });
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < radius) radius = height / 2;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // 2. Expense Category Donut Chart
  function renderCategoryDonut(periodData) {
    const canvas = elements.categoryDonutCanvas;
    if (!canvas || !canvas.parentElement) return;

    const { ctx, width, height } = setupRetinaCanvas(canvas);

    // Sum expenses by category
    const categoryTotals = {};
    let totalExpense = 0;

    periodData.forEach(tx => {
      if (tx.type === 'expense') {
        const amt = Number(tx.amount) || 0;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
        totalExpense += amt;
      }
    });

    elements.donutCenterTotal.textContent = formatCurrency(totalExpense);
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    elements.categoryCountBadge.textContent = `${sortedCategories.length} Categories`;

    // Center & radius
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 10;
    const innerRadius = outerRadius * 0.68;

    if (totalExpense === 0 || sortedCategories.length === 0) {
      // Empty grey placeholder circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      elements.categoryLegendList.innerHTML = `
        <div style="text-align:center; padding: 20px; color: #64748b; font-size: 12px;">
          No expenses recorded in this period
        </div>
      `;
      return;
    }

    let startAngle = -Math.PI / 2;
    const legendHtml = [];

    sortedCategories.forEach(([catName, amt]) => {
      const meta = getCategoryMeta(catName, 'expense');
      const sliceAngle = (amt / totalExpense) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;
      const percent = Math.round((amt / totalExpense) * 100);

      // Draw Donut Slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle, false);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = meta.color;
      ctx.fill();

      // Thin separation line
      ctx.strokeStyle = '#131c2e';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      startAngle = endAngle;

      // Legend Row Item
      legendHtml.push(`
        <div class="cat-legend-row" title="${catName}: ${formatCurrency(amt)} (${percent}%)">
          <div class="cat-legend-left">
            <span class="cat-dot" style="background-color: ${meta.color}"></span>
            <span>${catName}</span>
          </div>
          <div class="cat-legend-right">
            <span class="cat-amount">${formatCurrency(amt)}</span>
            <span class="cat-percent">${percent}%</span>
          </div>
        </div>
      `);
    });

    elements.categoryLegendList.innerHTML = legendHtml.join('');
  }

  // ==========================================================================
  // Render Data Table
  // ==========================================================================
  function renderTransactionsTable() {
    const tableData = getTableFilteredTransactions();
    elements.filteredCountBadge.textContent = `${tableData.length} items`;

    if (tableData.length === 0) {
      elements.transactionsTableBody.innerHTML = '';
      elements.emptyState.style.display = 'block';
      return;
    }

    elements.emptyState.style.display = 'none';

    const rows = tableData.map(tx => {
      const isIncome = tx.type === 'income';
      const meta = getCategoryMeta(tx.category, tx.type);
      const formattedDate = formatDateDisplay(tx.date);

      return `
        <tr data-id="${tx.id}">
          <td>
            <div class="tx-title-cell">
              <div class="tx-icon-badge" style="background-color: ${isIncome ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};">
                ${meta.icon}
              </div>
              <div class="tx-info">
                <span class="tx-name">${escapeHTML(tx.title)}</span>
                ${tx.notes ? `<span class="tx-note">${escapeHTML(tx.notes)}</span>` : ''}
              </div>
            </div>
          </td>
          <td>
            <span class="category-tag" style="background-color: ${meta.color}22; color: ${meta.color}; border: 1px solid ${meta.color}44;">
              ${escapeHTML(tx.category)}
            </span>
          </td>
          <td>${formattedDate}</td>
          <td>
            <span class="payment-method-pill">${escapeHTML(tx.paymentMethod || 'Other')}</span>
          </td>
          <td class="text-right">
            <span class="tx-amount ${isIncome ? 'positive' : 'negative'}">
              ${isIncome ? '+' : '-'} ${formatCurrency(Number(tx.amount) || 0)}
            </span>
          </td>
          <td class="text-center">
            <div class="action-buttons">
              <button class="btn-icon edit-btn" data-id="${tx.id}" title="Edit transaction">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon delete-btn" data-id="${tx.id}" title="Delete transaction">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    elements.transactionsTableBody.innerHTML = rows;

    // Attach row action listeners
    elements.transactionsTableBody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditModal(id);
      });
    });

    elements.transactionsTableBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteTransaction(id);
      });
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  }

  // Populate dynamic category selector in form and filter dropdown
  function populateCategoryFilterDropdown() {
    const categories = new Set();
    transactions.forEach(t => {
      if (t.category) categories.add(t.category);
    });

    const currentVal = elements.categoryFilter.value;
    let optionsHtml = '<option value="all">All Categories</option>';
    Array.from(categories).sort().forEach(cat => {
      optionsHtml += `<option value="${escapeHTML(cat)}">${escapeHTML(cat)}</option>`;
    });

    elements.categoryFilter.innerHTML = optionsHtml;
    if (categories.has(currentVal)) {
      elements.categoryFilter.value = currentVal;
    } else {
      elements.categoryFilter.value = 'all';
    }
  }

  function populateFormCategorySelect(type, selectedCategory = '') {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    let html = '';
    list.forEach(c => {
      const isSel = c.name === selectedCategory ? 'selected' : '';
      html += `<option value="${c.name}" ${isSel}>${c.icon} ${c.name}</option>`;
    });
    elements.txCategory.innerHTML = html;
  }

  // ==========================================================================
  // Core Refresh Coordinator
  // ==========================================================================
  function refreshDashboard() {
    const periodData = getPeriodFilteredTransactions();

    renderMetrics(periodData);
    renderCashFlowChart(periodData);
    renderCategoryDonut(periodData);
    renderTransactionsTable();
    populateCategoryFilterDropdown();
  }

  // ==========================================================================
  // Modal Handlers & CRUD Operations
  // ==========================================================================
  function openAddModal() {
    elements.editingId.value = '';
    elements.modalTitle.textContent = 'Add Transaction';
    elements.transactionForm.reset();

    // Default to expense
    const expenseRadio = elements.transactionForm.querySelector('input[name="txType"][value="expense"]');
    if (expenseRadio) expenseRadio.checked = true;
    populateFormCategorySelect('expense');

    // Default date to today (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    elements.txDate.value = today;

    clearFormErrors();
    elements.transactionModal.classList.add('active');
    elements.transactionModal.setAttribute('aria-hidden', 'false');
    elements.txTitle.focus();
  }

  function openEditModal(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    elements.editingId.value = tx.id;
    elements.modalTitle.textContent = 'Edit Transaction';

    const typeRadio = elements.transactionForm.querySelector(`input[name="txType"][value="${tx.type}"]`);
    if (typeRadio) typeRadio.checked = true;

    populateFormCategorySelect(tx.type, tx.category);

    elements.txTitle.value = tx.title || '';
    elements.txAmount.value = tx.amount || '';
    elements.txDate.value = tx.date || '';
    elements.txPaymentMethod.value = tx.paymentMethod || 'Credit Card';
    elements.txNotes.value = tx.notes || '';

    clearFormErrors();
    elements.transactionModal.classList.add('active');
    elements.transactionModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    elements.transactionModal.classList.remove('active');
    elements.transactionModal.setAttribute('aria-hidden', 'true');
    clearFormErrors();
  }

  function clearFormErrors() {
    elements.titleError.textContent = '';
    elements.amountError.textContent = '';
    elements.dateError.textContent = '';
  }

  function handleTransactionFormSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const title = elements.txTitle.value.trim();
    const amountStr = elements.txAmount.value.trim();
    const amount = parseFloat(amountStr);
    const date = elements.txDate.value;
    const category = elements.txCategory.value;
    const paymentMethod = elements.txPaymentMethod.value;
    const notes = elements.txNotes.value.trim();
    const type = elements.transactionForm.querySelector('input[name="txType"]:checked').value;
    const editingId = elements.editingId.value;

    let hasError = false;
    if (!title) {
      elements.titleError.textContent = 'Please enter a title or description.';
      hasError = true;
    }
    if (isNaN(amount) || amount <= 0) {
      elements.amountError.textContent = 'Please provide a valid amount above $0.00.';
      hasError = true;
    }
    if (!date) {
      elements.dateError.textContent = 'Please select a transaction date.';
      hasError = true;
    }

    if (hasError) return;

    if (editingId) {
      // Update existing
      const idx = transactions.findIndex(t => t.id === editingId);
      if (idx !== -1) {
        transactions[idx] = {
          ...transactions[idx],
          title,
          amount,
          type,
          category,
          date,
          paymentMethod,
          notes
        };
        showToast('Transaction updated successfully');
      }
    } else {
      // Create new
      const newTx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title,
        amount,
        type,
        category,
        date,
        paymentMethod,
        notes
      };
      transactions.unshift(newTx);
      showToast('Transaction added successfully');
    }

    saveTransactions();
    closeModal();
    refreshDashboard();
  }

  function deleteTransaction(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    if (confirm(`Are you sure you want to delete "${tx.title}" (${formatCurrency(tx.amount)})?`)) {
      transactions = transactions.filter(t => t.id !== id);
      saveTransactions();
      refreshDashboard();
      showToast('Transaction deleted');
    }
  }

  // ==========================================================================
  // Budget Modal Handlers
  // ==========================================================================
  function openBudgetModal() {
    elements.budgetInput.value = monthlyBudget;
    elements.budgetModal.classList.add('active');
    elements.budgetModal.setAttribute('aria-hidden', 'false');
    elements.budgetInput.focus();
  }

  function closeBudgetModal() {
    elements.budgetModal.classList.remove('active');
    elements.budgetModal.setAttribute('aria-hidden', 'true');
  }

  function handleBudgetSubmit(e) {
    e.preventDefault();
    const val = parseFloat(elements.budgetInput.value);
    if (!isNaN(val) && val >= 50) {
      monthlyBudget = val;
      saveBudget();
      closeBudgetModal();
      refreshDashboard();
      showToast('Monthly budget target updated');
    }
  }

  // ==========================================================================
  // Export Data as CSV
  // ==========================================================================
  function exportToCSV() {
    if (transactions.length === 0) {
      showToast('No transactions to export', true);
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Category', 'Title', 'Amount', 'Payment Method', 'Notes'];
    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      Number(t.amount).toFixed(2),
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `trackpulse_expenses_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported transactions CSV');
  }

  // Reset sample records
  function resetSampleData() {
    if (confirm('Reset to original sample dataset? All custom edits will be replaced.')) {
      transactions = generateDefaultDemoTransactions();
      monthlyBudget = 3500;
      saveTransactions();
      saveBudget();
      refreshDashboard();
      showToast('Sample data restored');
    }
  }

  // ==========================================================================
  // Event Listeners Setup
  // ==========================================================================
  function initEventListeners() {
    // Current Date Display
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    elements.currentDateBadge.textContent = new Date().toLocaleDateString('en-US', options);

    // Currency Switcher
    if (elements.currencySelect) {
      elements.currencySelect.addEventListener('change', (e) => {
        setCurrency(e.target.value);
      });
    }

    // Modal Triggers
    elements.openAddModalBtn.addEventListener('click', openAddModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelModalBtn.addEventListener('click', closeModal);
    elements.transactionForm.addEventListener('submit', handleTransactionFormSubmit);
    elements.emptyAddBtn.addEventListener('click', openAddModal);

    // Dynamic type switcher in form
    elements.transactionForm.querySelectorAll('input[name="txType"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        populateFormCategorySelect(e.target.value);
      });
    });

    // Budget Modal Triggers
    elements.editBudgetBtn.addEventListener('click', openBudgetModal);
    elements.closeBudgetModalBtn.addEventListener('click', closeBudgetModal);
    elements.cancelBudgetBtn.addEventListener('click', closeBudgetModal);
    elements.budgetForm.addEventListener('submit', handleBudgetSubmit);

    // Close modals on backdrop click or ESC key
    window.addEventListener('click', (e) => {
      if (e.target === elements.transactionModal) closeModal();
      if (e.target === elements.budgetModal) closeBudgetModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeBudgetModal();
      }
    });

    // Timeframe selector
    elements.timeframeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.timeframeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePeriod = btn.getAttribute('data-period');

        const labels = {
          all: 'Showing all historical records',
          month: 'Showing current month records',
          week: 'Showing current week records',
          year: 'Showing current year records'
        };
        elements.activeFilterLabel.textContent = labels[activePeriod] || 'Showing records';
        refreshDashboard();
      });
    });

    // Table Filters & Search
    elements.searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTransactionsTable();
    });

    elements.typeFilter.addEventListener('change', (e) => {
      filterType = e.target.value;
      renderTransactionsTable();
    });

    elements.categoryFilter.addEventListener('change', (e) => {
      filterCategory = e.target.value;
      renderTransactionsTable();
    });

    elements.sortBy.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderTransactionsTable();
    });

    // Export & Reset
    elements.exportDataBtn.addEventListener('click', exportToCSV);
    elements.resetDemoBtn.addEventListener('click', resetSampleData);

    // Interactive Hover on Cash Flow Chart
    elements.cashFlowCanvas.addEventListener('mousemove', (e) => {
      const rect = elements.cashFlowCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let matchedIndex = -1;
      let matchedData = null;

      for (let i = 0; i < currentChartBars.length; i++) {
        const bar = currentChartBars[i];
        if (mouseX >= bar.xMin && mouseX <= bar.xMax) {
          matchedIndex = bar.index;
          matchedData = bar;
          break;
        }
      }

      if (matchedIndex !== barHoverIndex) {
        barHoverIndex = matchedIndex;
        renderCashFlowChart(getPeriodFilteredTransactions());
      }

      if (matchedData) {
        const tooltip = elements.chartTooltip;
        tooltip.style.display = 'block';
        tooltip.style.left = `${matchedData.groupCenterX}px`;
        tooltip.style.top = `${mouseY}px`;
        tooltip.innerHTML = `
          <strong>${matchedData.label}</strong><br>
          <span style="color:#10b981;">Income: ${formatCurrency(matchedData.income)}</span><br>
          <span style="color:#ef4444;">Expense: ${formatCurrency(matchedData.expense)}</span><br>
          <span style="color:#94a3b8;">Net: ${formatCurrency(matchedData.income - matchedData.expense)}</span>
        `;
      } else {
        elements.chartTooltip.style.display = 'none';
      }
    });

    elements.cashFlowCanvas.addEventListener('mouseleave', () => {
      if (barHoverIndex !== -1) {
        barHoverIndex = -1;
        renderCashFlowChart(getPeriodFilteredTransactions());
      }
      elements.chartTooltip.style.display = 'none';
    });

    // Resize listener for responsive canvas rerendering
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const periodData = getPeriodFilteredTransactions();
        renderCashFlowChart(periodData);
        renderCategoryDonut(periodData);
      }, 150);
    });
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    loadFromStorage();
    initEventListeners();
    refreshDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

