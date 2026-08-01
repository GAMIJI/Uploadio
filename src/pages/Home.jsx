import React, { useState, useCallback, Suspense, lazy, memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, ChevronDown, X, Sparkles, Upload
} from 'lucide-react';
import SEO from '../pages/SEO';
import { features, steps, testimonials, faqs, stats } from '../data/homeData';

// LAZY LOAD: ImageUploader modal component so react-dropzone is NOT loaded on initial home render
// This slashes the main thread parsing time and improves FCP and LCP.
const ImageUploader = lazy(() => import('../components/ImageUploader'));

const Home = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const openUploader = useCallback(() => setShowUploader(true), []);
  const closeUploader = useCallback(() => setShowUploader(false), []);

  return (
    <>
      <SEO title="Uploadio - The Ultimate AI Photo Studio" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden font-sans selection:bg-purple-500/30 selection:text-purple-900">
        
        {/* Subtle background dotted pattern */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply opacity-50" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply opacity-50" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply opacity-50" />

        {/* --- Hero Section (FIXED CLS: Replaced slide-in-from-bottom-8 with pure fade-in) --- */}
        <section className="relative z-10 pt-12 md:pt-24 pb-20 px-4">
          <div className="max-w-5xl mx-auto text-center animate-in fade-in duration-700 ease-out">
            
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-purple-100/50 rounded-full px-4 py-2 mb-8 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-shadow cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inset-0 rounded-full bg-purple-400 opacity-75" />
                <span className="relative rounded-full h-2.5 w-2.5 bg-purple-500" />
              </span>
              <span className="text-sm font-bold text-gray-600 tracking-wide">Trusted by 500,000+ creators worldwide</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold mb-6 tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600">
              The Ultimate <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                AI Photo Studio
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
              Remove backgrounds, generate compliance-ready passport photos, and perfectly optimize your images instantly. <span className="text-purple-600 font-bold">100% Free. No signup required.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {/* <button 
                onClick={openUploader}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              >
                <Upload className="w-5 h-5" />
                Upload Photo Free
              </button> */}
              <Link 
                to="/passport-photo-maker"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 rounded-2xl font-bold text-lg shadow-lg border border-gray-100 hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
              >
                Open Studio
              </Link>
            </div>

            {/* Micro Features */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" />Browser-based Privacy</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" />No Watermarks</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" />High-Res Export</div>
            </div>
          </div>
        </section>

        {/* --- Stats Banner (FIXED CLS: Replaced zoom-in-95 with pure fade-in) --- */}
        <section className="relative z-10 py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white p-8 shadow-xl shadow-purple-500/5 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100/50 animate-in fade-in duration-700">
              {stats.map((stat, i) => (
                <div key={i} className={`text-center ${i % 2 === 0 ? 'border-none md:border-solid' : 'border-none'} ${i === 0 ? 'border-none' : ''}`}>
                  <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">{stat.number}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Features Grid (FIXED CLS: Removed slide-in-from-bottom) --- */}
        <section className="relative z-10 py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
                Everything you need to create <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">perfect photos.</span>
              </h2>
              <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
                Stop paying for multiple subscriptions. Uploadio brings enterprise-grade AI tools directly to your browser for free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const IconComponent = feature.icon;
                return (
                  <div key={i} className="group bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-xl shadow-purple-500/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-default">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-500`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- How It Works --- */}
        <section className="relative z-10 py-24 bg-white/40 backdrop-blur-3xl border-y border-white/80">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
                How It Works
              </h2>
              <p className="text-gray-500 font-medium text-lg">Four simple steps to absolute perfection.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 z-0" />
              
              {steps.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div key={i} className="relative z-10 text-center flex flex-col items-center group">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-purple-500/10 border border-white mb-6 group-hover:scale-110 transition-transform duration-500">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <StepIcon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm mb-4 ring-4 ring-white shadow-sm">
                      {i + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm font-medium text-gray-500">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- Testimonials --- */}
        <section className="relative z-10 py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
                Loved by Creators
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-xl shadow-purple-500/5 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex gap-1 mb-6">
                    <span className="text-amber-400 font-bold">★★★★★</span>
                  </div>
                  <p className="text-gray-700 font-medium text-lg leading-relaxed mb-8 flex-grow">"{t.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 font-bold text-lg border border-white shadow-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ Section --- */}
        <section className="relative z-10 py-24 bg-white/40 backdrop-blur-3xl border-y border-white/80">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div 
                  key={i} 
                  className={`bg-white/80 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 ${activeFaq === i ? 'border-purple-300 shadow-lg shadow-purple-500/10' : 'border-white shadow-sm hover:border-purple-100'}`}
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left outline-none"
                  >
                    <span className={`font-bold text-lg ${activeFaq === i ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600' : 'text-gray-900'}`}>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-purple-500' : ''}`} />
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-gray-600 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lazy Loaded Upload Modal */}
        {showUploader && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={closeUploader} />
            {/* FIXED CLS: Removed slide-in-from-bottom, relying purely on fade-in opacity */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white max-w-2xl w-full p-2 relative z-10 animate-in fade-in duration-300">
              <button 
                onClick={closeUploader} 
                className="absolute top-6 right-6 z-20 w-10 h-10 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-500 rounded-full flex items-center justify-center transition-colors outline-none"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-4 md:p-8 pt-10">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2 text-center">Let's Get Started</h2>
                <p className="text-gray-500 font-medium text-center mb-8">Upload a photo to access all our AI tools.</p>
                <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Uploader...</div>}>
                  <ImageUploader onImageUpload={() => {
                    closeUploader();
                  }} theme="purple" />
                </Suspense>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default memo(Home);