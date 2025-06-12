import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Save, Hash, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from './Layout';

const GuildSettings: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const location = useLocation();
  const { user } = useAuth();

  const [prefix, setPrefix] = useState('!');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guildName = location.state?.guildName || 'Unknown Server';

  useEffect(() => {
    if (!guildId || !user) return;
    loadGuildSettings();
  }, [guildId, user]);

  const loadGuildSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, 'servers', guildId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPrefix(data.prefix || '!');
        setCurrencySymbol(data.currencySymbol || '');
      } else {
        await setDoc(docRef, {
          prefix: '!',
          currencySymbol: '',
          guildId,
          guildName,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setPrefix('!');
        setCurrencySymbol('');
      }
    } catch (err) {
      console.error('Error loading guild settings:', err);
      setError('Failed to load server settings');
      toast.error('Failed to load server settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!guildId || !user) return;

    try {
      setSaving(true);
      setError(null);

      const docRef = doc(db, 'servers', guildId);
      await setDoc(docRef, {
        prefix,
        currencySymbol,
        guildId,
        guildName,
        updatedAt: new Date(),
        updatedBy: user.id
      }, { merge: true });

      toast.success('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving guild settings:', err);
      setError('Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 5 && !value.includes(' ')) {
      setPrefix(value);
    }
  };

  const handleCurrencySymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrencySymbol(e.target.value);
  };

  if (loading) {
    return (
      <Layout guildId={guildId} title={guildName} subtitle="Server Settings">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading server settings...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout guildId={guildId} title={guildName} subtitle="Server Settings">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Bot Configuration</h2>
            <p className="text-red-300">Customize how the bot behaves in your server</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Prefix */}
            <div className="bg-black/50 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Hash className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Command Prefix</h3>
              </div>
              <p className="text-red-300 text-sm mb-4">Set the prefix users need before commands</p>

              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-xs">
                  <label htmlFor="prefix" className="block text-sm font-medium text-red-300 mb-2">
                    Prefix
                  </label>
                  <input
                    type="text"
                    id="prefix"
                    value={prefix}
                    onChange={handlePrefixChange}
                    placeholder="!"
                    className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-red-300/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  />
                  <p className="text-red-300/70 text-xs mt-1">Max 5 characters, no spaces</p>
                </div>

                <div className="bg-black/50 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-red-300 text-sm mb-1">Preview:</p>
                  <code className="text-white font-mono">{prefix || '!'}help</code>
                </div>
              </div>
            </div>

            {/* Currency */}
            <div className="bg-black/50 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Info className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Currency Symbol</h3>
              </div>
              <p className="text-red-300 text-sm mb-4">
                Set your custom in-bot currency (e.g., <code>$</code> or <code>{'<:coin:1234567890>'}</code>)
              </p>
              <input
                type="text"
                id="currencySymbol"
                value={currencySymbol}
                onChange={handleCurrencySymbolChange}
                placeholder="$ or <:coin:1234567890>"
                className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-red-300/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
            </div>

            {/* Server Info */}
            <div className="bg-black/50 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Server Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-red-300">Server ID:</p>
                  <p className="text-white font-mono">{guildId}</p>
                </div>
                <div>
                  <p className="text-red-300">Server Name:</p>
                  <p className="text-white">{guildName}</p>
                </div>
              </div>
            </div>
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

export default GuildSettings;