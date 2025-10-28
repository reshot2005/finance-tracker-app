import { useEffect, useState } from 'react';
import { Moon, Sun, DollarSign, Bell, Lock, Save } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { profileAPI } from '../utils/api';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  const [currency, setCurrency] = useState('USD');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await profileAPI.get();
      if (data.profile) {
        setCurrency(data.profile.currency || 'USD');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        currency,
        theme
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your experience</p>
      </div>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            {theme === 'dark' ? (
              <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <Sun className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white mb-2">Appearance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Customize how the app looks and feels
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onThemeChange('light')}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onThemeChange('dark')}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Currency */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white mb-2">Currency</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Set your preferred currency
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="currency">Default Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
              <SelectItem value="AUD">AUD (A$)</SelectItem>
              <SelectItem value="CAD">CAD (C$)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white mb-2">Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Manage your notification preferences
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Budget Alerts</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when nearing budget limits</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Summary</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive daily spending summaries</p>
            </div>
            <Switch checked={false} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Goal Milestones</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Celebrate when you reach savings goals</p>
            </div>
            <Switch checked={true} />
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-white mb-2">Privacy & Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your financial data is encrypted and secure
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-sm text-gray-900 dark:text-white">End-to-end encryption enabled</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-4">Your data is encrypted at rest and in transit</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-sm text-gray-900 dark:text-white">Secure authentication</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-4">Protected by industry-standard security</p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-500 to-indigo-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
