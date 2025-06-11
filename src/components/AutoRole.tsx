import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowLeft, Save, Settings, BarChart2, Users, Shield, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface AutoRoleSettings {
  enabled: boolean;
  roleId: string;
}

const AutoRole: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [autoRoleSettings, setAutoRoleSettings] = useState<AutoRoleSettings>({
    enabled: false,
    roleId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!guildId || !user || !accessToken) return;
    loadData();
  }, [guildId, user, accessToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load roles from Discord API
      await loadRoles();

      // Load auto-role settings from Firebase
      const docRef = doc(db, 'servers', guildId!, 'settings', 'autoRole');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setAutoRoleSettings({
          enabled: data.enabled || false,
          roleId: data.roleId || ''
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load auto-role settings');
      toast.error('Failed to load auto-role settings');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN'}`
        }
      });

      if (response.ok) {
        const rolesData = await response.json();
        // Filter out @everyone role and sort by position
        const filteredRoles = rolesData
          .filter((role: any) => role.name !== '@everyone')
          .sort((a: any, b: any) => b.position - a.position);
        setRoles(filteredRoles);
      } else {
        throw new Error('Failed to fetch roles');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      // Fallback: create mock roles for demo
      setRoles([
        { id: '1', name: 'Member', color: 0, position: 1 },
        { id: '2', name: 'VIP', color: 16776960, position: 2 },
        { id: '3', name: 'Moderator', color: 65280, position: 3 }
      ]);
    }
  };

  const handleSaveSettings = async () => {
    if (!guildId || !user) return;

    try {
      setSaving(true);
      setError(null);

      const docRef = doc(db, 'servers', guildId, 'settings', 'autoRole');
      await setDoc(docRef, {
        ...autoRoleSettings,
        updatedAt: new Date(),
        updatedBy: user.id
      });

      toast.success('Auto-role settings saved successfully!');
    } catch (err) {
      console.error('Error saving auto-role settings:', err);
      setError('Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedRole = () => {
    return roles.find(role => role.id === autoRoleSettings.roleId);
  };

  const getRoleColor = (color: number) => {
    if (color === 0) return '#99AAB5';
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading auto-role settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-red-900 via-black to-red-900">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-black/30 border-r border-red-500/20 p-6 space-y-4">
        <h2 className="text-white text-lg font-semibold mb-4">Navigation</h2>
        <Link
          to={`/guild/${guildId}`}
          className="flex items-center space-x-3 text-red-200 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <Link
          to={`/guild/${guildId}/auto-role`}
          className="flex items-center space-x-3 text-white bg-red-500/30 px-4 py-2 rounded-lg"
        >
          <Shield className="w-5 h-5" />
          <span>Auto-Role</span>
        </Link>
        <Link
          to={`/guild/${guildId}/income-shop`}
          className="flex items-center space-x-3 text-red-200 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
        >
          <Users className="w-5 h-5" />
          <span>Income Shop</span>
        </Link>
        <Link
          to={`/dashboard/${guildId}/leaderboard`}
          className="flex items-center space-x-3 text-red-200 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
        >
          <BarChart2 className="w-5 h-5" />
          <span>Leaderboard</span>
        </Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-black/50 backdrop-blur-lg border-b border-red-500/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/guild/${guildId}`)}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-white p-2 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="bg-red-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Auto-Role</h1>
                    <p className="text-red-200 text-sm">Automatically assign roles to new members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Auto-Role Configuration</h2>
              <p className="text-red-200">Set up automatic role assignment for new server members</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="bg-black/30 rounded-xl p-6 border border-red-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Enable Auto-Role</h3>
                    <p className="text-red-200 text-sm">Automatically assign a role to new members when they join</p>
                  </div>
                  <button
                    onClick={() => setAutoRoleSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRoleSettings.enabled ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRoleSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              {autoRoleSettings.enabled && (
                <div className="bg-black/30 rounded-xl p-6 border border-red-500/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-6 h-6 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Select Role</h3>
                  </div>
                  <p className="text-red-200 text-sm mb-4">Choose which role to assign to new members</p>

                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-left text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        {getSelectedRole() ? (
                          <>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getRoleColor(getSelectedRole()!.color) }}
                            />
                            <span>{getSelectedRole()!.name}</span>
                          </>
                        ) : (
                          <span className="text-red-300/70">Select a role...</span>
                        )}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-red-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-black/90 border border-red-500/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                        {roles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => {
                              setAutoRoleSettings(prev => ({ ...prev, roleId: role.id }));
                              setDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-red-500/20 transition-colors flex items-center space-x-3"
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getRoleColor(role.color) }}
                            />
                            <span className="text-white">{role.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {getSelectedRole() && (
                    <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-red-200 text-sm">
                        <strong>Selected Role:</strong> {getSelectedRole()!.name}
                      </p>
                      <p className="text-red-300/70 text-xs mt-1">
                        New members will automatically receive this role when they join the server.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Info Section */}
              <div className="bg-black/30 rounded-xl p-6 border border-red-500/10">
                <h3 className="text-lg font-semibold text-white mb-4">How Auto-Role Works</h3>
                <div className="space-y-2 text-red-200 text-sm">
                  <p>• When enabled, new members will automatically receive the selected role</p>
                  <p>• The bot must have permission to manage roles</p>
                  <p>• The bot's role must be higher than the role you want to assign</p>
                  <p>• This feature only works for new members joining after it's enabled</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
        </main>
      </div>
    </div>
  );
};

export default AutoRole;