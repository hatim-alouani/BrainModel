import React from 'react'
import Link from 'next/link'
import { GiBrain } from 'react-icons/gi'

export default function Home() {
  return (
    <main 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed relative"
      style={{backgroundImage: `url('/brain.png')`}}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-cyan-900/80"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-6 text-center">
        {/* Logo Badge - Professional AI Brain Icon */}
        <div className="inline-block mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
            {/* Animated pulse background */}
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            
            {/* Rotating ring effect */}
            <div className="absolute inset-2 border-4 border-white/30 rounded-xl animate-spin" style={{animationDuration: '3s'}}></div>
            
            {/* Professional Brain Icon from react-icons */}
            <GiBrain className="w-20 h-20 text-white relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
          Brain Prediction <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Tumor Analysis
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-cyan-100 mb-4 max-w-3xl mx-auto leading-relaxed">
          Your path to predict early signs before the doctors
        </p>
        <p className="text-lg text-cyan-200 mb-12 font-light">
          For free and with just one click
        </p>

        {/* CTA Buttons with Animations */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/app" 
            className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative flex items-center justify-center gap-3">
              Start Analysis
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          
          <Link 
            href="/history" 
            className="group px-10 py-5 bg-white/10 backdrop-blur-md text-white text-lg font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-cyan-400 transition-all transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-3">
              View History
            </span>
          </Link>
          
          <Link 
            href="/statistics" 
            className="group px-10 py-5 bg-white/10 backdrop-blur-md text-white text-lg font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:border-cyan-400 transition-all transform hover:scale-105"
          >
            <span className="flex items-center justify-center gap-3">
              Statistics
            </span>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-cyan-400 transition-all transform hover:scale-105 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Instant Results</h3>
            <p className="text-cyan-200 text-sm">AI-powered predictions in seconds</p>
          </div>
          
          <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-cyan-400 transition-all transform hover:scale-105 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">High Accuracy</h3>
            <p className="text-cyan-200 text-sm">Trained on validated medical data</p>
          </div>
          
          <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-cyan-400 transition-all transform hover:scale-105 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Secure & Private</h3>
            <p className="text-cyan-200 text-sm">Your data stays confidential</p>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-cyan-300 text-sm">
          <p>Powered by Advanced Deep Learning • Research-Grade Accuracy</p>
        </div>
      </div>
    </main>
  )
}
