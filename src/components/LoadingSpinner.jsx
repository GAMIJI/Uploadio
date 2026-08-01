import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold">Processing...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait</p>
      </div>
    </div>
  )
}

export default LoadingSpinner