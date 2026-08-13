import React, { useState, useCallback, useEffect, useRef, Suspense, lazy, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle, ChevronDown, X, Sparkles, Upload, Crop, Eraser,
  Wand2, SlidersHorizontal, IdCard, Printer, Download, ArrowRight,
  GraduationCap, Briefcase, Plane, CreditCard, Car, FileText, Users,
  Building2, Globe2, ShieldCheck, Zap
} from 'lucide-react';
import SEO from '../pages/SEO';
import { features, testimonials, faqs, stats } from '../data/homeData';

// LAZY LOAD: ImageUploader modal component so react-dropzone is NOT loaded on initial home render
const ImageUploader = lazy(() => import('../components/ImageUploader'));

/* ------------------------------------------------------------------ */
/* Local data for new sections (kept in-file so homeData.js is untouched) */
/* ------------------------------------------------------------------ */

// Make sure these match the exact filenames in your public/samples folder
const sampleImages = [
  "/samples/sample-1.webp",
  "/samples/sample-2.webp",
];

const workflowSteps = [
  { id: 1, title: 'Upload your photo', desc: 'Drop in a selfie or an existing photo — JPG, PNG or HEIC, any resolution.', icon: Upload, image: '/samples/step-upload.webp' },
  { id: 2, title: 'Crop to size', desc: 'Drag the guide to frame your face to the exact passport ratio.', icon: Crop, image: '/samples/step-crop.webp' },
  { id: 3, title: 'Remove the background', desc: 'AI segments hair and edges in under two seconds. No green screen needed.', icon: Eraser, image: '/samples/step-bg.webp' },
  { id: 4, title: 'Touch it up', desc: 'Brush out blemishes, zoom in for detail, undo anytime you overdo it.', icon: Wand2, image: '/samples/step-touchup.webp' },
  { id: 5, title: 'Generate passport photo', desc: 'Head size and position are checked against your country’s official spec.', icon: IdCard, image: '/samples/step-passport.webp' },
  { id: 6, title: 'Build a print sheet', desc: 'Multiple copies laid out for a standard 4x6 print, ready for any pharmacy printer.', icon: Printer, image: '/samples/step-print.webp' },
];

const useCases = [
  { icon: GraduationCap, label: 'Students' },
  { icon: Briefcase, label: 'Professionals' },
  { icon: Plane, label: 'Visa applications' },
  { icon: CreditCard, label: 'Government IDs' },
  { icon: FileText, label: 'College forms' },
  { icon: Users, label: 'Resume photos' },
  { icon: Car, label: 'Driving license' },
  { icon: Building2, label: 'Job applications' },
  { icon: Globe2, label: 'Travel documents' },
];

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

/* ------------------------------------------------------------------ */
/* Reusable Components                                                */
/* ------------------------------------------------------------------ */

