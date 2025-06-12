import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Settings, 
  Shield, 
  Users, 
  BarChart2, 
  LogOut, 
  Menu, 
  X,
  Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NavbarProps {
  guildId?: string;
  title?: string;
  subtitle?: string;
}

const Navbar: React.FC<NavbarProps> = ({ guildId, title = "DYSE Dashboard", subtitle = "Per Server customization" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.id === '746215033502957650';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home', active: location.pathname === '/dashboard' },
    ...(guildId ? [
      { to: `/guild/${guildId}`, icon: Settings, label: 'Settings', active: location.pathname === `/guild/${guildId}` },
      { to: `/guild/${guildId}/auto-role`, icon: Shield, label: 'Auto-Role', active: location.pathname === `/guild/${guildId}/auto-role` },
      { to: `/guild/${guildId}/income-shop`, icon: Users, label: 'Income Shop', active: location.pathname === `/guild/${guildId}/income-shop` },
      { to: `/dashboard/${guildId}/leaderboard`, icon: BarChart2, label: 'Leaderboard', active: location.pathname === `/dashboard/${guildId}/leaderboard` }
    ] : []),
    ...(isAdmin ? [
      { to: '/admin', icon: Wrench, label: 'Bot Admin', active: location.pathname === '/admin' }
    ] : [])
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-black border-b border-red-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512" 
                  alt="DYSE Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <p className="text-red-300 text-sm">{subtitle}</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user?.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-red-500"
                  />
                ) : (
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-white font-medium">{user?.username}</span>
                {isAdmin && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">ADMIN</span>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-white p-2 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-[73px] w-64 h-[calc(100vh-73px)] bg-gray-900 border-r border-red-500/30 p-6 space-y-2 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold">Navigation</h2>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              item.active
                ? 'text-white bg-red-600/30 border border-red-500/50'
                : 'text-red-200 hover:text-white hover:bg-red-500/20'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-red-500/30 p-6 space-y-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Navigation</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-red-200 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'text-white bg-red-600/30 border border-red-500/50'
                    : 'text-red-200 hover:text-white hover:bg-red-500/20'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Mobile User Info and Logout */}
            <div className="pt-6 mt-6 border-t border-red-500/30">
              <div className="flex items-center space-x-3 mb-4 px-4">
                {user?.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-red-500"
                  />
                ) : (
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-white font-medium block">{user?.username}</span>
                  {isAdmin && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">ADMIN</span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;