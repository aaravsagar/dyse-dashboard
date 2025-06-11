import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  ArrowLeft,
  Save,
  Settings,
  BarChart2,
  Users,
  Shield,
  ChevronDown,
  Home,
  CheckSquare,
  Square
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface AutoRoleSettings {
  enabled: boolean;
  roleIds: string[];
}

const AutoRole: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [autoRoleSettings, setAutoRoleSettings] = useState<AutoRoleSettings>({
    enabled: false,
    roleIds: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!guildId || !user || !accessToken) return;
    loadData();
  }, [guildId, user, accessToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadRoles();

      const docRef = doc(db, 'servers', guildId!, 'settings', 'autoRole');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setAutoRoleSettings({
          enabled: data.enabled || false,
          roleIds: data.roleIds || []
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
      const response = await fetch(`https://dyse-dashboard.onrender.com/api/guilds/${guildId}/roles`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      } else {
        throw new Error('Failed to fetch roles');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load server roles');
      toast.error('Failed to load server roles');
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

  const toggleRole = (roleId: string) => {
    setAutoRoleSettings(prev => {
      const exists = prev.roleIds.includes(roleId);
      const newRoles = exists
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId];
      return { ...prev, roleIds: newRoles };
    });
  };

  const handleToggleEnabled = () => {
    setAutoRoleSettings(prev => ({
      ...prev,
      enabled: !prev.enabled,
      roleIds: prev.enabled ? [] : prev.roleIds
    }));
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
        {/* Sidebar Content */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512" alt="DYSE Logo" />
          </div>
          <h2 className="text-white text-lg font-semibold">Navigation</h2>
        </div>
        <Link to="/dashboard" className="nav-link"><Home className="w-5 h-5" /><span>Home</span></Link>
        <Link to={`/guild/${guildId}`} className="nav-link"><Settings className="w-5 h-5" /><span>Settings</span></Link>
        <Link to={`/guild/${guildId}/auto-role`} className="nav-link-active"><Shield className="w-5 h-5" /><span>Auto-Role</span></Link>
        <Link to={`/guild/${guildId}/income-shop`} className="nav-link"><Users className="w-5 h-5" /><span>Income Shop</span></Link>
        <Link to={`/dashboard/${guildId}/leaderboard`} className="nav-link"><BarChart2 className="w-5 h-5" /><span>Leaderboard</span></Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-black/50 backdrop-blur-lg border-b border-red-500/20">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center space-x-4">
            <button onClick={() => navigate(`/guild/${guildId}`)} className="icon-button">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <img className="w-10 h-10 rounded-full" src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512" alt="Logo" />
              <div>
                <h1 className="text-xl font-bold text-white">Auto-Role</h1>
                <p className="text-red-200 text-sm">Automatically assign roles to new members</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20">
            <h2 className="text-2xl font-bold text-white mb-2">Auto-Role Configuration</h2>
            <p className="text-red-200 mb-6">Set up automatic role assignment for new server members</p>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Toggle */}
            <div className="bg-black/30 rounded-xl p-6 border border-red-500/10 flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Enable Auto-Role</h3>
                <p className="text-red-200 text-sm">Automatically assign selected roles to new members</p>
              </div>
              <button onClick={handleToggleEnabled} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRoleSettings.enabled ? 'bg-red-600' : 'bg-gray-600'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRoleSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Role Multi-Selection */}
            {autoRoleSettings.enabled && (
              <div className="bg-black/30 rounded-xl p-6 border border-red-500/10">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Select Roles</h3>
                </div>
                <p className="text-red-200 text-sm mb-4">Choose roles to assign to new members</p>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className="flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 transition"
                    >
                      {autoRoleSettings.roleIds.includes(role.id) ? (
                        <CheckSquare className="text-red-400 w-5 h-5" />
                      ) : (
                        <Square className="text-red-400 w-5 h-5" />
                      )}
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRoleColor(role.color) }} />
                      <span className="text-white">{role.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Save */}
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
