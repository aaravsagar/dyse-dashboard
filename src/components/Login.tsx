import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Shield, Server, Settings } from 'lucide-react';

const Login: React.FC = () => {
  const { loading, error } = useAuth();

  const handleLogin = () => {
    window.location.href = 'http://dyse-dashboard.onrender.com/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Discord Dashboard</h1>
            <p className="text-red-200">Manage your Discord servers with ease</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-red-100">
              <Server className="w-5 h-5 text-red-400" />
              <span>Access your Discord servers</span>
            </div>
            <div className="flex items-center space-x-3 text-red-100">
              <Settings className="w-5 h-5 text-red-400" />
              <span>Manage bot settings</span>
            </div>
            <div className="flex items-center space-x-3 text-red-100">
              <Shield className="w-5 h-5 text-red-400" />
              <span>Secure OAuth2 authentication</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Login with Discord</span>
              </>
            )}
          </button>

          <p className="text-red-300 text-xs text-center mt-4">
            By logging in, you agree to our terms and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;