import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Hand, ArrowRight, MessageSquare, Globe, Users, Shield, ChevronDown, Star } from 'lucide-react';
import signLanguageDemo from '../assets/images/sign-language-demo.png';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Check if elements are in viewport for animations
      const features = featuresRef.current;
      const cta = ctaRef.current;
      
      if (features) {
        const featureRect = features.getBoundingClientRect();
        setIsVisible(prev => ({
          ...prev,
          features: featureRect.top < window.innerHeight && featureRect.bottom > 0
        }));
      }
      
      if (cta) {
        const ctaRect = cta.getBoundingClientRect();
        setIsVisible(prev => ({
          ...prev,
          cta: ctaRect.top < window.innerHeight && ctaRect.bottom > 0
        }));
      }
    };
    
    // Track mouse position for parallax effects
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 overflow-hidden">
      {/* Hero Section */}
      <header className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-100" 
          style={{
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
            transition: 'transform 0.1s ease-out'
          }}>
        </div>
        
        {/* Floating particles background effect with mouse parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => {
            const size = Math.random() * 50 + 10;
            // Reduce the parallax factor to slow down movement with mouse
            const parallaxFactor = Math.random() * 15 + 5; // Changed from 30+10 to 15+5
            return (
              <div 
                key={i}
                className="absolute rounded-full bg-purple-500 opacity-10"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  // Slow down the transition speed
                  transform: `translate(${mousePosition.x * parallaxFactor}px, ${mousePosition.y * parallaxFactor}px)`,
                  transition: 'transform 0.5s ease-out', // Added transition for smoother movement
                  // Increase animation duration for slower floating effect
                  animation: `float ${Math.random() * 15 + 20}s linear infinite, pulse ${Math.random() * 8 + 4}s ease-in-out infinite`, // Increased from 10+10s to 15+20s
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            );
          })}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 md:pr-12 transform transition-all duration-1000 ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}">
              <div className="flex items-center mb-6 transform transition-all duration-500 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4 shadow-lg animate-bounce">
                  <Hand className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 animate-text-shimmer">
                  SignBridge
                </h1>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 animate-fade-in-up">
                Breaking barriers in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 animate-gradient-x">sign language</span> communication
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                SignBridge connects the hearing and deaf communities through innovative sign language translation technology. Experience seamless communication without barriers.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group">
                  <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform skew-x-12 translate-x-full group-hover:translate-x-[-100%]"></span>
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-md transition duration-300 ease-in-out hover:shadow-lg hover:scale-105 relative overflow-hidden group">
                  <span className="absolute top-0 left-0 w-full h-full bg-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 transform skew-x-12 translate-x-full group-hover:translate-x-[-100%]"></span>
                  Sign In
                </Link>
              </div>
              
              <div className="mt-12 hidden sm:block animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <a href="#features" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-300 group">
                  <span className="mr-2 group-hover:underline">Discover how it works</span>
                  <ChevronDown className="h-5 w-5 animate-bounce" />
                </a>
              </div>
            </div>
            
            <div className="hidden md:block md:w-1/2 mt-10 md:mt-0 transform transition-all duration-1000 ${scrolled ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}">
              <div className="relative">
                {/* Multiple layered glows for depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-xl animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl transform -rotate-2 scale-103 opacity-10 blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
                
                <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-500 hover:rotate-1 hover:scale-105 backdrop-filter backdrop-blur-sm bg-opacity-90"
                  style={{
                    transform: `perspective(1000px) rotateY(${(mousePosition.x - 0.5) * 5}deg) rotateX(${(mousePosition.y - 0.5) * -5}deg)`,
                    transition: 'transform 0.1s ease-out'
                  }}>
                  <div className="absolute -top-4 -right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg transform rotate-3 animate-pulse">New</div>
                  <img 
                    src={signLanguageDemo}
                    alt="SignBridge Demo" 
                    className="rounded-xl w-full h-auto shadow-md"
                  />
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-ping opacity-75"></div>
                      <p className="text-sm text-gray-600 font-medium">Real-time translation active</p>
                    </div>
                  </div>
                  
                  {/* Floating elements around the image */}
                  <div className="absolute -top-8 -left-8 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '0.5s'}}>
                    <Hand className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shadow-lg animate-float" style={{animationDelay: '1.2s'}}>
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-purple-600 rounded-full flex justify-center pt-1">
            <div className="w-1 h-3 bg-purple-600 rounded-full animate-scroll-down"></div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className={`py-20 bg-white relative ${isVisible.features ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-indigo-100 to-white opacity-70"></div>
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center animate-float">
          <ChevronDown className="h-8 w-8 text-purple-600" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-3 animate-fade-in-up">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Bridging Communication Gaps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              Our platform uses advanced technology to bridge communication gaps between sign language users and the hearing community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-purple-50 rounded-xl p-8 transition-all duration-500 hover:shadow-xl hover:transform hover:-translate-y-2 hover:bg-purple-100 border border-transparent hover:border-purple-200 relative overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6 shadow-md group-hover:bg-purple-200 transition-colors duration-300 group-hover:animate-bounce">
                  <MessageSquare className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Language Translation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Convert sign language to text and speech in real-time, making communication accessible for everyone.
                </p>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <span className="text-sm font-medium text-purple-700 flex items-center">
                    <Star className="h-4 w-4 mr-1 animate-spin-slow" /> Powered by AI
                  </span>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-indigo-50 rounded-xl p-8 transition-all duration-500 hover:shadow-xl hover:transform hover:-translate-y-2 hover:bg-indigo-100 border border-transparent hover:border-indigo-200 relative overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6 shadow-md group-hover:bg-indigo-200 transition-colors duration-300 group-hover:animate-bounce">
                  <Globe className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Speech to Sign</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transform spoken words into sign language, helping hearing individuals communicate with the deaf community.
                </p>
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <span className="text-sm font-medium text-indigo-700 flex items-center">
                    <Star className="h-4 w-4 mr-1 animate-spin-slow" /> Intuitive Interface
                  </span>
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-blue-50 rounded-xl p-8 transition-all duration-500 hover:shadow-xl hover:transform hover:-translate-y-2 hover:bg-blue-100 border border-transparent hover:border-blue-200 relative overflow-hidden group animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 shadow-md group-hover:bg-blue-200 transition-colors duration-300 group-hover:animate-bounce">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community Connection</h3>
                <p className="text-gray-600 leading-relaxed">
                  Join a growing community of users breaking down communication barriers and fostering inclusivity.
                </p>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <span className="text-sm font-medium text-blue-700 flex items-center">
                    <Star className="h-4 w-4 mr-1 animate-spin-slow" /> Global Network
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className={`py-20 bg-gradient-to-r from-purple-600 to-indigo-600 relative overflow-hidden ${isVisible.cta ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Animated background */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => {
            const size = Math.random() * 100 + 50;
            return (
              <div 
                key={i}
                className="absolute rounded-full bg-white opacity-10"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animation: `float ${Math.random() * 10 + 15}s linear infinite, pulse ${Math.random() * 5 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            );
          })}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to bridge the communication gap?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Join thousands of users who are already experiencing barrier-free communication with SignBridge.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-gray-50 shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group">
              <span className="absolute top-0 left-0 w-full h-full bg-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 transform skew-x-12 translate-x-full group-hover:translate-x-[-100%]"></span>
              Create Free Account
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 border border-white text-base font-medium rounded-md text-white hover:bg-purple-700 transition duration-300 ease-in-out hover:scale-105 backdrop-filter backdrop-blur-sm bg-white bg-opacity-10 relative overflow-hidden group">
              <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 transform skew-x-12 translate-x-full group-hover:translate-x-[-100%]"></span>
              Sign In
            </Link>
          </div>
          <div className="mt-10 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <span className="inline-block px-4 py-2 rounded-full bg-white bg-opacity-20 text-white text-sm animate-pulse">
              No credit card required • Free forever
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="flex items-center transform transition-all duration-300 hover:scale-110">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg animate-pulse">
                <Hand className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-200 animate-gradient-x">
                SignBridge
              </span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} SignBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }
        
        @keyframes scroll-down {
          0% { transform: translateY(0); opacity: 1; }
          75% { transform: translateY(6px); opacity: 0; }
          80% { transform: translateY(0); opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes text-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 4s ease infinite;
        }
        
        .animate-scroll-down {
          animation: scroll-down 2s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-text-shimmer {
          background-size: 200% 100%;
          animation: text-shimmer 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;