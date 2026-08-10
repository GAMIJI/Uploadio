import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './layouts/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import Resources from './pages/Resources'
import LegalPage from './pages/LegalPage'

// THE FIX: Eagerly import Home to completely eliminate the Footer Layout Shift (CLS)
// The landing page should paint synchronously in the first frame.
import Home from './pages/Home'
import PhotoEditor from './pages/PhotoEditor'

// Lazy load all secondary pages for maximum code splitting and bundle optimization
const PassportPhotoMaker = lazy(() => import('./pages/PassportPhotoMaker'))
const BackgroundRemover = lazy(() => import('./pages/BackgroundRemover'))
const ImageResizer = lazy(() => import('./pages/ImageResizer'))
const ImageCompressor = lazy(() => import('./pages/ImageCompressor'))
const ImageConverter = lazy(() => import('./pages/ImageConverter'))
const Contact = lazy(() => import('./pages/Contact'))
const Company = lazy(() => import('./pages/Company'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#2563EB',
              secondary: '#fff',
            },
          },
        }}
      />
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Synchronously loaded to guarantee 0.00 CLS */}
            <Route path="/" element={<Home />} />
            
            <Route path="/passport-photo-maker" element={<PassportPhotoMaker />} />
            <Route path="/background-remover" element={<BackgroundRemover />} />
            <Route path="/image-resizer" element={<ImageResizer />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/image-converter" element={<ImageConverter />} />
            <Route path="/photo-editor" element={<PhotoEditor />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            <Route path="/about" element={<Company />} />
            <Route path="/blog" element={<Company isBlog={true} />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            <Route path="/privacy-policy" element={<LegalPage title="Privacy Policy" />} />
            <Route path="/terms" element={<LegalPage title="Terms of Service" isTerms={true} />} />
            <Route path="/report" element={<Contact isReportIssue={true} />} />
            <Route path="/help" element={<Resources />} />
            <Route path="/faqs" element={<Resources />} />
            <Route path="/api-docs" element={<Resources isApi={true} />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  )
}

export default App