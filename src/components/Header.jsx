import React, { memo, useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Sparkles, Home, Image as ImageIcon, Crop, RefreshCw, Layers, Zap, CheckCircle } from 'lucide-react'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const location = useLocation()

  // High-performance scroll detection
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 15
          setScrolled(prev => (prev === isScrolled ? prev : isScrolled))
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
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
      gradient: 'from-blue-500/80 to-indigo-500/80',
      shadow: 'shadow-blue-500/20'
    },
    {
      path: '/image-compressor',
      label: 'Image Compressor',
      icon: <Zap className="w-4 h-4 text-white" />,
      description: 'Reduce file size instantly',
      gradient: 'from-emerald-400/80 to-teal-500/80',
      shadow: 'shadow-emerald-500/20'
    },
    {
      path: '/image-converter',
      label: 'Image Converter',
      icon: <RefreshCw className="w-4 h-4 text-white" />,
      description: 'Switch between PNG, JPG, WEBP',
      gradient: 'from-orange-400/80 to-rose-500/80',
      shadow: 'shadow-orange-500/20'
    },
  ]

  const isActivePath = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      {/* Floating Island Header Container */}
      <header className="fixed top-0 inset-x-0 z-50 pt-3 md:pt-4 px-3 sm:px-6 lg:px-8 transition-all duration-500 pointer-events-none">
        <div 
          className={`max-w-6xl mx-auto rounded-[1.75rem] pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled 
              ? 'bg-white/60 backdrop-blur-2xl backdrop-saturate-200 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] py-2.5 px-4 md:px-6' 
              : 'bg-white/40 backdrop-blur-xl backdrop-saturate-150 border border-white/60 shadow-[0_4px_24px_0_rgba(0,0,0,0.03)] py-3 px-4 md:px-6'
          }`}
        >
          <div className="flex justify-between items-center">

            {/* Apple-Style Glass Logo Section */}
            <Link
              to="/"
              className="flex items-center gap-3 group outline-none rounded-2xl"
            >
              <div className="relative flex items-center justify-center overflow-hidden rounded-2xl p-1 bg-white/50 border border-white/60 shadow-sm group-hover:scale-105 transition-transform duration-300 ease-out">
                <img
                  src="/logo.webp"
                  alt="Uploadio Logo"
                  className="w-9 h-9 md:w-10 md:h-10 object-contain drop-shadow-sm"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-lg md:text-xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 bg-clip-text text-transparent">
                  Uploadio
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 mt-0.5 hidden sm:block">
                  AI IMAGE TOOLS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation (Floating Glass Pill Container) */}
            <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-gray-900/[0.04] border border-white/40 shadow-inner backdrop-blur-md">
              {navItems.map((item) => {
                const active = isActivePath(item.path, item.exact)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={`
                      relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 group outline-none
                      ${active 
                        ? 'text-gray-900 bg-white/80 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-white/80' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                      }
                    `}
                  >
                    <span className={`transition-transform duration-300 ${active ? 'scale-110 text-blue-600' : 'group-hover:scale-110'}`}>
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
                    px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 group outline-none
                    ${activeDropdown === 'tools' ? 'text-gray-900 bg-white/80 shadow-sm border border-white/80' : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'}
                  `}
                  aria-expanded={activeDropdown === 'tools'}
                >
                  <Layers className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'tools' ? 'scale-110 text-blue-600' : 'group-hover:scale-110'}`} />
                  <span>Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'tools' ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {/* Hover Bridge */}
                <div className="absolute top-full left-0 w-full h-4" />

                {/* Glass Dropdown Menu */}
                <div
                  className={`
                    absolute top-[calc(100%+0.75rem)] right-0 w-[320px] bg-white/70 backdrop-blur-2xl backdrop-saturate-200 rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 p-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right
                    ${activeDropdown === 'tools' ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
                  `}
                >
                  <div className="grid gap-1">
                    {toolsDropdown.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-white/60 border border-transparent hover:border-white/50 transition-all duration-200 group outline-none"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 shadow-md ${tool.shadow} group-hover:scale-105 transition-transform duration-300`}>
                          {tool.icon}
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-xs font-bold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors">{tool.label}</p>
                          <p className="text-[10px] font-semibold text-gray-500 line-clamp-1">{tool.description}</p>
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
              className="lg:hidden relative w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 border border-white/60 shadow-sm flex items-center justify-center text-gray-700 transition-all duration-300 active:scale-95 outline-none"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <span className={`absolute transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}>
                  <Menu className="w-5 h-5" />
                </span>
                <span className={`absolute transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
                  <X className="w-5 h-5" />
                </span>
              </div>
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          <div
            className={`
              lg:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top
              ${isOpen ? 'max-h-[85vh] opacity-100 pt-4 pb-2' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="space-y-5 border-t border-gray-200/40 pt-4">

              {/* Primary Nav */}
              <div className="space-y-1">
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest px-3 mb-2">Main Menu</p>
                {navItems.map((item) => {
                  const active = isActivePath(item.path, item.exact);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200
                        ${active ? 'bg-white/80 text-blue-600 shadow-sm border border-white' : 'text-gray-600 hover:bg-white/40'}
                      `}
                    >
                      <span className={`transition-transform duration-200 ${active ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                      {active && <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />}
                    </NavLink>
                  )
                })}
              </div>

              <div className="w-full h-px bg-gray-200/40" />

              {/* Tools Nav */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest px-3 mb-2">AI Tools</p>
                <div className="grid gap-2">
                  {toolsDropdown.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3.5 px-3.5 py-3 rounded-2xl border border-white/40 bg-white/40 shadow-sm hover:bg-white/70 transition-all duration-200 active:scale-[0.98]"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                        {tool.icon}
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-xs font-bold text-gray-900">{tool.label}</p>
                        <p className="text-[10px] font-semibold text-gray-500">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent page content overlap */}
      <div className="h-20 md:h-24" />
    </>
  )
}

export default memo(Header)