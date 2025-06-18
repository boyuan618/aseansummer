import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Eye, EyeOff, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    programme: '',
    group: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    const success = await register(formData.name, formData.programme, formData.group, formData.password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Please fill in all fields correctly.');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 animate-pulse">
          <Users size={100} className="text-blue-300 transform rotate-12" />
        </div>
        <div className="absolute bottom-32 left-16 animate-bounce">
          <BookOpen size={90} className="text-yellow-400 transform -rotate-12" />
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Ship logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg mb-4 animate-pulse">
            <Anchor size={32} className="text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2 font-serif">
            Join the Crew
          </h1>
          <p className="text-blue-200 text-lg">Register for the Adventure</p>
        </div>

        {/* Register form */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-yellow-400/20 relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-yellow-400/30 rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-yellow-400/30 rounded-br-2xl"></div>

          <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6 font-serif">
            Become a Pirate
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-blue-200 font-medium mb-2">
                Pirate Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200"
                placeholder="Your pirate name"
                required
              />
            </div>

            <div>
              <label className="block text-blue-200 font-medium mb-2">
                Programme
              </label>
              <select
                name="programme"
                value={formData.programme}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white transition-all duration-200"
                required
              >
                <option value="">Select your programme</option>
                <option value="ASEAN Summer">ASEAN Summer</option>
                <option value="INSPIRASI">INSPIRASI</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-200 font-medium mb-2">
                Crew Group
              </label>
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white transition-all duration-200"
                required
              >
                <option value="">Select your group</option>
                <option value="1">The Wave Warriors</option>
                <option value="2">The Tidal Titans</option>
                <option value="3">The Freewind Pirates</option>
                <option value="4">The Treasure Trackers</option>
                <option value="5">The Stormriders</option>
                <option value="6">The Moonlit Mariners</option>
                <option value="7">The Seafaring Legends</option>
                <option value="8">The Compass Crusaders</option>
                <option value="9">The Rising Tide</option>
                <option value="10">The Majestic Raiders</option>
                <option value="11">The Horizon Hopper</option>
                <option value="12">The Infinite Navigators</option>
                <option value="13">The Gallant Privateers</option>
                <option value="14">The Celestial Sailors</option>
                <option value="15">The Admiral's Pride</option>
                <option value="16">The Silver Shark</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-200 font-medium mb-2">
                Secret Code
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200 pr-12"
                  placeholder="Create a secret code"
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
              Join the Adventure
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200">
              Already part of the crew?{' '}
              <Link 
                to="/login" 
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors hover:underline"
              >
                Set Sail
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;