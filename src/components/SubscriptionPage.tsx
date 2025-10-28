import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Check, 
  X, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  Headphones,
  Target,
  Lock,
  ArrowLeft,
  User,
  Crown,
  Zap
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { getCurrentUser } from '../utils/auth';
import { getSubscriptionStatus } from '../utils/api';

interface Feature {
  name: string;
  included: boolean;
  icon: JSX.Element;
}

const freeFeatures: Feature[] = [
  { name: 'Basic Transaction Tracking', included: true, icon: <Check className="w-4 h-4" /> },
  { name: 'Up to 3 Budget Categories', included: true, icon: <Check className="w-4 h-4" /> },
  { name: '1 Financial Goal', included: true, icon: <Check className="w-4 h-4" /> },
  { name: 'Basic Reports', included: true, icon: <Check className="w-4 h-4" /> },
  { name: 'AI Insights', included: false, icon: <Lock className="w-4 h-4" /> },
  { name: 'Unlimited Goals', included: false, icon: <Lock className="w-4 h-4" /> },
  { name: 'Export PDF Reports', included: false, icon: <Lock className="w-4 h-4" /> },
  { name: 'Priority Support', included: false, icon: <Lock className="w-4 h-4" /> },
];

const proFeatures: Feature[] = [
  { name: 'Unlimited Transactions', included: true, icon: <Check className="w-4 h-4" /> },
  { name: 'Unlimited Budget Categories', included: true, icon: <Check className="w-4 h-4" /> },
  { name: 'Unlimited Financial Goals', included: true, icon: <Check className="w-4 h-4" /> },
  { name: 'Advanced Reports & Analytics', included: true, icon: <Check className="w-4 h-4" /> },
  { name: 'AI-Powered Insights', included: true, icon: <Sparkles className="w-4 h-4" /> },
  { name: 'Export PDF Reports', included: true, icon: <FileText className="w-4 h-4" /> },
  { name: 'Spending Predictions', included: true, icon: <TrendingUp className="w-4 h-4" /> },
  { name: 'Priority Support', included: true, icon: <Headphones className="w-4 h-4" /> },
];

interface SubscriptionPageProps {
  onNavigate?: (page: string) => void;
}

export function SubscriptionPage({ onNavigate }: SubscriptionPageProps = {}) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.access_token) {
        const status = await getSubscriptionStatus(user.access_token);
        setCurrentPlan(status.plan || 'free');
      } else {
        setCurrentPlan('free');
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
      setCurrentPlan('free');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Crown className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Choose Your Subscription
            </h1>
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock premium features and take your financial tracking to the next level
          </p>
          
          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => onNavigate?.('dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate?.('profile')}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              View My Profile
            </Button>
          </div>

          {/* Current Plan Badge */}
          {!loading && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4"
            >
              <Badge
                variant={currentPlan === 'pro' ? 'default' : 'secondary'}
                className={`px-4 py-2 text-sm ${
                  currentPlan === 'pro'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : ''
                }`}
              >
                {currentPlan === 'pro' ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Current Plan: Pro Member
                  </>
                ) : (
                  'Current Plan: Free User'
                )}
              </Badge>
            </motion.div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-2 border-gray-200 dark:border-gray-700 shadow-xl h-full">
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl mb-2">Free Plan</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl">₹0</span>
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Perfect for getting started with basic finance tracking
                </p>

                <Button
                  variant="outline"
                  className="w-full mb-8"
                  disabled={currentPlan === 'free'}
                >
                  {currentPlan === 'free' ? 'Current Plan' : 'Downgrade'}
                </Button>

                <div className="space-y-4">
                  {freeFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`flex items-center gap-3 ${
                        !feature.included ? 'opacity-50' : ''
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <span className="text-sm">{feature.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-blue-900/40 border-2 border-purple-300 dark:border-purple-500 shadow-2xl h-full">
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-xl"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Recommended Badge */}
              <div className="absolute top-6 right-6 z-10">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs shadow-lg">
                  <Zap className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>

              <div className="relative z-10 p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-2xl">Pro Plan</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ₹299
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Unlock all premium features and supercharge your finances
                </p>

                <Button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={currentPlan === 'pro'}
                  className="w-full mb-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {currentPlan === 'pro' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>

                <div className="space-y-4">
                  {proFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                        {feature.icon}
                      </div>
                      <span className="text-sm">{feature.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="p-8 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60">
            <h3 className="text-2xl mb-4">Why Upgrade to Pro?</h3>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="text-lg">AI-Powered Insights</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get smart predictions and personalized recommendations
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                  <Target className="w-8 h-8" />
                </div>
                <h4 className="text-lg">Unlimited Goals</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track as many financial goals as you want
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-lg">Export Reports</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download professional PDF reports anytime
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}
