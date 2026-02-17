'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import NavBar from '../../components/NavBar'
import { HistoryItem, HistoryDetails } from '../../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selected, setSelected] = useState<HistoryItem | null>(null)
  const [details, setDetails] = useState<HistoryDetails | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async (): Promise<void> => {
    try {
      const r = await axios.get<HistoryItem[]>(`${API}/history`)
      setHistory(r.data)
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  const selectItem = async (item: HistoryItem): Promise<void> => {
    setSelected(item)
    setDetailsLoading(true)
    try {
      const r = await axios.get<HistoryDetails>(`${API}/history/${item.id}`)
      setDetails(r.data)
      setDetailsLoading(false)
    } catch (e) {
      console.error(e)
      setDetailsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.95)), url('/brain.png')`
      }}
    >
      <NavBar />

      <main className="w-full h-screen flex flex-col">
        {/* Header */}
        <div className="text-center py-8 px-6">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Prediction History
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Review past predictions and their detailed recommendations
          </p>
        </div>

        <div className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden">
          {/* History Sidebar - Left */}
          <div className="w-96 flex-shrink-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl h-full border-2 border-cyan-100 flex flex-col">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Recent Predictions</span>
                  <span className="ml-auto text-base bg-cyan-100 text-cyan-700 px-4 py-1 rounded-full">
                    {history.length}
                  </span>
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                    <p className="text-slate-600 mt-4 text-lg">Loading...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-20 h-20 mx-auto mb-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-slate-600 text-lg mb-4">No predictions yet</p>
                    <a href="/app" className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition">
                      Make a Prediction
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => selectItem(item)}
                        className={`w-full text-left p-5 rounded-xl transition-all border-2 ${
                          selected?.id === item.id
                            ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-400 shadow-lg scale-105'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-lg text-slate-800 capitalize truncate mb-1">
                              {item.predicted_label}
                            </div>
                            <div className="text-base text-slate-600 truncate mb-2">
                              {item.filename || 'Scan'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </div>
                          </div>
                          {selected?.id === item.id && (
                            <div className="text-cyan-600 text-xl">▶</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Panel - Takes remaining width */}
          <div className="flex-1 overflow-y-auto">
            {!selected ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl h-full flex flex-col items-center justify-center border-2 border-slate-200 p-12">
                <svg className="w-40 h-40 mb-10 text-slate-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <h3 className="text-4xl font-bold text-slate-800 mb-6">Select a Prediction</h3>
                <p className="text-2xl text-slate-600 text-center max-w-2xl">Choose an item from the history to view detailed results and recommendations</p>
              </div>
            ) : detailsLoading ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl h-full flex flex-col items-center justify-center border-2 border-cyan-100 p-12">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-cyan-600 mx-auto"></div>
                <p className="text-slate-600 mt-6 text-xl">Loading details...</p>
              </div>
            ) : details ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border-2 border-cyan-100 h-full flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-white flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-bold mb-3">Analysis Complete</h2>
                      <p className="text-cyan-100 text-lg">Results generated on {new Date(details.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Image */}
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-800 mb-6">Uploaded Scan</h3>
                      {details.image_base64 && (
                        <img
                          src={`data:image/png;base64,${details.image_base64}`}
                          alt="Scan"
                          className="w-full rounded-xl shadow-2xl border-2 border-slate-200"
                        />
                      )}
                    </div>

                    {/* Prediction */}
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-800 mb-6">Prediction Results</h3>
                      
                      {/* Main Prediction */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-cyan-300 rounded-xl p-8 mb-6">
                        <div className="text-base text-slate-600 font-medium mb-3">Detected Classification</div>
                        <div className="text-5xl font-bold text-slate-800 capitalize mb-3">
                          {details.predicted_label}
                        </div>
                        <div className="text-base text-slate-600">
                          Confidence: <span className="font-semibold text-lg">{(Math.max(...Object.values(details.probabilities)) * 100).toFixed(2)}%</span>
                        </div>
                      </div>

                      {/* Probability Distribution */}
                      <h4 className="font-semibold text-slate-700 mb-4 text-lg">Probability Distribution</h4>
                      <div className="space-y-4">
                        {Object.entries(details.probabilities)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([label, prob]) => (
                            <div key={label} className="bg-slate-50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-base font-medium text-slate-700 capitalize">{label}</span>
                                <span className="text-base font-bold text-slate-800">{((prob as number) * 100).toFixed(2)}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                                <div
                                  className={`h-4 rounded-full transition-all ${
                                    label === details.predicted_label
                                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                                      : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${(prob as number) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {details.recommendations && (
                    <div className="mt-10 border-t-2 border-slate-200 pt-10">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-8">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-bold text-slate-800 mb-3">
                              {details.recommendations.title}
                            </h3>
                            <div className="bg-white/70 rounded-lg p-6 mt-5">
                              <ul className="space-y-4">
                                {details.recommendations.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-4">
                                    <span className="text-cyan-600 font-bold text-xl mt-1">•</span>
                                    <span className="text-slate-700 leading-relaxed text-base">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-5 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg">
                              <p className="text-base text-red-800 font-medium">
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
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
