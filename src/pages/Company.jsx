import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Rocket, ArrowRight } from 'lucide-react';
import SEO from './SEO';
// IMPORTANT: Import the centralized data we created in the previous step
import { blogPostsData } from '../data/blogData';

// Replaced JSX elements with Component references to optimize memory
const companyInfo = [
  { title: "Our Mission", icon: Target, iconColor: "text-blue-500", desc: "Democratizing pro-level photo editing." },
  { title: "Our Vision", icon: Rocket, iconColor: "text-purple-500", desc: "A world where AI augments human creativity." },
  { title: "Our Team", icon: Users, iconColor: "text-pink-500", desc: "Built by designers, for designers." }
];

const Company = ({ isBlog = false }) => {
  // Use the imported blogPostsData if this is the Blog page
  const dataToRender = isBlog ? blogPostsData : companyInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden font-sans pt-24 pb-12">
      <SEO title={isBlog ? "Blog - Uploadio" : "About Us - Uploadio"} />
      
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight">
            {isBlog ? "Latest Updates & News" : "Building the Future of Photo Editing"}
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">
            {isBlog ? "Read our latest guides, visa requirements, and ID photography insights." : "We're a team of engineers and designers passionate about making professional photo editing tools accessible to everyone through AI."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {dataToRender.map((item, idx) => {
            // Render Blog Post Card (Wrapped in a Link for navigation)
            if (isBlog) {
              return (
                <Link 
                  key={`blog-${idx}`} 
                  to={`/blog/${item.slug}`}
                  className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300 group cursor-pointer block outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div 
                    className="w-full h-48 rounded-2xl mb-6 bg-cover bg-center opacity-90 group-hover:opacity-100 transition-opacity bg-gray-100" 
                    style={{ backgroundImage: `url(${item.imgUrl})` }}
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">{item.tag}</span>
                    <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">{item.title}</h3>
                  <div className="flex items-center text-sm font-bold text-blue-600 mt-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                    Read Article <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            }

            // Render Company Info Block (Not clickable)
            const IconComponent = item.icon;
            return (
              <div key={`company-${idx}`} className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300 group">
                <div className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`w-8 h-8 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(Company);