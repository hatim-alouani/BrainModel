'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GiBrain } from 'react-icons/gi'

export default function NavBar() {
  const pathname = usePathname()
  
  const isActive = (path: string): boolean => pathname === path

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b-2 border-cyan-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <GiBrain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 group-hover:text-cyan-600 transition">
                Brain Prediction Tumor
              </h1>
              <p className="text-xs text-slate-500">Advanced AI Diagnostic Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                isActive('/app')
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Predict
            </Link>
            <Link
              href="/history"
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                isActive('/history')
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              History
            </Link>
            <Link
              href="/statistics"
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                isActive('/statistics')
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Statistics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
