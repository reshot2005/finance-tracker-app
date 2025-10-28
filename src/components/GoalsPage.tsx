import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { goalsAPI } from '../utils/api';
import { Progress } from './ui/progress';

export function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: ''
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await goalsAPI.getAll();
      setGoals(data.goals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await goalsAPI.create({
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        deadline: formData.deadline
      });

      setFormData({ name: '', targetAmount: '', deadline: '' });
      setShowAddDialog(false);
      loadGoals();
    } catch (error) {
      console.error('Failed to add goal:', error);
      alert('Failed to add goal');
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGoal) return;

    try {
      const newAmount = selectedGoal.currentAmount + parseFloat(contributeAmount);
      await goalsAPI.update(selectedGoal.id, { currentAmount: newAmount });

      setContributeAmount('');
      setShowContributeDialog(false);
      setSelectedGoal(null);
      loadGoals();
    } catch (error) {
      console.error('Failed to contribute to goal:', error);
      alert('Failed to contribute to goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalsAPI.delete(id);
      loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal');
    }
  };

  const calculateWeeklySavings = (goal: any) => {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const weeksLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const remaining = goal.targetAmount - goal.currentAmount;
    return remaining / weeksLeft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">Financial Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your savings goals and stay motivated</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Buy Laptop"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="0.00"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
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
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600">
                  Create Goal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white mb-2">No goals yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Set your first financial goal and start working towards it
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = percentage >= 100;
            const weeklySavings = calculateWeeklySavings(goal);
            const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)));

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 ${isCompleted ? 'border-green-500 dark:border-green-500' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-gray-900 dark:text-white mb-1">{goal.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {daysLeft} days left
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">
                          ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                        </span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        {percentage.toFixed(0)}% complete
                      </p>
                    </div>

                    {/* Smart Suggestion */}
                    {!isCompleted && (
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              Save <strong>${weeklySavings.toFixed(2)}/week</strong> to reach your goal on time
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 text-center">
                          🎉 Goal achieved! Congratulations!
                        </p>
                      </div>
                    )}

                    {/* Contribute Button */}
                    {!isCompleted && (
                      <Button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowContributeDialog(true);
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                        size="sm"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Add Contribution
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <form onSubmit={handleContribute} className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Contributing to: <strong>{selectedGoal.name}</strong>
                </p>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowContributeDialog(false);
                    setSelectedGoal(null);
                    setContributeAmount('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600">
                  Add Contribution
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
