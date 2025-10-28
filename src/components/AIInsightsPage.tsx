import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Brain, DollarSign } from 'lucide-react';
import { Card } from './ui/card';
import { aiAPI } from '../utils/api';

export function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const [predictionsData, recommendationsData] = await Promise.all([
        aiAPI.getPredictions(),
        aiAPI.getRecommendations()
      ]);

      setPredictions(predictionsData);
      setRecommendations(recommendationsData.recommendations);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing your finances...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'medium':
        return <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-gray-900 dark:text-white mb-1">AI Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">AI-powered financial analysis and predictions</p>
        </div>
      </div>

      {/* Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PredictionCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Predicted Next Month"
          value={`$${predictions?.predictedNextMonthExpense?.toFixed(2) || '0.00'}`}
          color="purple"
        />
        <PredictionCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Average Monthly"
          value={`$${predictions?.averageMonthlyExpense?.toFixed(2) || '0.00'}`}
          color="blue"
        />
        <PredictionCard
          icon={<Brain className="w-6 h-6" />}
          label="Spending Trend"
          value={predictions?.trend === 'increasing' ? 'Increasing' : 'Decreasing'}
          color={predictions?.trend === 'increasing' ? 'red' : 'green'}
        />
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-gray-900 dark:text-white mb-4">Smart Recommendations</h2>
        {recommendations.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">No recommendations yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add more transactions to get personalized insights and recommendations
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-6 border-l-4 ${getPriorityColor(rec.priority)}`}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {getPriorityIcon(rec.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-gray-900 dark:text-white">{rec.title}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize">
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.message}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Category Predictions */}
      {predictions?.categoryPredictions && Object.keys(predictions.categoryPredictions).length > 0 && (
        <div>
          <h2 className="text-gray-900 dark:text-white mb-4">Category Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(predictions.categoryPredictions)
              .sort(([, a]: any, [, b]: any) => b - a)
              .slice(0, 6)
              .map(([category, amount]: any, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{category}</p>
                        <p className="text-lg text-gray-900 dark:text-white">${amount.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* AI Chatbot Placeholder */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white mb-2">AI Financial Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get personalized financial advice and insights. Ask me anything about your spending patterns, savings goals, or budget optimization.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                "How much did I spend on food last month?"
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                "Show my savings rate"
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                "Optimize my budget"
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PredictionCard({ icon, label, value, color }: any) {
  const colorClasses = {
    purple: 'from-purple-500 to-violet-600',
    blue: 'from-blue-500 to-indigo-600',
    red: 'from-red-500 to-rose-600',
    green: 'from-green-500 to-emerald-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white mb-4`}>
          {icon}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-gray-900 dark:text-white">{value}</p>
      </Card>
    </motion.div>
  );
}
