import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';
import { transactionsAPI, budgetsAPI, goalsAPI } from '../utils/api';

export function DemoDataButton({ onDataAdded }: { onDataAdded: () => void }) {
  const [loading, setLoading] = useState(false);

  const addDemoData = async () => {
    if (!confirm('This will add sample transactions, budgets, and goals to your account. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      // Generate dates for current month
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      // Sample transactions
      const transactions = [
        { type: 'income', amount: 5000, category: 'Other', description: 'Monthly Salary', date: `${year}-${month}-01`, notes: 'Monthly salary' },
        { type: 'expense', amount: 1200, category: 'Other', description: 'Rent Payment', date: `${year}-${month}-02`, notes: 'Monthly rent' },
        { type: 'expense', amount: 45.50, category: 'Food & Dining', description: 'Starbucks coffee', date: `${year}-${month}-03`, notes: '' },
        { type: 'expense', amount: 89.99, category: 'Shopping', description: 'Amazon order', date: `${year}-${month}-04`, notes: 'Books and supplies' },
        { type: 'expense', amount: 25, category: 'Transport', description: 'Uber ride', date: `${year}-${month}-05`, notes: 'To office' },
        { type: 'expense', amount: 150, category: 'Utilities', description: 'Electric bill', date: `${year}-${month}-06`, notes: 'Monthly bill' },
        { type: 'expense', amount: 12.99, category: 'Entertainment', description: 'Netflix subscription', date: `${year}-${month}-07`, notes: 'Monthly subscription' },
        { type: 'expense', amount: 65, category: 'Food & Dining', description: 'Grocery shopping', date: `${year}-${month}-08`, notes: 'Weekly groceries' },
        { type: 'expense', amount: 30, category: 'Fitness', description: 'Gym membership', date: `${year}-${month}-09`, notes: 'Monthly fee' },
        { type: 'income', amount: 500, category: 'Other', description: 'Freelance project', date: `${year}-${month}-10`, notes: 'Web design work' },
        { type: 'expense', amount: 75, category: 'Healthcare', description: 'Doctor appointment', date: `${year}-${month}-11`, notes: 'Annual checkup' },
        { type: 'expense', amount: 20, category: 'Transport', description: 'Gas station', date: `${year}-${month}-12`, notes: 'Fuel' },
        { type: 'expense', amount: 40, category: 'Food & Dining', description: 'Restaurant dinner', date: `${year}-${month}-13`, notes: 'Date night' },
        { type: 'expense', amount: 199, category: 'Shopping', description: 'New shoes', date: `${year}-${month}-14`, notes: 'Running shoes' },
        { type: 'expense', amount: 15, category: 'Entertainment', description: 'Movie tickets', date: `${year}-${month}-15`, notes: 'Weekend movie' },
      ];

      // Sample budgets
      const budgets = [
        { category: 'Food & Dining', amount: 500, period: 'monthly' },
        { category: 'Transport', amount: 200, period: 'monthly' },
        { category: 'Shopping', amount: 300, period: 'monthly' },
        { category: 'Entertainment', amount: 100, period: 'monthly' },
      ];

      // Sample goals
      const goals = [
        { name: 'Emergency Fund', targetAmount: 10000, currentAmount: 2500, deadline: '2025-06-30' },
        { name: 'New Laptop', targetAmount: 1500, currentAmount: 450, deadline: '2025-03-31' },
        { name: 'Vacation Fund', targetAmount: 3000, currentAmount: 800, deadline: '2025-08-15' },
      ];

      // Add all data
      await Promise.all([
        ...transactions.map(t => transactionsAPI.create(t)),
        ...budgets.map(b => budgetsAPI.create(b)),
        ...goals.map(g => goalsAPI.create(g))
      ]);

      alert('Demo data added successfully! Refresh the page to see your new data.');
      onDataAdded();
    } catch (error) {
      console.error('Failed to add demo data:', error);
      alert('Failed to add demo data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={addDemoData}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Sparkles className="w-4 h-4" />
      {loading ? 'Adding...' : 'Add Demo Data'}
    </Button>
  );
}
