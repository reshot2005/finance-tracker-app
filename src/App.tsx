import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './components/DashboardPage';
import { TransactionsPage } from './components/TransactionsPage';
import { BudgetsPage } from './components/BudgetsPage';
import { GoalsPage } from './components/GoalsPage';
import { AIInsightsPage } from './components/AIInsightsPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';
import { ProfilePage } from './components/ProfilePage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { PaymentSuccessPage } from './components/PaymentSuccessPage';
import { AddTransactionModal } from './components/AddTransactionModal';
import { Toaster } from './components/ui/sonner';
import { getCurrentSession, signOut } from './utils/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
    loadTheme();
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const checkAuth = async () => {
    try {
      const { session } = await getCurrentSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to light theme
      setTheme('light');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    checkAuth();
  };

  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onAuthSuccess={handleAuthSuccess} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 overflow-y-auto relative">
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="relative z-10 min-h-full" key={refreshKey}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentPage === 'dashboard' && <DashboardPage />}
              {currentPage === 'transactions' && <TransactionsPage />}
              {currentPage === 'budgets' && <BudgetsPage />}
              {currentPage === 'goals' && <GoalsPage />}
              {currentPage === 'ai-insights' && <AIInsightsPage />}
              {currentPage === 'reports' && <ReportsPage onNavigate={setCurrentPage} />}
              {currentPage === 'settings' && (
                <SettingsPage theme={theme} onThemeChange={setTheme} />
              )}
              {currentPage === 'profile' && <ProfilePage onNavigate={setCurrentPage} />}
              {currentPage === 'subscription' && <SubscriptionPage onNavigate={setCurrentPage} />}
              {currentPage === 'payment-success' && <PaymentSuccessPage onNavigate={setCurrentPage} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AddTransactionModal onTransactionAdded={handleTransactionAdded} />
      <Toaster />
    </div>
  );
}
