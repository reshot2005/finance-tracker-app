import { useEffect, useState } from 'react';
import { User, Mail, Calendar, TrendingUp, DollarSign, Target, Crown, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { profileAPI, transactionsAPI, budgetsAPI, goalsAPI, getSubscriptionStatus } from '../utils/api';
import { getCurrentUser } from '../utils/auth';

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps = {}) {
  const [profile, setProfile] = useState<any>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'pro'>('free');
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    activeBudgets: 0,
    completedGoals: 0,
    activeGoals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await getCurrentUser();
      
      const [profileData, transactionsData, budgetsData, goalsData, subscriptionData] = await Promise.all([
        profileAPI.get(),
        transactionsAPI.getAll(),
        budgetsAPI.getAll(),
        goalsAPI.getAll(),
        user?.access_token ? getSubscriptionStatus(user.access_token).catch(() => ({ plan: 'free' })) : Promise.resolve({ plan: 'free' })
      ]);

      setProfile(profileData.profile);
      setSubscriptionPlan(subscriptionData.plan || 'free');

      const totalIncome = transactionsData.transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const totalExpenses = transactionsData.transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const completedGoals = goalsData.goals.filter(
        (g: any) => g.currentAmount >= g.targetAmount
      ).length;

      setStats({
        totalTransactions: transactionsData.transactions.length,
        totalIncome,
        totalExpenses,
        activeBudgets: budgetsData.budgets.length,
        completedGoals,
        activeGoals: goalsData.goals.length - completedGoals
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const savingsRate = stats.totalIncome > 0
    ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Your account information and statistics</p>
      </div>

      {/* Profile Card */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {profile?.name ? getInitials(profile.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            {subscriptionPlan === 'pro' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
              >
                <Crown className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <h2 className="text-gray-900 dark:text-white">{profile?.name || 'User'}</h2>
              <Badge
                variant={subscriptionPlan === 'pro' ? 'default' : 'secondary'}
                className={`${
                  subscriptionPlan === 'pro'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : ''
                }`}
              >
                {subscriptionPlan === 'pro' ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Member
                  </>
                ) : (
                  'Free User'
                )}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profile?.email || 'No email'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Upgrade Banner */}
      {subscriptionPlan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 border-2 border-purple-200 dark:border-purple-800 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-blue-400/10 blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg text-gray-900 dark:text-white">Unlock Premium Features</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get AI-powered insights, unlimited goals, PDF reports, and more with Pro membership!
                </p>
              </div>
              <Button
                onClick={() => onNavigate?.('subscription')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Income"
          value={`$${stats.totalIncome.toFixed(2)}`}
          color="green"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Expenses"
          value={`$${stats.totalExpenses.toFixed(2)}`}
          color="red"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Savings Rate"
          value={`${Math.max(0, savingsRate).toFixed(1)}%`}
          color="blue"
        />
      </div>

      {/* Activity Stats */}
      <Card className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Activity Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActivityStat
            icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            label="Transactions"
            value={stats.totalTransactions}
          />
          <ActivityStat
            icon={<Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            label="Active Budgets"
            value={stats.activeBudgets}
          />
          <ActivityStat
            icon={<Target className="w-5 h-5 text-green-600 dark:text-green-400" />}
            label="Active Goals"
            value={stats.activeGoals}
          />
          <ActivityStat
            icon={<Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
            label="Completed Goals"
            value={stats.completedGoals}
          />
        </div>
      </Card>

      {/* Account Info */}
      <Card className="p-6">
        <h3 className="text-gray-900 dark:text-white mb-4">Account Information</h3>
        <div className="space-y-3">
          <InfoRow 
            label="Account Type" 
            value={subscriptionPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            badge={subscriptionPlan === 'pro' ? 'purple' : undefined}
          />
          <InfoRow label="Currency" value={profile?.currency || 'USD'} />
          <InfoRow label="Theme" value={profile?.theme === 'dark' ? 'Dark Mode' : 'Light Mode'} />
          <InfoRow label="Status" value="Active" badge="green" />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-violet-600'
  };

  return (
    <Card className="p-6">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-gray-900 dark:text-white">{value}</p>
    </Card>
  );
}

function ActivityStat({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-lg text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, badge }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      {badge ? (
        <span className={`px-2 py-1 rounded-full text-xs ${
          badge === 'green'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : badge === 'purple'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {value}
        </span>
      ) : (
        <span className="text-sm text-gray-900 dark:text-white">{value}</span>
      )}
    </div>
  );
}
