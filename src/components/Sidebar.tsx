import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Target, 
  FileText, 
  Sparkles, 
  Settings, 
  User,
  DollarSign,
  LogOut,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'budgets', label: 'Budgets', icon: Wallet },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
  { id: 'subscription', label: 'Upgrade to Pro', icon: Crown },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
];

export function Sidebar({ currentPage, onNavigate, onSignOut }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 w-12 h-12 rounded-2xl glass-strong flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isMobileOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6 text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 left-0 h-screen w-72 glass-strong z-50 flex flex-col shadow-2xl"
          >
            <SidebarContent 
              currentPage={currentPage} 
              onNavigate={(page) => {
                onNavigate(page);
                setIsMobileOpen(false);
              }} 
              onSignOut={onSignOut}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden lg:flex sticky top-0 h-screen w-72 glass-strong flex-col shadow-2xl border-r border-border/50"
      >
        <SidebarContent 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          onSignOut={onSignOut}
        />
      </motion.aside>
    </>
  );
}

function SidebarContent({ currentPage, onNavigate, onSignOut }: SidebarProps) {
  return (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse-glow"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <DollarSign className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h2 className="gradient-text text-xl">FinanceTracker</h2>
            <p className="text-xs text-muted-foreground">AI-Powered Dashboard</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left
                  transition-all duration-300 group relative overflow-hidden
                  ${
                    isActive
                      ? 'text-white shadow-lg'
                      : item.id === 'subscription'
                      ? 'text-foreground/70 hover:text-foreground hover:bg-accent/50 hover:shadow-lg hover:shadow-purple-500/30'
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${isActive ? '' : 'group-hover:rotate-12'}`} />
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-5 w-2 h-2 bg-white rounded-full z-10"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* User Info Card */}
      <motion.div 
        className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">Welcome back!</p>
            <p className="text-xs text-muted-foreground truncate">Finance Expert</p>
          </div>
        </div>
      </motion.div>

      {/* Sign Out */}
      <div className="p-4 border-t border-border/50">
        <motion.button
          onClick={onSignOut}
          whileHover={{ x: 8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </>
  );
}
