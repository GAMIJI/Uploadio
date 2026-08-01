import React from 'react'
import { ShieldCheck, FileText } from 'lucide-react'
import SEO from './SEO'

const LegalPage = ({ title = "Privacy Policy", isTerms = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden font-sans pt-24 pb-12">
      <SEO title={`${title} - Pixora AI`} />
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-2xl mb-3 border border-blue-100 shadow-sm">
            {isTerms ? <FileText className="w-6 h-6 text-blue-600" /> : <ShieldCheck className="w-6 h-6 text-blue-600" />}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
            {title}
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Last updated: October 2023
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 delay-100 prose prose-blue max-w-none text-gray-600">
          <h3 className="text-gray-900 font-bold text-xl mb-4">1. Introduction</h3>
          <p className="mb-6 leading-relaxed">
            Welcome to Pixora AI. We respect your privacy and are committed to protecting your personal data. This policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
          </p>
          
          <h3 className="text-gray-900 font-bold text-xl mb-4">2. The Data We Collect</h3>
          <p className="mb-6 leading-relaxed">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username.</li>
              <li><strong>Contact Data:</strong> includes email address.</li>
              <li><strong>Technical Data:</strong> includes IP address, browser type and version.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website.</li>
            </ul>
          </p>

          <h3 className="text-gray-900 font-bold text-xl mb-4">3. Data Security</h3>
          <p className="mb-6 leading-relaxed">
            All images processed by our AI tools are done securely. Images uploaded for background removal or editing are processed in memory and immediately discarded. We do not store or use your photos to train our AI models without explicit opt-in consent.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LegalPage