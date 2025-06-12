import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Wrench, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from './Layout';

interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  updatedAt: Date;
  updatedBy: string;
}

const BotAdmin: React.FC = () => {
  const { user } = useAuth();
  const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings>({
    enabled: false,
    message: 'The bot is currently under maintenance. Please try again later.',
    updatedAt: new Date(),
    updatedBy: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.id === '746215033502957650';

  useEffect(() => {
    if (!isAdmin) return;
    loadMaintenanceSettings();
  }, [isAdmin]);

  const loadMaintenanceSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, 'botSettings', 'maintenance');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceSettings({
          enabled: data.enabled || false,
          message: data.message || 'The bot is currently under maintenance. Please try again later.',
          updatedAt: data.updatedAt?.toDate() || new Date(),
          updatedBy: data.updatedBy || ''
        });
      }
    } catch (err) {
      console.error('Error loading maintenance settings:', err);
      setError('Failed to load maintenance settings');
      toast.error('Failed to load maintenance settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const docRef = doc(db, 'botSettings', 'maintenance');
      await setDoc(docRef, {
        enabled: maintenanceSettings.enabled,
        message: maintenanceSettings.message,
        updatedAt: new Date(),
        updatedBy: user.id
      });

      toast.success('Maintenance settings saved successfully!');
    } catch (err) {
      console.error('Error saving maintenance settings:', err);
      setError('Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = () => {
    setMaintenanceSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMaintenanceSettings(prev => ({
      ...prev,
      message: e.target.value
    }));
  };

  if (!isAdmin) {
    return (
      <Layout title="Access Denied" subtitle="Unauthorized">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-red-200">You don't have permission to access the bot admin panel.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Bot Admin" subtitle="Manage bot settings">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading bot admin settings...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Bot Admin" subtitle="Manage bot settings">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Wrench className="w-8 h-8 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Bot Administration</h2>
            </div>
            <p className="text-red-200">Manage global bot settings and maintenance mode</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Maintenance Mode Toggle */}
            <div className="bg-black/50 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {maintenanceSettings.enabled ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">Maintenance Mode</h3>
                    <p className="text-red-200 text-sm">
                      {maintenanceSettings.enabled 
                        ? 'Bot is currently in maintenance mode' 
                        : 'Bot is operational and accepting commands'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleMaintenance}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    maintenanceSettings.enabled ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      maintenanceSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Status Indicator */}
              <div className={`p-4 rounded-lg border ${
                maintenanceSettings.enabled 
                  ? 'bg-yellow-900/20 border-yellow-500/50' 
                  : 'bg-green-900/20 border-green-500/50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    maintenanceSettings.enabled ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <span className={`font-semibold ${
                    maintenanceSettings.enabled ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {maintenanceSettings.enabled ? 'MAINTENANCE MODE ACTIVE' : 'BOT OPERATIONAL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Maintenance Message */}
            <div className="bg-black/50 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Maintenance Message</h3>
              <p className="text-red-200 text-sm mb-4">
                This message will be shown to users when the bot is in maintenance mode
              </p>
              <textarea
                value={maintenanceSettings.message}
                onChange={handleMessageChange}
                rows={4}
                className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-red-300/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 resize-none"
                placeholder="Enter maintenance message..."
              />
            </div>

            {/* Last Updated Info */}
            {maintenanceSettings.updatedBy && (
              <div className="bg-black/50 border border-red-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Last Updated</h3>
                <div className="text-red-200 text-sm space-y-1">
                  <p>Updated by: <span className="text-white font-mono">{maintenanceSettings.updatedBy}</span></p>
                  <p>Date: <span className="text-white">{maintenanceSettings.updatedAt.toLocaleString()}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BotAdmin;