import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, SquareCode, DollarSign, Banknote } from 'lucide-react';

const Login: React.FC = () => {
  const { loading, error } = useAuth();

  const handleLogin = () => {
    window.location.href = 'https://dyse-dashboard.onrender.com/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img 
                src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512" 
                alt="DYSE Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">DYSE Dashboard</h1>
            <p className="text-red-200">Configure DYSE Across Your Servers</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-red-100">
              <DollarSign className="w-5 h-5 text-red-400" />
              <span>Change Prefix of Bot Per Server</span>
            </div>
            <div className="flex items-center space-x-3 text-red-100">
              <Banknote className="w-5 h-5 text-red-400" />
              <span>Change the Currency Symbol</span>
            </div>
            <div className="flex items-center space-x-3 text-red-100">
              <SquareCode className="w-5 h-5 text-red-400" />
              <span>And Many More To Come Soon</span>
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
            By logging in, you agree to our{' '}
            <a 
              href="https://dyse.vercel.app/user-agreements/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a 
              href="https://dyse.vercel.app/user-agreements/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;