'use client'

import React, { useState } from 'react'
import axios from 'axios'
import NavBar from '../../components/NavBar'
import { PredictionResult } from '../../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function PredictPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (selectedFile: File): void => {
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setResult(null)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const predict = async (): Promise<void> => {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      // Add 5-second delay with loading animation
      const [response] = await Promise.all([
        axios.post<PredictionResult>(`${API}/predict`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
        new Promise(resolve => setTimeout(resolve, 5000))
      ])
      setResult(response.data)
    } catch (e) {
      console.error(e)
      const errMsg = axios.isAxiosError(e) 
        ? (e.response?.data?.detail || 'Prediction failed. Please try again.')
        : 'Prediction failed. Please try again.'
      alert(errMsg)
    }
    setLoading(false)
  }

  const reset = (): void => {
    setFile(null)
    setPreview(null)
    setResult(null)
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.95)), url('/brain.png')`
      }}
    >
      <NavBar />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-12 max-w-md mx-4 text-center border-2 border-cyan-400">
            {/* Animated Brain Icon */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/30 rounded-full"></div>
              </div>
              {/* Rotating ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
            
            {/* Loading Text */}
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              Analyzing MRI Scan
            </h3>
            <p className="text-slate-600 mb-4">
              AI is processing your brain scan...
            </p>
            
            {/* Progress Dots */}
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            
            {/* Loading Bar */}
            <div className="mt-6 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            AI-Powered Brain Tumor Analysis
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload an MRI scan to receive instant, AI-powered tumor classification with detailed medical recommendations
          </p>
        </div>

        {!result ? (
          /* Upload Section */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-cyan-100">
              {/* Upload Area */}
              <div
                className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-slate-300 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!preview ? (
                  <div>
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-800 mb-3">
                      Upload MRI Scan
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Drag and drop your MRI image here, or click to browse
                    </p>
                    <label className="inline-block">
                      <span className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg cursor-pointer hover:shadow-lg transition-all inline-block">
                        Choose File
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-slate-500 mt-4">
                      Supported formats: JPG, PNG, DICOM
                    </p>
                  </div>
                ) : (
                  <div>
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-80 mx-auto rounded-lg shadow-lg mb-6"
                    />
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={predict}
                        disabled={loading}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Analyzing...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Analyze Scan
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </span>
                        )}
                      </button>
                      <button
                        onClick={reset}
                        className="px-8 py-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg mb-2 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">Instant Results</h4>
                  <p className="text-sm text-slate-600">Get predictions in seconds using advanced AI</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg mb-2 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">High Accuracy</h4>
                  <p className="text-sm text-slate-600">Trained on thousands of validated scans</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg mb-2 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">Detailed Reports</h4>
                  <p className="text-sm text-slate-600">Comprehensive recommendations included</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border-2 border-cyan-100">
              {/* Results Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Analysis Complete</h2>
                    <p className="text-cyan-100">Results generated on {new Date(result.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={reset}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all"
                  >
                    New Scan
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Uploaded Scan</h3>
                    <img
                      src={preview || undefined}
                      alt="Scan"
                      className="w-full rounded-lg shadow-lg border-2 border-slate-200"
                    />
                  </div>

                  {/* Prediction */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Prediction Results</h3>
                    
                    {/* Main Prediction */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-cyan-300 rounded-xl p-6 mb-6">
                      <div className="text-sm text-slate-600 font-medium mb-2">Detected Classification</div>
                      <div className="text-4xl font-bold text-slate-800 capitalize mb-2">
                        {result.predicted_label}
                      </div>
                      <div className="text-sm text-slate-600">
                        Confidence: <span className="font-semibold">{(Math.max(...Object.values(result.probabilities)) * 100).toFixed(2)}%</span>
                      </div>
                    </div>

                    {/* Probability Distribution */}
                    <h4 className="font-semibold text-slate-700 mb-3">Probability Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(result.probabilities)
                        .sort(([, a], [, b]) => b - a)
                        .map(([label, prob]) => (
                          <div key={label} className="bg-slate-50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-700 capitalize">{label}</span>
                              <span className="text-sm font-bold text-slate-800">{(prob * 100).toFixed(2)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all ${
                                  label === result.predicted_label
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                                    : 'bg-slate-400'
                                }`}
                                style={{ width: `${prob * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {result.recommendations && (
                  <div className="mt-8 border-t-2 border-slate-200 pt-8">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-800 mb-2">
                            {result.recommendations.title}
                          </h3>
                          <div className="bg-white/70 rounded-lg p-5 mt-4">
                            <ul className="space-y-3">
                              {result.recommendations.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="text-cyan-600 font-bold text-lg mt-0.5">•</span>
                                  <span className="text-slate-700 leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-sm text-red-800 font-medium">
                              ⚠️ <strong>Disclaimer:</strong> This is an AI-based prediction and not a medical diagnosis. 
                              Please consult with a qualified healthcare professional for proper medical advice.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
