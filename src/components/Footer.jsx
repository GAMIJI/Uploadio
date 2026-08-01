import React, { useEffect, useState, memo } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Heart, Sparkles, ArrowUp, Send, Globe, ChevronRight, Crop, Zap, RefreshCw, Image as ImageIcon } from 'lucide-react'

// MOVED OUTSIDE COMPONENT: Prevents memory reallocation on scroll re-renders
const footerLinks = {
  tools: [
    { name: 'Passport Photo', path: '/passport-photo-maker', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { name: 'Background Remover', path: '/background-remover', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { name: 'Image Resizer', path: '/image-resizer', icon: <Crop className="w-3.5 h-3.5" /> },
    { name: 'Image Compressor', path: '/image-compressor', icon: <Zap className="w-3.5 h-3.5" /> },
    { name: 'Image Converter', path: '/image-converter', icon: <RefreshCw className="w-3.5 h-3.5" /> },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Blog', path: '/blog' },
  ],
  support: [
    { name: 'Help Center', path: '/help' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'API Documentation', path: '/api-docs' },
    { name: 'Report Issue', path: '/report' },
  ]
}

const socialLinks = [
  { name: 'Email', icon: <Mail className="w-4 h-4" />, url: 'mailto:hello@uploadio.com', hoverClass: 'hover:bg-rose-500 hover:text-white hover:border-rose-500' },
  { name: 'Website', icon: <Globe className="w-4 h-4" />, url: 'https://uploadio.com', hoverClass: 'hover:bg-emerald-500 hover:text-white hover:border-emerald-500' },
  { name: 'Contact', icon: <Send className="w-4 h-4" />, url: '/contact', hoverClass: 'hover:bg-blue-500 hover:text-white hover:border-blue-500', isInternal: true },
]

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/40 text-gray-700 mt-20 border-t border-white/80 overflow-hidden font-sans">
      
      {/* Ambient Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[200px] w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute -bottom-[200px] left-[20%] w-[500px] h-[500px] rounded-full bg-pink-400/20 blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }} />
        
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-10 max-w-7xl">
        
        {/* Newsletter / CTA Banner */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] p-8 md:p-10 mb-20 shadow-xl shadow-purple-500/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 w-full md:w-1/2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Join the AI Revolution</h3>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">
              Get the latest updates on new tools, features, and exclusive creator tips delivered straight to your inbox.
            </p>
          </div>
          
          <div className="relative z-10 w-full md:w-1/2 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-4 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all text-sm font-medium shadow-sm"
              aria-label="Email for newsletter"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0">
              Subscribe
            </button>
          </div>
        </div>

        {/* Main Footer Grid - FIXED FOR TABLET/MOBILE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-4 lg:pr-8">
            <Link to="/" className="flex items-center gap-3 mb-6 group inline-flex">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-lg border border-gray-100 shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-500 group-hover:-translate-y-1">
                <img 
                  src="/logo.webp" 
                  alt="Uploadio Logo" 
                  width="28" 
                  height="28" 
                  className="w-7 h-7 object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight leading-none block group-hover:to-blue-600 transition-colors duration-300">
                  Uploadio
                </span>
                <span className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-widest mt-0.5 block">
                  Photo Studio
                </span>
              </div>
            </Link>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm font-medium">
              Transform your photos instantly with cutting-edge AI technology. Remove backgrounds, upscale, and format perfectly—all in your browser, completely free.
            </p>

            {/* Micro Stats */}
            <div className="flex gap-6 mb-8 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/80 w-fit shadow-sm">
              <div>
                <p className="text-xl font-extrabold text-gray-900 mb-0.5">500K+</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Creators</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xl font-extrabold text-gray-900 mb-0.5">2M+</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Processed</p>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                social.isInternal ? (
                  <Link
                    key={social.name}
                    to={social.url}
                    className={`w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-600 transition-all duration-300 hover:scale-110 ${social.hoverClass}`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </Link>
                ) : (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-600 transition-all duration-300 hover:scale-110 ${social.hoverClass}`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Links Columns Container - FIXED INNER GRID */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10">
            
            {/* Tools Column */}
            <div className="bg-white/40 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/60 shadow-sm h-full">
              <h3 className="text-gray-900 font-extrabold text-base mb-6 tracking-wide">AI Tools</h3>
              <ul className="space-y-3.5">
                {footerLinks.tools.map((tool) => (
                  <li key={tool.path}>
                    <Link
                      to={tool.path}
                      className="group flex items-center gap-2.5 text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
                    >
                      <span className="p-1.5 rounded-xl bg-white border border-gray-100 text-gray-500 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shrink-0">
                        {tool.icon}
                      </span>
                      <span className="relative overflow-hidden line-clamp-1">
                        {tool.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="bg-white/40 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/60 shadow-sm h-full">
              <h3 className="text-gray-900 font-extrabold text-base mb-6 tracking-wide">Company</h3>
              <ul className="space-y-3.5">
                {footerLinks.company.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="group flex items-center text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-3 text-purple-600 transition-all duration-300 group-hover:opacity-100 group-hover:ml-0 mr-1.5 shrink-0" />
                      <span className="relative overflow-hidden line-clamp-1">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div className="bg-white/40 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/60 shadow-sm h-full sm:col-span-2 md:col-span-1">
              <h3 className="text-gray-900 font-extrabold text-base mb-6 tracking-wide">Resources</h3>
              <ul className="space-y-3.5">
                {footerLinks.support.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="group flex items-center text-sm font-semibold text-gray-600 hover:text-pink-600 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-3 text-pink-600 transition-all duration-300 group-hover:opacity-100 group-hover:ml-0 mr-1.5 shrink-0" />
                      <span className="relative overflow-hidden line-clamp-1">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm font-medium order-2 md:order-1">
            <p className="flex items-center gap-1.5 justify-center md:justify-start">
              © {currentYear} Uploadio. Built with 
              <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-current" aria-hidden="true" />
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-bold text-gray-500 order-1 md:order-2">
            <Link to="/privacy-policy" className="hover:text-purple-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">Privacy</Link>
            <Link to="/terms" className="hover:text-purple-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">Terms</Link>
            <Link to="/cookies" className="hover:text-purple-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">Cookies</Link>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <div 
        className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          aria-label="Scroll to top of page"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" aria-hidden="true" />
        </button>
      </div>
    </footer>
  )
}

export default memo(Footer)