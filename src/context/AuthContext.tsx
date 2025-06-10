import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, DiscordUser, DiscordGuild } from '../types/discord';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('discord_user');
    const storedGuilds = localStorage.getItem('discord_guilds');
    const storedToken = localStorage.getItem('discord_token');

    if (storedUser && storedGuilds && storedToken) {
      setUser(JSON.parse(storedUser));
      setGuilds(JSON.parse(storedGuilds));
      setAccessToken(storedToken);
    }

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const guildsParam = urlParams.get('guilds');
    
    if (token && userParam && guildsParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        const guildsData = JSON.parse(decodeURIComponent(guildsParam));
        
        setUser(userData);
        setGuilds(guildsData);
        setAccessToken(token);

        // Store in localStorage
        localStorage.setItem('discord_user', JSON.stringify(userData));
        localStorage.setItem('discord_guilds', JSON.stringify(guildsData));
        localStorage.setItem('discord_token', token);

        toast.success(`Welcome back, ${userData.username}!`);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Error parsing OAuth callback data:', err);
        setError('Failed to process authentication data');
      }
    }
  }, []);

  const login = async (code: string) => {
    // This method is kept for compatibility but not used with the new flow
    setLoading(true);
    setError(null);
    // The actual login is handled by the redirect flow
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setGuilds([]);
    setAccessToken(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('discord_user');
    localStorage.removeItem('discord_guilds');
    localStorage.removeItem('discord_token');
    
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    guilds,
    accessToken,
    login,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};