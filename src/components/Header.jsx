import React, { memo, useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Camera, ChevronDown, Sparkles, Home, Image as ImageIcon, Crop, RefreshCw, Layers, Zap, CheckCircle } from 'lucide-react'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const location = useLocation()

  // Elegant scroll detection
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20
          setScrolled(prev => (prev === isScrolled ? prev : isScrolled))
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setActiveDropdown(null)
  }, [location])

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: <Home className="w-4 h-4" />,
      exact: true
    },
    {
      path: '/passport-photo-maker',
      label: 'Passport Photo',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      path: '/background-remover',
      label: 'Remove BG',
      icon: <Sparkles className="w-4 h-4" />,
    },
  ]

  const toolsDropdown = [
    {
      path: '/image-resizer',
      label: 'Image Resizer',
      icon: <Crop className="w-4 h-4 text-white" />,
      description: 'Scale & adjust dimensions',
      gradient: 'from-blue-500 to-indigo-500',
      shadow: 'shadow-blue-500/20'
    },
    {
      path: '/image-compressor',
      label: 'Image Compressor',
      icon: <Zap className="w-4 h-4 text-white" />,
      description: 'Reduce file size instantly',
      gradient: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/20'
    },
    {
      path: '/image-converter',
      label: 'Image Converter',
      icon: <RefreshCw className="w-4 h-4 text-white" />,
      description: 'Switch between PNG, JPG, WEBP',
      gradient: 'from-orange-400 to-rose-500',
      shadow: 'shadow-orange-500/20'
    },
  ]

  const isActivePath = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 py-4 md:py-5 transition-colors duration-300 ${scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center transition-colors duration-300">

            {/* Animated Logo Section */}
            <Link
              to="/"
              className="flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
            >

              <div className="relative flex items-center justify-center overflow-hidden rounded-2xl">
                <img
                  src="/logo.webp"
                  alt="Uploadio Logo"
                  className="w-12 h-12 md:w-14 md:h-14 object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>


              <div className="flex flex-col justify-center">

                <span className="text-xl md:text-2xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Uploadio
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mt-0.5 hidden sm:block">
                  AI IMAGE TOOLS
                </span>

              </div>
            </Link>

            {/* Desktop Navigation (Floating Pills) */}
            <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-gray-50/50 border border-gray-100/80 shadow-inner backdrop-blur-sm">
              {navItems.map((item) => {
                const active = isActivePath(item.path, item.exact)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={`
                      relative px-5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-300 flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                      ${active ? 'text-blue-700 bg-white shadow-sm border border-gray-100/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}
                    `}
                  >
                    <span className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}

              {/* Tools Dropdown Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('tools')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`
                    px-5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-300 flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${activeDropdown === 'tools' ? 'text-gray-900 bg-gray-100/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}
                  `}
                  aria-expanded={activeDropdown === 'tools'}
                >
                  <Layers className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeDropdown === 'tools' ? 'scale-110 text-blue-600' : 'group-hover:scale-110'}`} />
                  <span>Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeDropdown === 'tools' ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {/* Invisible hover bridge to prevent dropdown from closing instantly */}
                <div className="absolute top-full left-0 w-full h-5" />

                {/* Dropdown Menu Overlay */}
                <div
                  className={`
                    absolute top-[calc(100%+0.75rem)] right-0 w-[340px] bg-white/95 backdrop-blur-md rounded-[1.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-2.5 transition-all duration-400 origin-top-right
                    ${activeDropdown === 'tools' ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
                  `}
                >
                  <div className="grid gap-1">
                    {toolsDropdown.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className="flex items-start gap-4 p-3.5 rounded-[1.25rem] hover:bg-gray-50/80 transition-colors duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <div className={`w-11 h-11 rounded-[0.85rem] bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 shadow-lg ${tool.shadow} group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}>
                          {tool.icon}
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors duration-200">{tool.label}</p>
                          <p className="text-[11px] font-semibold text-gray-500 line-clamp-1">{tool.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-11 h-11 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100/80 shadow-sm flex items-center justify-center text-gray-600 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <span className={`absolute transition-colors duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}>
                  <Menu className="w-5 h-5" />
                </span>
                <span className={`absolute transition-colors duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
                  <X className="w-5 h-5" />
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`
            lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-colors duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-top overflow-hidden
            ${isOpen ? 'max-h-[85vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
          `}
        >
          <div className="p-5 space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar pb-10">

            {/* Primary Nav */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-2 mb-3">Main Menu</p>
              {navItems.map((item) => {
                const active = isActivePath(item.path, item.exact);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-colors duration-300
                      ${active ? 'bg-blue-50/80 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}
                    `}
                  >
                    <span className={`transition-transform duration-300 ${active ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {active && <CheckCircle className="w-4 h-4 ml-auto text-blue-600 animate-in zoom-in duration-300" />}
                  </NavLink>
                )
              })}
            </div>

            <div className="w-full h-px bg-gray-100/80" />

            {/* Tools Nav */}
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-2 mb-3">AI Tools</p>
              <div className="grid gap-2.5">
                {toolsDropdown.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-gray-100 bg-white/50 shadow-sm hover:border-gray-200 hover:bg-white transition-colors duration-300 active:scale-[0.98]"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 shadow-md ${tool.shadow}`}>
                      {tool.icon}
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-bold text-gray-900">{tool.label}</p>
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Dynamic Spacer to prevent content from hiding under the fixed header */}
      <div className="h-[72px] md:h-24" />
    </>
  )
}

export default memo(Header)