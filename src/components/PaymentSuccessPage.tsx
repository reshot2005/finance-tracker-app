import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Crown,
  Gift,
  Zap,
  Star
} from 'lucide-react';

interface PaymentSuccessPageProps {
  onNavigate?: (page: string) => void;
}

// Custom confetti particle component
function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * window.innerWidth;
  const randomRotation = Math.random() * 360;
  
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full"
      style={{ 
        backgroundColor: randomColor,
        left: randomX,
        top: -20,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ 
        y: window.innerHeight + 20,
        opacity: [1, 1, 0],
        rotate: randomRotation + 720,
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: 'easeIn',
      }}
    />
  );
}

export function PaymentSuccessPage({ onNavigate }: PaymentSuccessPageProps = {}) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Custom Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 0.02} />
          ))}
        </div>
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.4, 0.6, 0.4],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.2 
          }}
        >
          <Card className="p-8 md:p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-2xl border-2 border-purple-200 dark:border-purple-800">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: 0.4 
              }}
              className="mb-6"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-2xl"
                />
                <CheckCircle2 className="w-24 h-24 text-green-500 relative" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Crown className="w-6 h-6 text-purple-600" />
                <p className="text-xl text-gray-700 dark:text-gray-300">
                  You are now a <span className="font-semibold text-purple-600 dark:text-purple-400">Pro Member</span> 🎉
                </p>
              </div>
            </motion.div>

            {/* Features Unlocked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="my-8"
            >
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg">Premium Features Unlocked</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>AI-Powered Insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>Unlimited Goals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Export PDF Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Priority Support</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-3"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Your subscription is now active. Start exploring premium features!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => onNavigate?.('dashboard')}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => onNavigate?.('ai-insights')}
                  variant="outline"
                  className="flex-1 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try AI Insights
                </Button>
              </div>

              <Button
                onClick={() => onNavigate?.('profile')}
                variant="ghost"
                className="w-full mt-2"
              >
                View My Profile
              </Button>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute top-10 right-10 opacity-10"
            >
              <Sparkles className="w-16 h-16 text-purple-600" />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [360, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute bottom-10 left-10 opacity-10"
            >
              <Crown className="w-16 h-16 text-pink-600" />
            </motion.div>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
        >
          <p>A confirmation email has been sent to your registered email address.</p>
        </motion.div>
      </div>
    </div>
  );
}
