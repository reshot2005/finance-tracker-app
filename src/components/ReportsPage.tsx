import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Crown, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { transactionsAPI, budgetsAPI, getSubscriptionStatus } from '../utils/api';
import { getCurrentUser } from '../utils/auth';
import { toast } from 'sonner@2.0.3';

interface ReportsPageProps {
  onNavigate?: (page: string) => void;
}

export function ReportsPage({ onNavigate }: ReportsPageProps = {}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'pro'>('free');
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.access_token) {
        const status = await getSubscriptionStatus(user.access_token);
        setSubscriptionPlan(status.plan || 'free');
      } else {
        setSubscriptionPlan('free');
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscriptionPlan('free');
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const data = await transactionsAPI.getAll();
      let transactions = data.transactions;

      // Filter by date range if provided
      if (startDate && endDate) {
        transactions = transactions.filter((t: any) => {
          const tDate = new Date(t.date);
          return tDate >= new Date(startDate) && tDate <= new Date(endDate);
        });
      }

      // Create CSV content
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Notes'];
      const rows = transactions.map((t: any) => [
        t.date,
        t.type,
        t.category,
        t.description,
        t.amount,
        t.notes || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (subscriptionPlan !== 'pro') {
      toast.error('PDF export is a Pro feature. Please upgrade to access this functionality.');
      return;
    }

    setLoading(true);
    try {
      const [transData, budgetData] = await Promise.all([
        transactionsAPI.getAll(),
        budgetsAPI.getAll()
      ]);

      let transactions = transData.transactions;
      const budgets = budgetData.budgets;

      // Filter by date range if provided
      if (startDate && endDate) {
        transactions = transactions.filter((t: any) => {
          const tDate = new Date(t.date);
          return tDate >= new Date(startDate) && tDate <= new Date(endDate);
        });
      }

      // Calculate statistics
      const totalIncome = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const categoryBreakdown: Record<string, number> = {};
      transactions
        .filter((t: any) => t.type === 'expense')
        .forEach((t: any) => {
          categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        });

      // Generate PDF content (simplified HTML version)
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Financial Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #7c3aed; }
            .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .stat { display: inline-block; margin: 10px 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #7c3aed; color: white; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <h1>Financial Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          ${startDate && endDate ? `<p>Period: ${startDate} to ${endDate}</p>` : ''}
          
          <div class="summary">
            <h2>Summary</h2>
            <div class="stat"><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</div>
            <div class="stat"><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</div>
            <div class="stat"><strong>Net Savings:</strong> $${(totalIncome - totalExpenses).toFixed(2)}</div>
          </div>

          <h2>Category Breakdown</h2>
          <table>
            <tr><th>Category</th><th>Amount</th><th>Percentage</th></tr>
            ${Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => `
                <tr>
                  <td>${cat}</td>
                  <td>$${amount.toFixed(2)}</td>
                  <td>${totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%</td>
                </tr>
              `).join('')}
          </table>

          <h2>Recent Transactions</h2>
          <table>
            <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr>
            ${transactions.slice(0, 20).map((t: any) => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td>${t.type}</td>
                <td style="color: ${t.type === 'income' ? 'green' : 'red'}">
                  ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </table>

          <div class="footer">
            <p>Generated by FinanceTracker Pro</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      toast.success('PDF report generated! Use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Reports & Export</h1>
        <p className="text-gray-600 dark:text-gray-400">Export your financial data and generate reports</p>
      </div>

      {/* Date Range Selector */}
      <Card className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Select Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Pro Feature Banner */}
      {subscriptionPlan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg text-gray-900 dark:text-white">Unlock PDF Export</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upgrade to Pro to export professional PDF reports with charts and detailed analytics
                </p>
              </div>
              <Button
                onClick={() => onNavigate?.('subscription')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-white mb-2">Export as CSV</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download your transaction data in CSV format for use in spreadsheet applications
              </p>
              <Button
                onClick={handleExportCSV}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative">
          {subscriptionPlan !== 'pro' && (
            <div className="absolute inset-0 bg-gray-900/5 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
                <Lock className="w-3 h-3 mr-2" />
                Pro Feature
              </Badge>
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-gray-900 dark:text-white">Export as PDF</h3>
                {subscriptionPlan === 'pro' && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate a formatted PDF report with charts and summaries
              </p>
              <Button
                onClick={handleExportPDF}
                disabled={loading || subscriptionPlan !== 'pro'}
                className={subscriptionPlan === 'pro' 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  : ""
                }
                variant={subscriptionPlan === 'pro' ? 'default' : 'outline'}
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Generating...' : subscriptionPlan === 'pro' ? 'Export PDF' : 'Export PDF (Pro Only)'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Available Reports</h3>
        <div className="space-y-3">
          <ReportItem
            icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            title="Monthly Summary"
            description="Detailed breakdown of income and expenses by month"
          />
          <ReportItem
            icon={<FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            title="Category Analysis"
            description="Spending patterns across different categories"
          />
          <ReportItem
            icon={<FileText className="w-5 h-5 text-green-600 dark:text-green-400" />}
            title="Budget Performance"
            description="Track budget compliance and savings goals"
          />
        </div>
      </Card>
    </div>
  );
}

function ReportItem({ icon, title, description }: any) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm text-gray-900 dark:text-white">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
