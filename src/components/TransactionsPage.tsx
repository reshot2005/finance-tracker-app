import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { transactionsAPI } from '../utils/api';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, filterType, filterCategory, transactions]);

  const loadTransactions = async () => {
    try {
      const data = await transactionsAPI.getAll();
      setTransactions(data.transactions.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    setFilteredTransactions(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await transactionsAPI.delete(id);
      loadTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const categories = [...new Set(transactions.map(t => t.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
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
          <h1 className="text-3xl lg:text-4xl gradient-text mb-2">Transactions</h1>
          <p className="text-muted-foreground">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 glass-strong border-card-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center glass-strong border-card-border/50">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-foreground mb-2">No transactions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start by adding your first transaction using the + button'}
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.5) }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <Card className="p-5 glass-strong border-card-border/50 card-hover">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      transaction.type === 'income'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowDownCircle className="w-6 h-6" />
                    ) : (
                      <ArrowUpCircle className="w-6 h-6" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground truncate">
                          {transaction.description}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            {transaction.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex gap-1">
                              {transaction.tags.map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {transaction.notes && (
                          <p className="text-sm text-muted-foreground mt-2 truncate">
                            {transaction.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-xl ${
                            transaction.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
