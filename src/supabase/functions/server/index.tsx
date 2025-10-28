import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper to verify user
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'Unauthorized: No token provided', userId: null };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    return { error: 'Unauthorized: Invalid token', userId: null };
  }
  
  return { userId: user.id, error: null };
}

// AI Categorization logic
function categorizTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  // Transport
  if (desc.includes('uber') || desc.includes('lyft') || desc.includes('taxi') || 
      desc.includes('bus') || desc.includes('metro') || desc.includes('gas') || desc.includes('fuel')) {
    return 'Transport';
  }
  
  // Food & Dining
  if (desc.includes('restaurant') || desc.includes('cafe') || desc.includes('starbucks') ||
      desc.includes('mcdonald') || desc.includes('pizza') || desc.includes('swiggy') ||
      desc.includes('zomato') || desc.includes('doordash') || desc.includes('uber eats')) {
    return 'Food & Dining';
  }
  
  // Shopping
  if (desc.includes('amazon') || desc.includes('walmart') || desc.includes('target') ||
      desc.includes('mall') || desc.includes('store') || desc.includes('shop')) {
    return 'Shopping';
  }
  
  // Entertainment
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('movie') ||
      desc.includes('theater') || desc.includes('game') || desc.includes('disney')) {
    return 'Entertainment';
  }
  
  // Utilities
  if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') ||
      desc.includes('phone') || desc.includes('bill')) {
    return 'Utilities';
  }
  
  // Healthcare
  if (desc.includes('doctor') || desc.includes('hospital') || desc.includes('pharmacy') ||
      desc.includes('medical') || desc.includes('health')) {
    return 'Healthcare';
  }
  
  // Education
  if (desc.includes('school') || desc.includes('course') || desc.includes('book') ||
      desc.includes('education') || desc.includes('tuition')) {
    return 'Education';
  }
  
  // Fitness
  if (desc.includes('gym') || desc.includes('fitness') || desc.includes('yoga') ||
      desc.includes('sport')) {
    return 'Fitness';
  }
  
  return 'Other';
}

// ============= PROFILE ROUTES =============

