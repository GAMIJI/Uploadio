import React, { useState } from 'react'
import { Mail, MessageSquare, Send, AlertCircle, Bug, MapPin } from 'lucide-react'
import SEO from './SEO'

const Contact = ({ isReportIssue = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => setIsSubmitting(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden font-sans pt-24 pb-12">
      <SEO title={isReportIssue ? "Report an Issue - Pixora AI" : "Contact Us - Pixora AI"} />
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none translate-y-1/2" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center p-2 bg-purple-50 rounded-2xl mb-3 border border-purple-100 shadow-sm">
            {isReportIssue ? <Bug className="w-6 h-6 text-purple-600" /> : <MessageSquare className="w-6 h-6 text-purple-600" />}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight">
            {isReportIssue ? 'Report an Issue' : 'Get in Touch'}
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            {isReportIssue ? "Found a bug? Let us know and our engineers will squash it." : "Have questions about our AI tools? We'd love to hear from you."}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 animate-in fade-in zoom-in-95 duration-500 delay-100">
          {/* Contact Form */}
          <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-purple-500/5 border border-white p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">First Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
                  <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" />
                </div>
              </div>

              {isReportIssue && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Issue Type</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all">
                    <option>Background Remover Bug</option>
                    <option>Passport Maker Bug</option>
                    <option>Billing Issue</option>
                    <option>Other</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Message</label>
                <textarea rows="4" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"></textarea>
              </div>

              <button disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <AlertCircle className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-purple-500/5 border border-white p-8 hover:-translate-y-1 transition-transform duration-300">
              <Mail className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Email Us</h3>
              <p className="text-sm text-gray-500 mb-3">Our friendly team is here to help.</p>
              <a href="mailto:hello@Uploadio.com" className="text-purple-600 font-bold hover:text-purple-700">hello@Uploadio.com</a>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-purple-500/5 border border-white p-8 hover:-translate-y-1 transition-transform duration-300">
              <MapPin className="w-8 h-8 text-pink-500 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Office</h3>
              <p className="text-sm text-gray-500 mb-3">Come say hello at our HQ.</p>
              <p className="text-gray-900 font-medium">100 Innovation Drive<br/>Tech City, TC 10010</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact