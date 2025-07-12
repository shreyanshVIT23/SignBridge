import React from 'react';
import { Link } from 'react-router-dom';
import { Hand, ArrowRight, MessageSquare, Globe, Users, Shield } from 'lucide-react';
// Add this import at the top of the file
import signLanguageDemo from '../assets/images/sign-language-demo.png';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 md:pr-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                  <Hand className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900">SignBridge</h1>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Breaking barriers in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">sign language</span> communication
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                SignBridge connects the hearing and deaf communities through innovative sign language translation technology. Experience seamless communication without barriers.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition duration-300 ease-in-out">
                  Sign In
                </Link>
              </div>
            </div>
            
            <div className="hidden md:block md:w-1/2 mt-10 md:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-xl"></div>
                <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                  <img 
                    src="/src/assets/images/sign-language-demo.png" 
                    alt="SignBridge Demo" 
                    className="rounded-xl w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SignBridge Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform uses advanced technology to bridge communication gaps between sign language users and the hearing community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-purple-50 rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Language Translation</h3>
              <p className="text-gray-600">
                Convert sign language to text and speech in real-time, making communication accessible for everyone.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-indigo-50 rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Speech to Sign</h3>
              <p className="text-gray-600">
                Transform spoken words into sign language, helping hearing individuals communicate with the deaf community.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-blue-50 rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Connection</h3>
              <p className="text-gray-600">
                Join a growing community of users breaking down communication barriers and fostering inclusivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to bridge the communication gap?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Join thousands of users who are already experiencing barrier-free communication with SignBridge.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-gray-50 shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1">
              Create Free Account
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 border border-white text-base font-medium rounded-md text-white hover:bg-purple-700 transition duration-300 ease-in-out">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Hand className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">SignBridge</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">About</a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center md:text-left text-gray-400">
            <p>© {new Date().getFullYear()} SignBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;