app.post('/make-server-9e45f1d5/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since email server not configured
    });
    
    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    // Initialize user profile
    await kv.set(`user:${data.user.id}:profile`, {
      name,
      email,
      currency: 'USD',
      theme: 'dark',
      createdAt: new Date().toISOString()
    });
    
    // Initialize empty data structures
    await kv.set(`user:${data.user.id}:transactions`, []);
    await kv.set(`user:${data.user.id}:budgets`, []);
    await kv.set(`user:${data.user.id}:goals`, []);
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Signup server error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-9e45f1d5/profile', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const profile = await kv.get(`user:${userId}:profile`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-9e45f1d5/profile', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${userId}:profile`) || {};
    const updatedProfile = { ...currentProfile, ...updates };
    
    await kv.set(`user:${userId}:profile`, updatedProfile);
    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= TRANSACTION ROUTES =============

app.get('/make-server-9e45f1d5/transactions', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    return c.json({ transactions });
  } catch (error) {
    console.log(`Get transactions error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-9e45f1d5/transactions', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const transaction = await c.req.json();
    
    // AI auto-categorization if not provided
    if (!transaction.category && transaction.description) {
      transaction.category = categorizTransaction(transaction.description);
    }
    
    const newTransaction = {
      id: crypto.randomUUID(),
      ...transaction,
      createdAt: new Date().toISOString()
    };
    
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    transactions.push(newTransaction);
    await kv.set(`user:${userId}:transactions`, transactions);
    
    return c.json({ success: true, transaction: newTransaction });
  } catch (error) {
    console.log(`Add transaction error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-9e45f1d5/transactions/:id', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const transactionId = c.req.param('id');
    const updates = await c.req.json();
    
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    const index = transactions.findIndex((t: any) => t.id === transactionId);
    
    if (index === -1) {
      return c.json({ error: 'Transaction not found' }, 404);
    }
    
    transactions[index] = { ...transactions[index], ...updates };
    await kv.set(`user:${userId}:transactions`, transactions);
    
    return c.json({ success: true, transaction: transactions[index] });
  } catch (error) {
    console.log(`Update transaction error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-9e45f1d5/transactions/:id', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const transactionId = c.req.param('id');
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    const filtered = transactions.filter((t: any) => t.id !== transactionId);
    
    await kv.set(`user:${userId}:transactions`, filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete transaction error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= BUDGET ROUTES =============

app.get('/make-server-9e45f1d5/budgets', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const budgets = await kv.get(`user:${userId}:budgets`) || [];
    return c.json({ budgets });
  } catch (error) {
    console.log(`Get budgets error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-9e45f1d5/budgets', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const budget = await c.req.json();
    const newBudget = {
      id: crypto.randomUUID(),
      ...budget,
      createdAt: new Date().toISOString()
    };
    
    const budgets = await kv.get(`user:${userId}:budgets`) || [];
    budgets.push(newBudget);
    await kv.set(`user:${userId}:budgets`, budgets);
    
    return c.json({ success: true, budget: newBudget });
  } catch (error) {
    console.log(`Add budget error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-9e45f1d5/budgets/:id', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const budgetId = c.req.param('id');
    const updates = await c.req.json();
    
    const budgets = await kv.get(`user:${userId}:budgets`) || [];
    const index = budgets.findIndex((b: any) => b.id === budgetId);
    
    if (index === -1) {
      return c.json({ error: 'Budget not found' }, 404);
    }
    
    budgets[index] = { ...budgets[index], ...updates };
    await kv.set(`user:${userId}:budgets`, budgets);
    
    return c.json({ success: true, budget: budgets[index] });
  } catch (error) {
    console.log(`Update budget error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-9e45f1d5/budgets/:id', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const budgetId = c.req.param('id');
    const budgets = await kv.get(`user:${userId}:budgets`) || [];
    const filtered = budgets.filter((b: any) => b.id !== budgetId);
    
    await kv.set(`user:${userId}:budgets`, filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete budget error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= GOALS ROUTES =============

app.get('/make-server-9e45f1d5/goals', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const goals = await kv.get(`user:${userId}:goals`) || [];
    return c.json({ goals });
  } catch (error) {
    console.log(`Get goals error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-9e45f1d5/goals', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const goal = await c.req.json();
    const newGoal = {
      id: crypto.randomUUID(),
      currentAmount: 0,
      ...goal,
      createdAt: new Date().toISOString()
    };
    
    const goals = await kv.get(`user:${userId}:goals`) || [];
    goals.push(newGoal);
    await kv.set(`user:${userId}:goals`, goals);
    
    return c.json({ success: true, goal: newGoal });
  } catch (error) {
    console.log(`Add goal error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-9e45f1d5/goals/:id', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const goalId = c.req.param('id');
    const updates = await c.req.json();
    
    const goals = await kv.get(`user:${userId}:goals`) || [];
    const index = goals.findIndex((g: any) => g.id === goalId);
    
    if (index === -1) {
      return c.json({ error: 'Goal not found' }, 404);
    }
    
    goals[index] = { ...goals[index], ...updates };
    await kv.set(`user:${userId}:goals`, goals);
    
    return c.json({ success: true, goal: goals[index] });
  } catch (error) {
    console.log(`Update goal error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-9e45f1d5/goals/:id', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const goalId = c.req.param('id');
    const goals = await kv.get(`user:${userId}:goals`) || [];
    const filtered = goals.filter((g: any) => g.id !== goalId);
    
    await kv.set(`user:${userId}:goals`, filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete goal error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= AI INSIGHTS ROUTES =============

app.get('/make-server-9e45f1d5/ai/predictions', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    
    // Calculate monthly averages for prediction
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get last 3 months of expenses
    const monthlyExpenses = [];
    for (let i = 1; i <= 3; i++) {
      const month = currentMonth - i;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const actualMonth = month < 0 ? month + 12 : month;
      
      const monthTotal = transactions
        .filter((t: any) => {
          if (t.type !== 'expense') return false;
          const tDate = new Date(t.date);
          return tDate.getMonth() === actualMonth && tDate.getFullYear() === year;
        })
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      monthlyExpenses.push(monthTotal);
    }
    
    // Simple moving average prediction
    const avgExpense = monthlyExpenses.reduce((a, b) => a + b, 0) / (monthlyExpenses.length || 1);
    const predictedNextMonth = Math.round(avgExpense * 1.05); // 5% buffer
    
    // Category-wise predictions
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    
    return c.json({
      predictedNextMonthExpense: predictedNextMonth,
      averageMonthlyExpense: Math.round(avgExpense),
      categoryPredictions: categoryTotals,
      trend: monthlyExpenses.length >= 2 && monthlyExpenses[0] > monthlyExpenses[1] ? 'increasing' : 'decreasing'
    });
  } catch (error) {
    console.log(`AI predictions error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-9e45f1d5/ai/recommendations', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    const budgets = await kv.get(`user:${userId}:budgets`) || [];
    
    const recommendations = [];
    
    // Analyze spending patterns
    const categorySpending: Record<string, number> = {};
    const now = new Date();
    const thisMonth = transactions.filter((t: any) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === now.getMonth() && 
             tDate.getFullYear() === now.getFullYear() &&
             t.type === 'expense';
    });
    
    thisMonth.forEach((t: any) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });
    
    // Find highest spending categories
    const sortedCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a);
    
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      recommendations.push({
        type: 'spending',
        title: `High ${topCategory} Spending`,
        message: `You've spent $${topAmount.toFixed(2)} on ${topCategory} this month. Consider setting a budget to track this better.`,
        priority: 'high'
      });
    }
    
    // Check budget compliance
    budgets.forEach((budget: any) => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;
      
      if (percentage > 90) {
        recommendations.push({
          type: 'budget',
          title: `${budget.category} Budget Alert`,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Consider reducing spending in this category.`,
          priority: 'critical'
        });
      } else if (percentage > 70) {
        recommendations.push({
          type: 'budget',
          title: `${budget.category} Budget Warning`,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. You're on track but approaching the limit.`,
          priority: 'medium'
        });
      }
    });
    
    // Saving recommendations
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    if (savingsRate < 20) {
      recommendations.push({
        type: 'savings',
        title: 'Improve Savings Rate',
        message: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
        priority: 'medium'
      });
    }
    
    return c.json({ recommendations });
  } catch (error) {
    console.log(`AI recommendations error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= ANALYTICS ROUTES =============

app.get('/make-server-9e45f1d5/analytics', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    
    // Calculate various analytics
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // This month's data
    const thisMonthTransactions = transactions.filter((t: any) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const thisMonthIncome = thisMonthTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const thisMonthExpenses = thisMonthTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    // Last month's data
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthTransactions = transactions.filter((t: any) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
    });
    
    const lastMonthExpenses = lastMonthTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    thisMonthTransactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });
    
    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = currentMonth - i;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const actualMonth = month < 0 ? month + 12 : month;
      
      const monthData = transactions.filter((t: any) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === actualMonth && tDate.getFullYear() === year;
      });
      
      const income = monthData
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      const expenses = monthData
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyTrend.push({
        month: monthNames[actualMonth],
        income,
        expenses
      });
    }
    
    return c.json({
      thisMonth: {
        income: thisMonthIncome,
        expenses: thisMonthExpenses,
        balance: thisMonthIncome - thisMonthExpenses
      },
      comparison: {
        expenseChange: lastMonthExpenses > 0 
          ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
          : 0
      },
      categoryBreakdown,
      monthlyTrend
    });
  } catch (error) {
    console.log(`Analytics error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============= SUBSCRIPTION ROUTES =============

app.get('/make-server-9e45f1d5/subscription/status', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const subscription = await kv.get(`user:${userId}:subscription`) || { plan: 'free' };
    return c.json(subscription);
  } catch (error) {
    console.log(`Get subscription status error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-9e45f1d5/subscription/payment', async (c) => {
  const { userId, error } = await verifyUser(c.req.raw);
  if (error) return c.json({ error }, 401);
  
  try {
    const paymentData = await c.req.json();
    
    // Store subscription data
    const subscription = {
      plan: paymentData.plan,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_id: paymentData.payment_id,
      payment_status: 'success',
      status: 'active',
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`user:${userId}:subscription`, subscription);
    
    console.log(`Payment processed for user ${userId}: ${paymentData.payment_id}`);
    
    return c.json({ 
      success: true, 
      subscription,
      message: 'Payment processed successfully' 
    });
  } catch (error) {
    console.log(`Payment processing error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
