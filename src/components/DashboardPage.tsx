import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Target, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from './ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { analyticsAPI, transactionsAPI, budgetsAPI, goalsAPI } from '../utils/api';
import { DemoDataButton } from './DemoDataButton';

const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#06b6d4', '#8b5cf6', '#f43f5e'];

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    activeBudgets: 0,
    activeGoals: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, transactionsData, budgetsData, goalsData] = await Promise.all([
        analyticsAPI.get(),
        transactionsAPI.getAll(),
        budgetsAPI.getAll(),
        goalsAPI.getAll()
      ]);

      setAnalytics(analyticsData);
      setStats({
        totalTransactions: transactionsData.transactions.length,
        activeBudgets: budgetsData.budgets.length,
        activeGoals: goalsData.goals.length
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const categoryData = analytics?.categoryBreakdown
    ? Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl lg:text-4xl gradient-text mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview</p>
        </div>
        {stats.totalTransactions === 0 && (
          <DemoDataButton onDataAdded={loadData} />
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Income This Month"
          value={`$${analytics?.thisMonth?.income?.toFixed(2) || '0.00'}`}
          change={analytics?.comparison?.incomeChange}
          trend="up"
          gradient="from-green-500 to-emerald-600"
          delay={0}
        />
        <StatCard
          icon={<Wallet className="w-6 h-6" />}
          label="Expenses This Month"
          value={`$${analytics?.thisMonth?.expenses?.toFixed(2) || '0.00'}`}
          change={analytics?.comparison?.expenseChange}
          trend={analytics?.comparison?.expenseChange > 0 ? 'down' : 'up'}
          gradient="from-red-500 to-rose-600"
          delay={0.1}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Net Balance"
          value={`$${analytics?.thisMonth?.balance?.toFixed(2) || '0.00'}`}
          change={((analytics?.thisMonth?.balance / analytics?.thisMonth?.income) * 100) || 0}
          trend={analytics?.thisMonth?.balance >= 0 ? 'up' : 'down'}
          gradient="from-blue-500 to-indigo-600"
          delay={0.2}
        />
        <StatCard
          icon={<Receipt className="w-6 h-6" />}
          label="Transactions"
          value={stats.totalTransactions.toString()}
          gradient="from-purple-500 to-violet-600"
          delay={0.3}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Monthly Trend - Area Chart */}
        <ChartCard title="Monthly Trend" delay={0.4}>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={analytics?.monthlyTrend || []}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
              <XAxis 
                dataKey="month" 
                stroke="currentColor"
                className="text-xs opacity-60"
              />
              <YAxis 
                stroke="currentColor"
                className="text-xs opacity-60"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                fill="url(#colorIncome)" 
                name="Income" 
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                fill="url(#colorExpenses)" 
                name="Expenses" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income vs Expense - Bar Chart */}
        <ChartCard title="Income vs Expenses" delay={0.5}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={[
                {
                  name: 'This Month',
                  income: analytics?.thisMonth?.income || 0,
                  expenses: analytics?.thisMonth?.expenses || 0
                }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
              <XAxis 
                dataKey="name" 
                stroke="currentColor"
                className="text-xs opacity-60"
              />
              <YAxis 
                stroke="currentColor"
                className="text-xs opacity-60"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                }}
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />
              <Legend />
              <Bar 
                dataKey="income" 
                fill="#10b981" 
                radius={[12, 12, 0, 0]} 
                name="Income"
              />
              <Bar 
                dataKey="expenses" 
                fill="#ef4444" 
                radius={[12, 12, 0, 0]} 
                name="Expenses"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Category Breakdown - Pie Chart */}
        <ChartCard title="Spending by Category" className="lg:col-span-2" delay={0.6}>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No expense data available</p>
              </div>
            </div>
          )}
        </ChartCard>

        {/* Quick Stats */}
        <ChartCard title="Quick Overview" delay={0.7}>
          <div className="space-y-4">
            <QuickStatItem
              label="Active Budgets"
              value={stats.activeBudgets}
              icon={<Wallet className="w-5 h-5" />}
              color="from-blue-500 to-cyan-500"
            />
            <QuickStatItem
              label="Active Goals"
              value={stats.activeGoals}
              icon={<Target className="w-5 h-5" />}
              color="from-purple-500 to-pink-500"
            />
            <QuickStatItem
              label="Expense Change"
              value={`${analytics?.comparison?.expenseChange > 0 ? '+' : ''}${analytics?.comparison?.expenseChange?.toFixed(1) || 0}%`}
              icon={
                analytics?.comparison?.expenseChange > 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )
              }
              color={analytics?.comparison?.expenseChange > 0 ? "from-red-500 to-orange-500" : "from-green-500 to-emerald-500"}
            />
            
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">Savings Rate</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        analytics?.thisMonth?.income > 0
                          ? Math.max(0, Math.min(100, ((analytics.thisMonth.balance / analytics.thisMonth.income) * 100)))
                          : 0
                      }%`
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                  />
                </div>
                <span className="text-sm min-w-[3rem] text-right">
                  {analytics?.thisMonth?.income > 0
                    ? `${Math.max(0, ((analytics.thisMonth.balance / analytics.thisMonth.income) * 100)).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, trend, gradient, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="card-hover"
    >
      <Card className="p-6 glass-strong border border-card-border/50 relative overflow-hidden group">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
              {icon}
            </div>
            {change !== undefined && (
              <motion.div 
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  trend === 'up' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2 }}
              >
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(change).toFixed(1)}%
              </motion.div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <motion.p 
            className="text-2xl lg:text-3xl text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
          >
            {value}
          </motion.p>
        </div>
      </Card>
    </motion.div>
  );
}

function ChartCard({ title, children, className = '', delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={className}
    >
      <Card className="p-6 glass-strong border border-card-border/50 card-hover">
        <h3 className="text-foreground mb-6">{title}</h3>
        {children}
      </Card>
    </motion.div>
  );
}

function QuickStatItem({ label, value, icon, color }: any) {
  return (
    <motion.div 
      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/30 hover:border-border/60 transition-all duration-300 group"
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-sm text-foreground/80">{label}</span>
      </div>
      <span className="text-foreground">{value}</span>
    </motion.div>
  );
}
