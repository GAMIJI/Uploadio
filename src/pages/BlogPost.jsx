import React, { memo, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import SEO from './SEO';
import { blogPostsData } from '../data/blogData';

const BlogPost = () => {
  const { slug } = useParams();

  // useMemo prevents re-searching the array on unrelated re-renders
  const post = useMemo(() => {
    return blogPostsData.find((p) => p.slug === slug);
  }, [slug]);

  // Handle 404 - Post not found
  if (!post) {
    return <Navigate to="/company" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative font-sans pt-24 pb-20">
      <SEO 
        title={`${post.title} - Uploadio Blog`} 
        description={post.content[0].text.substring(0, 150) + "..."} 
      />
      
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      
      <main className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* Back Button */}
        <Link 
          to="/company" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        <article className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Hero Image */}
          <div 
            className="w-full h-[30vh] md:h-[45vh] bg-gray-100 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.imgUrl})` }}
            role="img"
            aria-label={post.title}
          />

          <div className="p-6 md:p-12 lg:p-16">
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-semibold text-gray-500 mb-6">
              <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                <Tag className="w-4 h-4" />
                {post.tag}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-10 leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Content Renderer */}
            <div className="space-y-6 md:space-y-8 text-gray-700 leading-relaxed md:text-lg">
              {post.content.map((block, index) => {
                if (block.type === 'h2') {
                  return (
                    <h2 key={index} className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-4 tracking-tight">
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === 'p') {
                  return (
                    <p key={index} className="font-medium text-gray-600">
                      {block.text}
                    </p>
                  );
                }
                return null;
              })}
            </div>

            {/* Call to Action at the bottom of the post */}
            <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100/50 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to create your perfect photo?</h3>
              <p className="text-gray-600 mb-6 font-medium">Use Uploadio's AI to format your ID photo perfectly in seconds.</p>
              <Link 
                to="/passport-photo-maker" 
                className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] hover:shadow-blue-500/40 transition-all duration-200"
              >
                Open Studio
              </Link>
            </div>

          </div>
        </article>
      </main>
    </div>
  );
};

export default memo(BlogPost);