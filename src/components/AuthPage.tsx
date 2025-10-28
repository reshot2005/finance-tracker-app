import { useState } from 'react';
import { motion } from 'motion/react';
import { signIn, signUp, signInWithGoogle } from '../utils/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { DollarSign, TrendingUp, PiggyBank, Chrome } from 'lucide-react';

export function AuthPage({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
      
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
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
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10"
      >
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <DollarSign className="w-9 h-9 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl gradient-text">FinanceTracker</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Finance Management</p>
              </div>
            </div>
            
            <h2 className="text-4xl text-foreground mb-4">
              Take Control of Your Finances
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Track expenses, set budgets, achieve goals, and get AI-powered insights - all in one beautiful dashboard.
            </p>
            
            <div className="space-y-4">
              <FeatureItem 
                icon={<TrendingUp className="w-5 h-5" />}
                title="Smart Analytics"
                description="AI-powered insights and expense predictions"
              />
              <FeatureItem 
                icon={<PiggyBank className="w-5 h-5" />}
                title="Goal Tracking"
                description="Set and achieve your financial goals faster"
              />
              <FeatureItem 
                icon={<DollarSign className="w-5 h-5" />}
                title="Budget Management"
                description="Stay on track with real-time budget alerts"
              />
            </div>
          </motion.div>
        </div>

        {/* Right side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 glass-strong border-card-border/50 shadow-2xl">
            <div className="mb-6 text-center">
              <h3 className="text-2xl text-foreground mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Start your financial journey today' : 'Sign in to continue to your dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 hover:from-purple-600 hover:via-violet-600 hover:to-indigo-700 text-white rounded-xl shadow-lg"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full rounded-xl border-2 hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/10"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/30"
      whileHover={{ x: 8, scale: 1.02 }}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
        {icon}
      </div>
      <div>
        <h4 className="text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
