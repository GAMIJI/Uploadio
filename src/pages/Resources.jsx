import React from 'react'
import { Search, BookOpen, Code, HelpCircle, ChevronRight } from 'lucide-react'
import SEO from './SEO'

const Resources = ({ isApi = false }) => {
  const topics = isApi ? [
    { title: "Authentication", count: "3 endpoints" },
    { title: "Background Removal API", count: "POST /v1/remove-bg" },
    { title: "Image Resizer API", count: "POST /v1/resize" }
  ] : [
    { title: "Getting Started", icon: <BookOpen className="w-6 h-6 text-emerald-500"/> },
    { title: "Billing & Subscriptions", icon: <HelpCircle className="w-6 h-6 text-teal-500"/> },
    { title: "Developer API", icon: <Code className="w-6 h-6 text-cyan-500"/> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden font-sans pt-24 pb-12">
      <SEO title={isApi ? "API Documentation - Pixora AI" : "Help Center & FAQs - Pixora AI"} />
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600 tracking-tight">
            {isApi ? "Developer Documentation" : "How can we help you?"}
          </h1>
          
          <div className="relative max-w-2xl mx-auto mt-8 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder={isApi ? "Search endpoints, parameters..." : "Search for guides, FAQs, or troubleshooting..."} 
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-white rounded-[1.5rem] shadow-xl shadow-emerald-500/5 focus:ring-0 focus:border-emerald-400 outline-none text-gray-700 font-medium transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500 delay-100">
          {topics.map((topic, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white p-6 hover:-translate-y-1 hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group">
              {isApi ? (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{topic.title}</h3>
                  <p className="text-xs font-mono text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md">{topic.count}</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{topic.title}</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              )}
            </div>
          ))}
        </div>

        {!isApi && (
          <div className="mt-16 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white p-8 md:p-12 animate-in fade-in duration-700 delay-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {['Is it really free?', 'Do you store my photos?', 'Is there an API available?'].map((q, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center">
                  <span className="font-bold text-gray-700">{q}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Resources