import React, { memo, useState, useEffect, useCallback, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { 
  Menu, X, ChevronDown, Sparkles, Home, Image as ImageIcon, 
  Crop, RefreshCw, Layers, Zap, CheckCircle, 
  ShieldCheck, Globe2, Award, ArrowRight, Star,
  Mail, Phone, MapPin, Clock
} from 'lucide-react'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const dropdownTimeoutRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const menuButtonRef = useRef(null)

  // Detect mobile for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // High-performance scroll detection with RAF
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
    // Focus management
    if (menuButtonRef.current) {
      menuButtonRef.current.focus()
    }
  }, [location])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setActiveDropdown(null)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Trap focus in mobile menu
  useEffect(() => {
    if (isOpen && mobileMenuRef.current) {
      const focusable = mobileMenuRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    }
  }, [isOpen])

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
      gradient: 'from-blue-500/90 to-indigo-600/90',
      shadow: 'shadow-blue-500/30',
      badge: 'Popular'
    },
    {
      path: '/image-compressor',
      label: 'Image Compressor',
      icon: <Zap className="w-4 h-4 text-white" />,
      description: 'Reduce file size instantly',
      gradient: 'from-emerald-400/90 to-teal-500/90',
      shadow: 'shadow-emerald-500/30',
      badge: 'Fast'
    },
    {
      path: '/image-converter',
      label: 'Image Converter',
      icon: <RefreshCw className="w-4 h-4 text-white" />,
      description: 'Switch between PNG, JPG, WEBP',
      gradient: 'from-orange-400/90 to-rose-500/90',
      shadow: 'shadow-orange-500/30',
      badge: 'New'
    },
    {
      path: '/photo-editor',
      label: 'Photo Editor',
      icon: <Layers className="w-4 h-4 text-white" />,
      description: 'Advanced editing tools',
      gradient: 'from-purple-500/90 to-pink-500/90',
      shadow: 'shadow-purple-500/30',
      badge: 'Pro'
    },
  ]

  // Social links for mobile
  // const socialLinks = [
  //   { icon: Twitter, label: 'Twitter', href: '#' },
  //   { icon: Instagram, label: 'Instagram', href: '#' },
  //   { icon: Youtube, label: 'YouTube', href: '#' },
  //   { icon: Linkedin, label: 'LinkedIn', href: '#' },
  // ]

  const isActivePath = useCallback((path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }, [location.pathname])

  const handleDropdownEnter = useCallback(() => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setActiveDropdown('tools')
  }, [])

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 100)
  }, [])

  const handleLinkClick = useCallback(() => {
    setIsOpen(false)
    setActiveDropdown(null)
  }, [])

  return (
    <>
      {/* Floating Island Header Container */}
      <header 
        className="fixed top-0 inset-x-0 z-50 pt-3 md:pt-4 px-3 sm:px-6 lg:px-8 transition-all duration-500 pointer-events-none"
        role="banner"
      >
        <div 
          className={`max-w-6xl mx-auto rounded-[1.75rem] pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled 
              ? 'bg-white/70 backdrop-blur-2xl backdrop-saturate-200 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] py-2.5 px-4 md:px-6' 
              : 'bg-white/50 backdrop-blur-xl backdrop-saturate-150 border border-white/60 shadow-[0_4px_24px_0_rgba(0,0,0,0.03)] py-3 px-4 md:px-6'
          }`}
        >
          <div className="flex justify-between items-center">

            {/* Logo Section */}
            <Link
              to="/"
              className="flex items-center gap-3 group outline-none rounded-2xl focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Uploadio home"
            >
              <div className="relative flex items-center justify-center overflow-hidden rounded-2xl p-1.5 bg-white/60 border border-white/70 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 ease-out">
                <img
                  src="/logo.webp"
                  alt="Uploadio Logo"
                  className="w-9 h-9 md:w-10 md:h-10 object-contain drop-shadow-sm"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-lg md:text-xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-gray-900 via-gray-800 to-purple-900 bg-clip-text text-transparent">
                  Uploadio
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 mt-0.5 hidden sm:block">
                  AI IMAGE STUDIO
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav 
              className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-gray-900/[0.04] border border-white/40 shadow-inner backdrop-blur-md"
              role="navigation"
              aria-label="Main navigation"
            >
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
                      focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                    `}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className={`transition-transform duration-300 ${active ? 'scale-110 text-purple-600' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {active && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    )}
                  </NavLink>
                )
              })}

              {/* Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
                onFocus={() => setActiveDropdown('tools')}
                onBlur={() => setTimeout(() => setActiveDropdown(null), 100)}
              >
                <button
                  className={`
                    px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 group outline-none
                    ${activeDropdown === 'tools' ? 'text-gray-900 bg-white/80 shadow-sm border border-white/80' : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'}
                    focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                  `}
                  aria-expanded={activeDropdown === 'tools'}
                  aria-haspopup="true"
                  aria-controls="tools-dropdown"
                >
                  <Layers className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'tools' ? 'scale-110 text-purple-600' : 'group-hover:scale-110'}`} />
                  <span>Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === 'tools' ? 'rotate-180 text-purple-600' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <div
                  id="tools-dropdown"
                  className={`
                    absolute top-[calc(100%+0.75rem)] right-0 w-[360px] bg-white/80 backdrop-blur-2xl backdrop-saturate-200 rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/60 p-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right
                    ${activeDropdown === 'tools' ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
                  `}
                  role="menu"
                >
                  <div className="grid gap-1">
                    {toolsDropdown.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={handleLinkClick}
                        className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-white/60 border border-transparent hover:border-white/50 transition-all duration-200 group outline-none focus:ring-2 focus:ring-purple-500"
                        role="menuitem"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 shadow-md ${tool.shadow} group-hover:scale-110 transition-transform duration-300`}>
                          {tool.icon}
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                              {tool.label}
                            </p>
                            {tool.badge && (
                              <span className="text-[8px] font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-semibold text-gray-500 line-clamp-1">{tool.description}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Desktop CTA */}
            {/* <div className="hidden lg:flex items-center gap-3">
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Upload photo"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div> */}

            {/* Mobile Menu Toggle */}
            <button
              ref={menuButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 border border-white/60 shadow-sm flex items-center justify-center text-gray-700 transition-all duration-300 active:scale-95 outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
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

          {/* Mobile Menu */}
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className={`
              lg:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top
              ${isOpen ? 'max-h-[85vh] opacity-100 pt-4 pb-2' : 'max-h-0 opacity-0'}
            `}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="space-y-6 border-t border-gray-200/40 pt-4">

              {/* Primary Nav */}
              <div className="space-y-1">
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest px-3 mb-2">
                  Main Menu
                </p>
                {navItems.map((item) => {
                  const active = isActivePath(item.path, item.exact);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={handleLinkClick}
                      className={`
                        flex items-center gap-3 px-3.5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200
                        ${active 
                          ? 'bg-white/80 text-purple-600 shadow-sm border border-white' 
                          : 'text-gray-600 hover:bg-white/40'}
                        focus:ring-2 focus:ring-purple-500
                      `}
                      role="menuitem"
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={`transition-transform duration-200 ${active ? 'text-purple-600 scale-110' : 'text-gray-400'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                      {active && <CheckCircle className="w-4 h-4 ml-auto text-purple-600" />}
                    </NavLink>
                  )
                })}
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent" />

              {/* Tools Nav */}
              <div className="space-y-2">
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest px-3 mb-2">
                  AI Tools
                </p>
                <div className="grid gap-2">
                  {toolsDropdown.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3.5 px-3.5 py-3 rounded-2xl border border-white/40 bg-white/40 shadow-sm hover:bg-white/70 transition-all duration-200 active:scale-[0.98] focus:ring-2 focus:ring-purple-500"
                      role="menuitem"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                        {tool.icon}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-900">{tool.label}</p>
                          {tool.badge && (
                            <span className="text-[8px] font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-semibold text-gray-500">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200/40 to-transparent" />

              {/* Mobile CTA */}
              {/* <div className="space-y-3 px-3">
                <button
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center gap-2 focus:ring-2 focus:ring-purple-500"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo Free
                </button>


                <div className="flex justify-center gap-2 pt-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 hover:text-purple-600 flex items-center justify-center text-gray-500 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                      aria-label={social.label}
                    >
                      <social.icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>

              </div> */}
              
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-20 md:h-24" />
    </>
  )
}

export default memo(Header)