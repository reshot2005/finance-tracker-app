import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { Dialog, DialogPortal, DialogOverlay, DialogTrigger } from './ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog@1.1.6';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { transactionsAPI } from '../utils/api';
import { toast } from 'sonner';

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

interface AddTransactionModalProps {
  onTransactionAdded: () => void;
}

export function AddTransactionModal({ onTransactionAdded }: AddTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Other',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await transactionsAPI.create({
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        notes: formData.notes,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        category: 'Other',
        description: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        tags: ''
      });

      setOpen(false);
      onTransactionAdded();
      toast.success('Transaction added successfully!');
    } catch (error) {
      console.error('Add transaction error:', error);
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-30 lg:bottom-8 lg:right-8"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 text-white shadow-2xl shadow-purple-500/40 flex items-center justify-center hover:shadow-2xl hover:shadow-purple-500/60 transition-shadow animate-pulse-glow"
            >
              <Plus className="w-7 h-7 lg:w-9 lg:h-9" strokeWidth={3} />
            </motion.button>
          </DialogTrigger>

          <DialogPortal>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content
              className="fixed top-[50%] left-[50%] z-50 w-full max-w-[520px] translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-[#1E1E2E] rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header with gradient strip */}
                <div className="relative">
                  <div className="h-1.5 bg-gradient-to-r from-[#6C63FF] via-[#9F7BFF] to-[#6C63FF]" />
                  <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl">Add Transaction</h2>
                    <DialogPrimitive.Close className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <X className="w-5 h-5" />
                    </DialogPrimitive.Close>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                  <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <Label>Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-700 dark:text-red-400 shadow-md'
                        : 'border-border bg-secondary hover:bg-accent'
                    }`}
                  >
                    Expense
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.type === 'income'
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 shadow-md'
                        : 'border-border bg-secondary hover:bg-accent'
                    }`}
                  >
                    Income
                  </motion.button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount</Label>
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

              {/* Category */}
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

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Uber ride to office"
                  required
                  className="mt-1"
                />
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="work, travel, recurring"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1 rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        {loading ? 'Adding...' : 'Save Transaction'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPortal>
        </Dialog>
      </motion.div>
    </>
  );
}