/** Lightweight count-up animation */
const AnimatedCounter = ({ value }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);
  const hasRun = useRef(false);

  useEffect(() => {
    const match = String(value).match(/^([\d.]+)(.*)$/);
    if (!match) { setDisplay(value); return; }
    const target = parseFloat(match[1]);
    const suffix = match[2] || '';
    if (prefersReducedMotion) { setDisplay(value); return; }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasRun.current) {
        hasRun.current = true;
        const duration = 1200;
        const start = performance.now();
        const isInt = Number.isInteger(target);

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          setDisplay(`${isInt ? Math.round(current) : current.toFixed(1)}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.4 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
};

/** Drag / touch controllable before-after comparison using real images */
const BeforeAfterSlider = () => {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updateFromClientX(clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [updateFromClientX]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-500/10 border border-white select-none cursor-ew-resize bg-gray-100"
      onMouseDown={(e) => { draggingRef.current = true; updateFromClientX(e.clientX); }}
      onTouchStart={(e) => { draggingRef.current = true; updateFromClientX(e.touches[0].clientX); }}
    >
      {/* AFTER (background removed image) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <img 
          src="/samples/sample-2.webp" 
          alt="AI Processed" 
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
      </div>

      {/* BEFORE (original image, clipped by slider position) */}
      <div
        className="absolute inset-0 bg-gray-200"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img 
          src="/samples/sample-1.webp" 
          alt="Original" 
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
        <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-gray-700 shadow-xs">
          Original
        </span>
      </div>

      <span className="absolute top-4 right-4 text-[11px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-purple-600 shadow-xs">
        AI Processed
      </span>

      {/* Slider Handle */}
      <div className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)] z-10" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-purple-600 border border-gray-100">
          <ArrowRight className="w-4 h-4 -ml-1.5 rotate-180" />
          <ArrowRight className="w-4 h-4 -ml-1.5" />
        </div>
      </div>
    </div>
  );
};

const HeroPipeline = () => {
  const stages = [
    { label: 'Original', icon: Upload },
    { label: 'Crop', icon: Crop },
    { label: 'Remove BG', icon: Eraser },
    { label: 'Enhance', icon: Wand2 },
    { label: 'Passport Photo', icon: IdCard },
    { label: 'Print Sheet', icon: Printer },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setActive((a) => (a + 1) % stages.length), 1400);
    return () => clearInterval(id);
  }, [stages.length]);

  return (
    <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white shadow-2xl shadow-purple-500/10 p-5 md:p-8">
      <div className="flex flex-col gap-3">
        {stages.map((stage, i) => {
          const StageIcon = stage.icon;
          const isActive = i === active;
          return (
            <div key={stage.label} className="flex items-center gap-4">
              <div
                className={`flex items-center gap-3 flex-1 rounded-2xl px-4 py-3 border transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-purple-200 shadow-md shadow-purple-500/10 scale-[1.02]'
                    : 'bg-white/60 border-gray-100/80'
                  }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${isActive ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-gray-100 text-gray-400'}`}>
                  <StageIcon className="w-4 h-4" />
                </div>
                <span className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{stage.label}</span>
              </div>
              {i < stages.length - 1 && (
                <ChevronDown className={`hidden md:block w-4 h-4 rotate-[-90deg] transition-colors duration-300 ${isActive ? 'text-purple-400' : 'text-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute -top-3.5 -right-3.5 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> Live pipeline
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Home Page Component                                           */
/* ------------------------------------------------------------------ */

const Home = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const openUploader = useCallback(() => setShowUploader(true), []);
  const closeUploader = useCallback(() => setShowUploader(false), []);

  // WebApplication JSON-LD Structured Data
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Uploadio - AI Photo Studio",
    "url": "https://Uploadio.com",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Browser-based AI photo studio to remove backgrounds, crop images, generate passport photos, and prepare print-ready photo sheets online.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  // FAQ Page JSON-LD Structured Data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      <SEO 
        title="Uploadio - The Ultimate Free AI Photo Studio Online" 
        description="Upload your photo to crop, remove backgrounds, generate compliant passport photos, and construct print-ready sheets directly in your browser."
        url="https://Uploadio.com"
      />

      <script type="application/ld+json">
        {JSON.stringify(webAppSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 relative overflow-hidden font-sans text-gray-800 selection:bg-purple-500/30 selection:text-purple-900">

        {/* Subtle background dotted pattern */}
        <div 
          className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
        />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[450px] md:w-[600px] h-[450px] md:h-[600px] bg-blue-400/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none mix-blend-multiply opacity-50" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-purple-400/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none mix-blend-multiply opacity-50" />
        <div className="absolute bottom-[-10%] left-[20%] w-[450px] md:w-[600px] h-[450px] md:h-[600px] bg-pink-400/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none mix-blend-multiply opacity-50" />

        {/* --- Hero Section --- */}
        <section className="relative z-10 pt-12 md:pt-20 pb-16 md:pb-20 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center motion-safe:animate-in motion-safe:fade-in duration-700">

            {/* LEFT: copy, CTAs */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-purple-100/80 rounded-full px-4 py-2 mb-6 shadow-xs hover:shadow-md transition-shadow cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inset-0 rounded-full bg-purple-400 opacity-75" />
                  <span className="relative rounded-full h-2.5 w-2.5 bg-purple-500" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-700 tracking-wide">Trusted by 500,000+ creators worldwide</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-[1.15] text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
                Passport photos <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  done by AI, not a queue.
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Upload a selfie. Uploadio crops it, removes the background, checks it against your country's official spec, and hands you a print-ready sheet — in under a minute, entirely in your browser.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                <Link
                  to="/passport-photo-maker"
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 active:translate-y-0 text-white rounded-2xl font-bold text-base shadow-xl shadow-gray-900/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 outline-none focus-visible:ring-4 focus-visible:ring-gray-900/20"
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Open Studio</span>
                </Link>
                {/* <button
                  type="button"
                  onClick={openUploader}
                  className="w-full sm:w-auto px-8 py-4 bg-white/90 hover:bg-white text-gray-800 rounded-2xl font-bold text-base shadow-lg border border-gray-200/80 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 outline-none focus-visible:ring-4 focus-visible:ring-gray-200 cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-purple-600" />
                  <span>Quick Upload</span>
                </button> */}
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-xs sm:text-sm font-bold text-gray-500">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />Browser-based Privacy</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />No Watermarks</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />High-Res Export</div>
              </div>
            </div>

            {/* RIGHT: animated pipeline mock */}
            <div>
              <HeroPipeline />
            </div>
          </div>
        </section>

        {/* --- Stats Banner --- */}
        <section className="relative z-10 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white p-6 md:p-8 shadow-xl shadow-purple-500/5 grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {stats.map((stat, i) => (
                <div key={i} className={`text-center ${i > 0 ? 'pt-4 md:pt-0' : ''}`}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                    <AnimatedCounter value={stat.number} />
                  </div>
                  <div className="text-[10px] sm:text-xs font-extrabold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Interactive Workflow Timeline --- */}
        <section className="relative z-10 py-16 md:py-24 bg-white/40 backdrop-blur-3xl border-y border-white/80">
          <div className="container mx-auto px-4 max-w-6xl">
            <header className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 tracking-tight">
                How Uploadio Works
              </h2>
              <p className="text-gray-500 font-medium text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                Six steps, one continuous flow. Select any stage to preview what happens inside the browser studio.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
              
              {/* Left: Step list / progress nav */}
              <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none snap-x">
                {workflowSteps.map((step, i) => {
                  const isActive = i === activeStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(i)}
                      className={`shrink-0 lg:shrink flex items-center gap-3.5 text-left px-4 py-3.5 rounded-2xl border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 snap-center cursor-pointer ${isActive
                          ? 'bg-white border-purple-200 shadow-lg shadow-purple-500/10 scale-[1.02] lg:scale-100 lg:translate-x-1.5'
                          : 'bg-white/50 border-transparent hover:bg-white/90 hover:border-gray-200'
                        }`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors duration-200 ${isActive ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-gray-100 text-gray-400'}`}>
                        {step.id}
                      </span>
                      <span className={`text-xs sm:text-sm font-bold whitespace-nowrap lg:whitespace-normal transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{step.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Active step detail */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-purple-500/5 p-6 md:p-8 flex flex-col gap-6 motion-safe:animate-in motion-safe:fade-in duration-300">
                
                {/* Premium Browser Window Showcase */}
                <div className="w-full aspect-[4/3] sm:aspect-video rounded-2xl bg-slate-50 overflow-hidden relative border border-gray-200/60 shadow-inner flex flex-col group pt-4 px-4 pb-0">
                  
                  {/* Subtle Dot Grid Background */}
                  <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

                  {/* App Window UI */}
                  <div className="relative w-full h-full bg-white rounded-t-xl shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.08)] border border-gray-200/80 border-b-0 flex flex-col z-10 transition-transform duration-300 group-hover:scale-[1.01] origin-bottom">
                    
                    {/* Browser Header */}
                    <div className="h-8 bg-gray-50/80 backdrop-blur-xs border-b border-gray-100 flex items-center px-3 gap-1.5 shrink-0 rounded-t-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>

                    {/* Image Container */}
                    <div className="flex-1 relative bg-gray-50/30 p-2 md:p-4 flex items-center justify-center">
                      <img 
                        src={workflowSteps[activeStep].image} 
                        alt={`Step ${workflowSteps[activeStep].id}: ${workflowSteps[activeStep].title}`} 
                        className="w-full h-full object-contain drop-shadow-xs transition-opacity duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                    </div>
                  </div>

                  {/* Floating Tool Icon Badge */}
                  <div className="absolute bottom-5 right-5 z-30">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-xl shadow-purple-500/10 text-purple-600">
                      {React.createElement(workflowSteps[activeStep].icon, { className: 'w-6 h-6' })}
                    </div>
                  </div>
                </div>

                {/* Text Description & Progress */}
                <div className="px-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full">
                      Step {workflowSteps[activeStep].id} of {workflowSteps.length}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2">{workflowSteps[activeStep].title}</h3>
                  <p className="text-gray-500 font-medium text-xs sm:text-sm md:text-base leading-relaxed mb-5">{workflowSteps[activeStep].desc}</p>
                  
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full transition-all duration-500 ease-out relative"
                      style={{ width: `${((activeStep + 1) / workflowSteps.length) * 100}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* --- Before / After Slider --- */}
        <section className="relative z-10 py-16 md:py-24 bg-white/50">
          <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Text Column */}
            <div className="order-2 lg:order-1 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 tracking-tight">
                Drag to see the difference
              </h2>
              <p className="text-gray-500 font-medium text-sm sm:text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                Uploadio's background removal keeps stray hairs, glasses reflections and soft edges intact — the details that make automated passport checks reject a photo.
              </p>

              <ul className="space-y-3 mb-8 w-full max-w-lg">
                {['Clean, compliant white or off-white background', 'Edge-aware hair and glasses handling', 'No visible halo or ghosting artifacts'].map((line) => (
                  <li key={line} className="flex items-center gap-3 text-gray-700 font-semibold text-xs sm:text-sm justify-center lg:justify-start">
                    <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slider Column */}
            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-purple-100 to-blue-50 rounded-[3rem] blur-2xl opacity-50 -z-10" />
              <BeforeAfterSlider />
            </div>

          </div>
        </section>

        {/* --- Features Grid --- */}
        <section className="relative z-10 py-16 md:py-24 bg-white/40 backdrop-blur-3xl border-y border-white/80">
          <div className="container mx-auto px-4 max-w-6xl">
            <header className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 tracking-tight">
                Everything you need to create <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">perfect photos.</span>
              </h2>
              <p className="text-gray-500 font-medium text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                Stop paying for multiple subscriptions. Uploadio brings enterprise-grade AI tools directly to your browser for free.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const IconComponent = feature.icon;
                return (
                  <article key={i} className="group bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white shadow-xl shadow-purple-500/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-default">
                    <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-md ${feature.shadow} group-hover:scale-105 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- Use Cases --- */}
        <section className="relative z-10 py-16 md:py-24 bg-white/40 backdrop-blur-3xl border-y border-white/80">
          <div className="container mx-auto px-4 max-w-6xl">
            <header className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 tracking-tight">
                One tool, every reason you need a photo
              </h2>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {useCases.map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white/80 rounded-2xl p-5 border border-white shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-100 flex items-center justify-center text-purple-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Testimonials --- */}
        <section className="relative z-10 py-16 md:py-24 bg-white/40 backdrop-blur-3xl border-y border-white/80">
          <div className="container mx-auto px-4 max-w-6xl">
            <header className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 tracking-tight">
                Loved by Creators
              </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white shadow-xl shadow-purple-500/5 flex flex-col h-full hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="flex gap-1 mb-4">
                    <span className="text-amber-400 font-bold text-sm">★★★★★</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700 font-medium leading-relaxed mb-6 flex-grow">"{t.content}"</p>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 font-bold text-sm border border-white shadow-xs">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">{t.name}</p>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ Section --- */}
        <section className="relative z-10 py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <header className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 tracking-tight">
                Frequently Asked Questions
              </h2>
            </header>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`bg-white/80 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-200 ${activeFaq === i ? 'border-purple-300 shadow-md shadow-purple-500/10' : 'border-white shadow-xs hover:border-purple-100'}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    aria-expanded={activeFaq === i}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left outline-none cursor-pointer"
                  >
                    <span className={`font-bold text-sm sm:text-base ${activeFaq === i ? 'text-purple-600' : 'text-gray-900'}`}>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${activeFaq === i ? 'rotate-180 text-purple-600' : ''}`} />
                  </button>
                  <div
                    className={`px-5 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed border-t border-gray-100 pt-3">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="relative z-10 py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-2xl shadow-purple-500/25 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
            <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">Your passport photo is a minute away</h2>
            <p className="relative text-white/80 font-medium text-xs sm:text-sm md:text-base mb-8 max-w-xl mx-auto">No signup, no watermark, no studio queue. Just a photo and a browser.</p>
            <div className="relative inline-flex flex-col sm:flex-row gap-3">
              <Link
                to="/passport-photo-maker"
                className="px-8 py-3.5 bg-white text-gray-900 hover:bg-gray-50 rounded-2xl font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Lazy Loaded Upload Modal */}
        {showUploader && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity" onClick={closeUploader} />
            <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white max-w-2xl w-full p-2 relative z-10 motion-safe:animate-in motion-safe:fade-in duration-200">
              <button
                type="button"
                onClick={closeUploader}
                aria-label="Close upload modal"
                className="absolute top-5 right-5 z-20 w-9 h-9 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-500 rounded-full flex items-center justify-center transition-colors outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-4 md:p-8 pt-8">
                <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1.5 text-center">Let's Get Started</h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium text-center mb-6">Upload a photo to access all our AI tools.</p>
                <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading Uploader...</div>}>
                  <ImageUploader onImageUpload={() => {
                    closeUploader();
                  }} theme="purple" />
                </Suspense>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
};

export default memo(Home);