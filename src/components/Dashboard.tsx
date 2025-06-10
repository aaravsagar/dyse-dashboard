import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Users, Crown, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user, guilds, logout } = useAuth();
  const navigate = useNavigate();

  const handleManageGuild = (guildId: string, guildName: string) => {
    navigate(`/guild/${guildId}`, { state: { guildName } });
  };

  const getGuildIconUrl = (guild: any) => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
    }
    return null;
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-red-600 w-10 h-10 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Discord Dashboard</h1>
                <p className="text-red-200 text-sm">Server Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-200 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Your Discord Servers</h2>
          <p className="text-red-200">Manage servers where the bot is installed</p>
        </div>

        {guilds.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-red-500/20">
            <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Servers Found</h3>
            <p className="text-red-200 mb-6">
              The bot is not installed in any of your servers yet.
            </p>
            <a
              href="https://discord.com/oauth2/authorize?client_id=1322592306670338129&permissions=563794183317585&scope=bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Invite Bot to Server</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guilds.map((guild) => (
              <div
                key={guild.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex items-center space-x-4 mb-4">
                  {getGuildIconUrl(guild) ? (
                    <img
                      src={getGuildIconUrl(guild)!}
                      alt={guild.name}
                      className="w-12 h-12 rounded-full border-2 border-red-500"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {guild.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {guild.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {guild.owner && (
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Crown className="w-4 h-4" />
                          <span className="text-xs">Owner</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-red-200 text-sm">
                    <p>Server ID: {guild.id}</p>
                  </div>
                  
                  <button
                    onClick={() => handleManageGuild(guild.id, guild.name)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Manage Server</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;