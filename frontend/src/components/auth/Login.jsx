import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '/src/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Hand, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Check for dark mode preference in localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    setDarkMode(savedMode ? JSON.parse(savedMode) : false);
  }, []);

  // Initialize Vanta.js effect
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = window.VANTA.HALO({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        backgroundColor: 0x131a43,
        baseColor: 0x1a59,
        size: 2.00,
        amplitudeFactor: 1.50,
        xOffset: 0.13,
        yOffset: 0.05
      });
    }
    
    // Cleanup function
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={vantaRef} className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-md w-full z-10">
        {/* Logo and branding */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Hand className={`h-7 w-7 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h1 className="text-3xl font-extrabold text-white">SignBridge</h1>
        </div>
        
        {/* Card container */}
        <div className={`backdrop-blur-sm rounded-2xl shadow-2xl p-8 transform transition-all duration-300 ${darkMode ? 'bg-gray-800/90 hover:shadow-purple-800/20' : 'bg-white/95 hover:shadow-purple-300/20'}`}>
          <div>
            <h2 className={`text-center text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome Back
            </h2>
            <p className={`text-center mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Sign in to continue your journey
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`border-l-4 border-red-500 rounded-md p-4 ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <div className="flex items-center">
                  <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-150 ease-in-out ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-150 ease-in-out ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="flex items-center">
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/register" className={`font-medium transition duration-150 ease-in-out ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'}`}>
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
