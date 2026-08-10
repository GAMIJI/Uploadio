import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Wand2, Zap, Clock, Calendar, ArrowRight, CheckCircle,
  Layers, Palette, SlidersHorizontal, Crop, Eraser, Filter, Sun,
  Contrast,  RotateCw, FlipHorizontal, FlipVertical,
  Scissors, Image as ImageIcon, FileText, Download, Share2,
  Mail, Bell, Star, Award, Shield, Lock, Eye, Globe,
  ChevronDown, ChevronUp, Play, Pause, X, Menu
} from 'lucide-react';
import SEO from './SEO';

// Check for reduced motion preference
const prefersReducedMotion = 
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const PhotoEditor = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Features list with enhanced details
  const features = [
    {
      icon: Wand2,
      title: 'AI-Powered Enhancement',
      description: 'One-click magic that transforms your photos with professional-grade AI.',
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/20',
      benefit: 'Instant professional results'
    },
    {
      icon: SlidersHorizontal,
      title: 'Precision Controls',
      description: 'Fine-tune every aspect with intuitive sliders for brightness, contrast, and more.',
      gradient: 'from-blue-500 to-indigo-500',
      shadow: 'shadow-blue-500/20',
      benefit: 'Full creative control'
    },
    {
      icon: Eraser,
      title: 'Smart Background Removal',
      description: 'Remove backgrounds with hair-edge precision in seconds.',
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      benefit: 'Professional cutouts'
    },
    {
      icon: Layers,
      title: 'Multi-Layer Editing',
      description: 'Work with multiple layers for complex compositions and advanced editing.',
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/20',
      benefit: 'Advanced compositions'
    },
  ];

  // Features for the animated carousel
  const carouselFeatures = useMemo(() => [
    { icon: Crop, label: 'Smart Crop' },
    { icon: Palette, label: 'Color Grading' },
    { icon: Filter, label: 'AI Filters' },
    { icon: Sun, label: 'Lighting Adjust' },
    { icon: Contrast, label: 'Contrast Control' },
    { icon: RotateCw, label: 'Rotation Tool' },
  ], []);

  // Auto-play carousel
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    autoPlayRef.current = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % carouselFeatures.length);
    }, 3000);
    
    return () => clearInterval(autoPlayRef.current);
  }, [carouselFeatures.length]);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30); // 30 days from now

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = useCallback((e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  }, [email]);

  // Time unit display
  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
        <span className="text-2xl md:text-3xl font-extrabold text-white">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs font-bold text-white/60 uppercase mt-2 tracking-wider">{label}</span>
    </div>
  );

  return (
    <>
      <SEO 
        title="Photo Editor - Coming Soon | Uploadio"
        description="Uploadio's professional photo editor is coming soon. Sign up to get early access and exclusive features."
        keywords="photo editor, AI photo editor, coming soon, photo editing, image editor"
      />

      {/* Enhanced Background with animated gradient mesh */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        
        {/* Animated Gradient Mesh Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          
          {/* Floating Particles */}
          {!prefersReducedMotion && (
            <>
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/10 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${10 + Math.random() * 20}s ease-in-out ${Math.random() * 10}s infinite alternate`,
                    transform: `scale(${0.5 + Math.random()})`
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          
          {/* Header with Glassmorphism */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-white/10 backdrop-blur rounded-xl border border-white/20 group-hover:border-white/40 transition-all duration-300">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Uploadio
                </span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link 
                  to="/"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden md:block"
                >
                  Home
                </Link>
                <Link 
                  to="/passport-photo-maker"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden md:block"
                >
                  Passport Photo
                </Link>
                <Link 
                  to="/background-remover"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden md:block"
                >
                  Remove BG
                </Link>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                  Notify Me
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
              
              {/* Left Column - Text Content */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2">
                  <div className={`w-2 h-2 bg-green-400 rounded-full ${prefersReducedMotion ? '' : 'animate-pulse'}`} />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Coming Soon</span>
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </div>

                {/* Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  <span className="text-white">Professional Photo Editor</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                    Coming Soon
                  </span>
                </h1>

                {/* Description */}
                <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                  Uploadio is crafting the most intuitive AI-powered photo editor. 
                  Get ready to transform your photos with professional-grade tools, 
                  completely free in your browser.
                </p>

                {/* Feature Highlights */}
                <div className="grid grid-cols-2 gap-3">
                  {features.slice(0, 4).map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white/5 backdrop-blur rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${feature.gradient} ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold text-white/80">{feature.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Countdown Timer */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Launch Countdown</span>
                  </div>
                  <div className="flex justify-center gap-4 md:gap-6">
                    <TimeUnit value={timeLeft.days} label="Days" />
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <TimeUnit value={timeLeft.minutes} label="Minutes" />
                    <TimeUnit value={timeLeft.seconds} label="Seconds" />
                  </div>
                </div>

                {/* Email Subscription */}
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  {isSubscribed ? (
                    <div className="flex items-center gap-3 text-green-400">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-bold">You're on the list! We'll notify you at launch.</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-white/60 mb-3">
                        Get early access and exclusive features
                      </p>
                      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="flex-1 px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <Mail className="w-4 h-4" />
                          Notify Me
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column - Interactive Preview */}
              <div className="relative">
                <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl shadow-purple-500/10">
                  
                  {/* Glass Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/40">Editor Preview</span>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>

                  {/* Mock Editor Interface */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden border border-white/5">
                    
                    {/* Image Placeholder with Gradient */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-40 bg-gradient-to-b from-purple-400/20 to-pink-400/20 rounded-full backdrop-blur" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
                    </div>

                    {/* Floating Tool Icons */}
                    {!prefersReducedMotion && (
                      <>
                        {carouselFeatures.map((feature, index) => {
                          const Icon = feature.icon;
                          const isActive = index === activeFeature;
                          return (
                            <div
                              key={index}
                              className={`absolute transition-all duration-500 ${
                                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                              }`}
                              style={{
                                top: `${20 + Math.random() * 60}%`,
                                left: `${10 + Math.random() * 80}%`,
                              }}
                            >
                              <div className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/20 shadow-lg">
                                <Icon className="w-5 h-5 text-purple-400" />
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Editor Controls Mock */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 border border-white/20">
                      <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                        <SlidersHorizontal className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                        <Palette className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                        <Crop className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                        <Wand2 className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* AI Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1.5 shadow-lg shadow-purple-500/30">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white">AI Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      Coming Soon
                    </span>
                    <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      Free
                    </span>
                    <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      Browser-Based
                    </span>
                    <span className="text-[10px] font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      No Signup
                    </span>
                  </div>
                </div>

                    
              </div>
            </div>

            {/* Features Preview Section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="group p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.shadow} inline-block mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-400">
                      <span>{feature.benefit}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
                <p>© 2024 Uploadio. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
                  <Link to="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
                  <Link to="/cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float {
          animation: float ${prefersReducedMotion ? '0.01ms' : '20s'} ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse ${prefersReducedMotion ? '0.01ms' : '3s'} ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default React.memo(PhotoEditor);