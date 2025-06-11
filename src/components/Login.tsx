import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Eye, EyeOff, Compass } from 'lucide-react';
import { supabase } from '../supabase';  // import your supabase client

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !password) {
      setError('Please enter both pirate name and secret code.');
      return;
    }

    try {
      // Supabase query: find user with username and password
      const { data, error: fetchError } = await supabase
        .from('Users')
        .select('username, program, group')
        .eq('username', name)
        .eq('password', password)
        .single();

      if (fetchError || !data) {
        setError('Invalid credentials. Please try again.');
        return;
      }

      // Optionally, you can store user info in local storage or context here
      // For example, redirecting to dashboard:
      navigate('/dashboard', { state: { user: data } });

    } catch (err) {
      setError('Something went wrong. Please try again later.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 animate-pulse">
          <Compass size={120} className="text-yellow-400 transform rotate-12" />
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce">
          <Anchor size={80} className="text-blue-300 transform -rotate-12" />
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Ship logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg mb-4 animate-pulse">
            <Anchor size={32} className="text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2 font-serif">
            Pirate's Quest
          </h1>
          <p className="text-blue-200 text-lg">Amazing Race Adventure</p>
        </div>

        {/* Login form */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-yellow-400/20 relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-yellow-400/30 rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-yellow-400/30 rounded-br-2xl"></div>

          <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6 font-serif">
            Set Sail, Matey!
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-blue-200 font-medium mb-2">
                Pirate Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200"
                placeholder="Enter your pirate name"
                required
              />
            </div>

            <div>
              <label className="block text-blue-200 font-medium mb-2">
                Secret Code
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200 pr-12"
                  placeholder="Enter your secret code"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
            >
              Board the Ship
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200">
              New to the crew?{' '}
              <Link 
                to="/register" 
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors hover:underline"
              >
                Join the Adventure
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
