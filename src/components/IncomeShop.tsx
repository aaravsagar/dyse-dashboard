import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowLeft, Save, Settings, BarChart2, Users, Shield, ChevronDown, Plus, Trash2, DollarSign, TrendingUp, Home } from 'lucide-react';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface IncomeRole {
  id: string;
  roleId: string;
  roleName: string;
  price: number;
  income: number;
}

interface IncomeShopSettings {
  enabled: boolean;
  roles: IncomeRole[];
}

const IncomeShop: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [incomeShopSettings, setIncomeShopSettings] = useState<IncomeShopSettings>({
    enabled: false,
    roles: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRole, setNewRole] = useState({
    roleId: '',
    price: 0,
    income: 0
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!guildId || !user || !accessToken) return;
    loadData();
  }, [guildId, user, accessToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load roles from server API
      await loadRoles();

      // Load income shop settings from Firebase
      const docRef = doc(db, 'servers', guildId!, 'settings', 'incomeShop');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setIncomeShopSettings({
          enabled: data.enabled || false,
          roles: data.roles || []
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load income shop settings');
      toast.error('Failed to load income shop settings');
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

      const docRef = doc(db, 'servers', guildId, 'settings', 'incomeShop');
      await setDoc(docRef, {
        ...incomeShopSettings,
        updatedAt: new Date(),
        updatedBy: user.id
      });

      toast.success('Income shop settings saved successfully!');
    } catch (err) {
      console.error('Error saving income shop settings:', err);
      setError('Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = () => {
    if (!newRole.roleId || newRole.price <= 0 || newRole.income <= 0) {
      toast.error('Please fill in all fields with valid values');
      return;
    }

    const selectedRole = roles.find(role => role.id === newRole.roleId);
    if (!selectedRole) {
      toast.error('Please select a valid role');
      return;
    }

    // Check if role already exists
    if (incomeShopSettings.roles.some(role => role.roleId === newRole.roleId)) {
      toast.error('This role is already in the income shop');
      return;
    }

    const incomeRole: IncomeRole = {
      id: Date.now().toString(),
      roleId: newRole.roleId,
      roleName: selectedRole.name,
      price: newRole.price,
      income: newRole.income
    };

    setIncomeShopSettings(prev => ({
      ...prev,
      roles: [...prev.roles, incomeRole]
    }));

    setNewRole({ roleId: '', price: 0, income: 0 });
    setShowAddForm(false);
    toast.success('Role added to income shop!');
  };

  const handleRemoveRole = (roleId: string) => {
    setIncomeShopSettings(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.id !== roleId)
    }));
    toast.success('Role removed from income shop');
  };

  const getSelectedRole = () => {
    return roles.find(role => role.id === newRole.roleId);
  };

  const getRoleColor = (color: number) => {
    if (color === 0) return '#99AAB5';
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  const getAvailableRoles = () => {
    const usedRoleIds = incomeShopSettings.roles.map(role => role.roleId);
    return roles.filter(role => !usedRoleIds.includes(role.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading income shop settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-red-900 via-black to-red-900">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-black/30 border-r border-red-500/20 p-6 space-y-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512" 
              alt="DYSE Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-white text-lg font-semibold">Navigation</h2>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center space-x-3 text-red-200 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          to={`/guild/${guildId}`}
          className="flex items-center space-x-3 text-red-200 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <Link
          to={`/guild/${guildId}/auto-role`}
          className="flex items-center space-x-3 text-red-200 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
        >
          <Shield className="w-5 h-5" />
          <span>Auto-Role</span>
        </Link>
        <Link
          to={`/guild/${guildId}/income-shop`}
          className="flex items-center space-x-3 text-white bg-red-500/30 px-4 py-2 rounded-lg"
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512" 
                      alt="DYSE Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Income Shop</h1>
                    <p className="text-red-200 text-sm">Let users buy roles for extra income</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Income Shop Configuration</h2>
              <p className="text-red-200">Set up purchasable roles that provide passive income to users</p>
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
                    <h3 className="text-lg font-semibold text-white mb-2">Enable Income Shop</h3>
                    <p className="text-red-200 text-sm">Allow users to purchase roles that provide passive income</p>
                  </div>
                  <button
                    onClick={() => setIncomeShopSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      incomeShopSettings.enabled ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        incomeShopSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Income Roles List */}
              {incomeShopSettings.enabled && (
                <div className="bg-black/30 rounded-xl p-6 border border-red-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-6 h-6 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Income Roles</h3>
                    </div>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Role</span>
                    </button>
                  </div>

                  {/* Existing Roles */}
                  {incomeShopSettings.roles.length > 0 ? (
                    <div className="space-y-4">
                      {incomeShopSettings.roles.map((role) => (
                        <div key={role.id} className="bg-black/50 rounded-lg p-4 border border-red-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: getRoleColor(roles.find(r => r.id === role.roleId)?.color || 0) }}
                                />
                                <span className="text-white font-semibold">{role.roleName}</span>
                              </div>
                              <div className="flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="w-4 h-4 text-yellow-400" />
                                  <span className="text-yellow-400">Price: {role.price.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400">Income: {role.income.toLocaleString()}/day</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveRole(role.id)}
                              className="bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 p-2 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-red-400/50 mx-auto mb-4" />
                      <p className="text-red-200">No income roles configured yet</p>
                      <p className="text-red-300/70 text-sm">Add roles that users can purchase for passive income</p>
                    </div>
                  )}

                  {/* Add Role Form */}
                  {showAddForm && (
                    <div className="mt-6 bg-black/50 rounded-lg p-6 border border-red-500/30">
                      <h4 className="text-lg font-semibold text-white mb-4">Add New Income Role</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Role Selection */}
                        <div>
                          <label className="block text-sm font-medium text-red-200 mb-2">Role</label>
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
                                {getAvailableRoles().map((role) => (
                                  <button
                                    key={role.id}
                                    onClick={() => {
                                      setNewRole(prev => ({ ...prev, roleId: role.id }));
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
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-sm font-medium text-red-200 mb-2">Price</label>
                          <input
                            type="number"
                            value={newRole.price}
                            onChange={(e) => setNewRole(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                            placeholder="10000"
                            className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-red-300/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                          />
                        </div>

                        {/* Daily Income */}
                        <div>
                          <label className="block text-sm font-medium text-red-200 mb-2">Daily Income</label>
                          <input
                            type="number"
                            value={newRole.income}
                            onChange={(e) => setNewRole(prev => ({ ...prev, income: parseInt(e.target.value) || 0 }))}
                            placeholder="500"
                            className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-red-300/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            setNewRole({ roleId: '', price: 0, income: 0 });
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddRole}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                        >
                          Add Role
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Info Section */}
              <div className="bg-black/30 rounded-xl p-6 border border-red-500/10">
                <h3 className="text-lg font-semibold text-white mb-4">How Income Shop Works</h3>
                <div className="space-y-2 text-red-200 text-sm">
                  <p>• Users can purchase roles using their in-game currency</p>
                  <p>• Each role provides daily passive income to the user</p>
                  <p>• Users can own multiple income roles for stacked benefits</p>
                  <p>• Income is automatically distributed daily</p>
                  <p>• The bot must have permission to manage roles</p>
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

export default IncomeShop;