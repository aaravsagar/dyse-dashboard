import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Save, Shield, ChevronDown, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from './Layout';

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
      <Layout guildId={guildId} title="Auto-Role" subtitle="Automatically assign roles to new members">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading auto-role settings...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout guildId={guildId} title="Auto-Role" subtitle="Automatically assign roles to new members">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Auto-Role Configuration</h2>
          <p className="text-red-300 mb-6">Set up automatic role assignment for new server members</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Toggle */}
          <div className="bg-black/50 border border-red-500/20 rounded-xl p-6 flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Enable Auto-Role</h3>
              <p className="text-red-300 text-sm">Automatically assign selected roles to new members</p>
            </div>
            <button onClick={handleToggleEnabled} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRoleSettings.enabled ? 'bg-red-600' : 'bg-gray-600'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRoleSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Role Multi-Selection */}
          {autoRoleSettings.enabled && (
            <div className="bg-black/50 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Select Roles</h3>
              </div>
              <p className="text-red-300 text-sm mb-4">Choose roles to assign to new members</p>

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

export default AutoRole;