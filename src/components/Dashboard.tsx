import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Crown, ExternalLink } from 'lucide-react';
import Layout from './Layout';

const Dashboard: React.FC = () => {
  const { guilds } = useAuth();
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Your Discord Servers</h2>
          <p className="text-red-300">Manage servers where the bot is installed</p>
        </div>

        {guilds.length === 0 ? (
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-12 text-center">
            <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Servers Found</h3>
            <p className="text-red-300 mb-6">
              The bot is not installed in any of your servers yet.
            </p>
            <a
              href="https://discord.com/oauth2/authorize?client_id=1322592306670338129&permissions=552172121201&response_type=code&redirect_uri=https%3A%2F%2Fdyse-dashboard.onrender.com%2Fapi%2Fcallback&integration_type=0&scope=identify+guilds+guilds.members.read+bot+guilds.channels.read+applications.commands"
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
                className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 hover:border-red-500/50 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl"
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
                  <div className="text-red-300 text-sm">
                    <p>Server ID: {guild.id}</p>
                  </div>
                  
                  <button
                    onClick={() => handleManageGuild(guild.id, guild.name)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Manage Server</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;