import { projectId, publicAnonKey } from './supabase/info';
import { getAccessToken } from './auth';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-9e45f1d5`;

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`,
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`API Error (${endpoint}):`, data.error || data);
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

// Profile API
export const profileAPI = {
  get: () => fetchWithAuth('/profile'),
  update: (updates: any) => fetchWithAuth('/profile', {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => fetchWithAuth('/transactions'),
  create: (transaction: any) => fetchWithAuth('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction)
  }),
  update: (id: string, updates: any) => fetchWithAuth(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  delete: (id: string) => fetchWithAuth(`/transactions/${id}`, {
    method: 'DELETE'
  }),
};

// Budgets API
export const budgetsAPI = {
  getAll: () => fetchWithAuth('/budgets'),
  create: (budget: any) => fetchWithAuth('/budgets', {
    method: 'POST',
    body: JSON.stringify(budget)
  }),
  update: (id: string, updates: any) => fetchWithAuth(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  delete: (id: string) => fetchWithAuth(`/budgets/${id}`, {
    method: 'DELETE'
  }),
};

// Goals API
export const goalsAPI = {
  getAll: () => fetchWithAuth('/goals'),
  create: (goal: any) => fetchWithAuth('/goals', {
    method: 'POST',
    body: JSON.stringify(goal)
  }),
  update: (id: string, updates: any) => fetchWithAuth(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  delete: (id: string) => fetchWithAuth(`/goals/${id}`, {
    method: 'DELETE'
  }),
};

// AI API
export const aiAPI = {
  getPredictions: () => fetchWithAuth('/ai/predictions'),
  getRecommendations: () => fetchWithAuth('/ai/recommendations'),
};

// Analytics API
export const analyticsAPI = {
  get: () => fetchWithAuth('/analytics'),
};

// Subscription API
export async function getSubscriptionStatus(token: string) {
  try {
    const response = await fetch(`${baseUrl}/subscription/status`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      // If unauthorized or not found, return default free plan
      if (response.status === 401 || response.status === 404) {
        return { plan: 'free', status: 'active' };
      }
      console.error('Subscription status error:', response.status);
      return { plan: 'free', status: 'active' };
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    // Return default free plan on error
    return { plan: 'free', status: 'active' };
  }
}

export async function processPayment(token: string, paymentData: {
  plan: string;
  amount: number;
  payment_method: string;
  payment_id: string;
}) {
  const response = await fetch(`${baseUrl}/subscription/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment processing failed');
  }
  
  return response.json();
}
