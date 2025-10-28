import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { budgetsAPI, transactionsAPI } from '../utils/api';
import { Progress } from './ui/progress';

const categories = [
  'Transport',
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Fitness',
  'Other'
];

const periods = ['weekly', 'monthly', 'yearly'];

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Other',
    amount: '',
    period: 'monthly'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetsData, transactionsData] = await Promise.all([
        budgetsAPI.getAll(),
        transactionsAPI.getAll()
      ]);
      setBudgets(budgetsData.budgets);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await budgetsAPI.create({
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period
      });

      setFormData({ category: 'Other', amount: '', period: 'monthly' });
      setShowAddDialog(false);
      loadData();
    } catch (error) {
      console.error('Failed to add budget:', error);
      alert('Failed to add budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      await budgetsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      alert('Failed to delete budget');
    }
  };

  const calculateSpent = (budget: any) => {
    const now = new Date();
    let relevantTransactions = transactions.filter(t => 
      t.type === 'expense' && t.category === budget.category
    );

    // Filter by period
    if (budget.period === 'monthly') {
      relevantTransactions = relevantTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      });
    } else if (budget.period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      relevantTransactions = relevantTransactions.filter(t => new Date(t.date) >= weekAgo);
    } else if (budget.period === 'yearly') {
      relevantTransactions = relevantTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === now.getFullYear();
      });
    }

    return relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
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
          <p className="text-muted-foreground">Loading budgets...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl lg:text-4xl gradient-text mb-2">Budgets</h1>
          <p className="text-muted-foreground">Manage your spending limits and stay on track</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBudget} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="period">Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => setFormData({ ...formData, period: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl">
                  Create Budget
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12 text-center glass-strong border-card-border/50">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-foreground mb-2">No budgets yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first budget to start tracking your spending
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Budget
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {budgets.map((budget, index) => {
            const spent = calculateSpent(budget);
            const percentage = (spent / budget.amount) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <Card className="p-6 glass-strong border-card-border/50 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-foreground mb-1">{budget.category}</h3>
                      <p className="text-xs text-muted-foreground capitalize px-2 py-1 bg-secondary rounded-full inline-block">
                        {budget.period}
                      </p>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Spent</span>
                      <span className="text-gray-900 dark:text-white">
                        ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(0)}% used
                        </span>
                        {isOverBudget ? (
                          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            Over budget
                          </div>
                        ) : isNearLimit ? (
                          <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-3 h-3" />
                            Near limit
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            On track
                          </div>
                        )}
                      </div>
                    </div>

                    {isOverBudget && (
                      <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400">
                          You've exceeded this budget by ${(spent - budget.amount).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
