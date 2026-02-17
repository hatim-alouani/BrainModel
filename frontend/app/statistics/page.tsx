'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import NavBar from '../../components/NavBar'
import { Metrics } from '../../types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type TabType = 'overview' | 'performance' | 'confusion' | 'curves' | 'distribution' | 'detailed'

export default function StatisticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async (): Promise<void> => {
    try {
      const r = await axios.get<Metrics>(`${API}/metrics`)
      setMetrics(r.data)
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.95)), url('/brain.png')`
        }}
      >
        <NavBar />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.95)), url('/brain.png')`
        }}
      >
        <NavBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-red-200 max-w-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ No Statistics Available</h2>
            <p className="text-slate-600 mb-4">Please generate artifacts first by running:</p>
            <code className="bg-slate-100 p-2 rounded block mb-4">python generate_artifacts.py</code>
            <a href="/app" className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">
              Go to Predict
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.95)), url('/brain.png')`
      }}
    >
      <NavBar />

      {/* Header */}
      <div className="max-w-[1800px] mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Model Statistics & Performance
          </h1>
          <p className="text-lg text-slate-600">
            Comprehensive analysis of brain tumor classification model
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-sm border-b-2 border-cyan-200 sticky top-20 z-40 shadow-lg">
        <div className="container mx-auto px-6 max-w-[1800px]">
          <div className="flex space-x-6 overflow-x-auto">
            {([
              { id: 'overview' as TabType, label: 'Overview' },
              { id: 'performance' as TabType, label: 'Performance' },
              { id: 'confusion' as TabType, label: 'Confusion Matrix' },
              { id: 'curves' as TabType, label: 'ROC & PR Curves' },
              { id: 'distribution' as TabType, label: 'Distribution' },
              { id: 'detailed' as TabType, label: 'Detailed Metrics' }
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-[1800px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Overall Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                <div className="text-sm text-slate-600 font-medium">Accuracy</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {(metrics.test_accuracy * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Test Set</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
                <div className="text-sm text-slate-600 font-medium">Loss</div>
                <div className="text-3xl font-bold text-red-600 mt-2">
                  {metrics.test_loss?.toFixed(4)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Focal Loss</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                <div className="text-sm text-slate-600 font-medium">F1 Score</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {(metrics.f1_weighted * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Weighted</div>
              </div>
              {metrics.macro_f1 && (
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
                  <div className="text-sm text-slate-600 font-medium">F1 (Macro)</div>
                  <div className="text-3xl font-bold text-purple-600 mt-2">
                    {(metrics.macro_f1 * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Average</div>
                </div>
              )}
              {metrics.total_samples && (
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-amber-500">
                  <div className="text-sm text-slate-600 font-medium">Test Samples</div>
                  <div className="text-3xl font-bold text-amber-600 mt-2">
                    {metrics.total_samples}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{metrics.n_classes} Classes</div>
                </div>
              )}
            </div>

            {/* Performance Summary Dashboard */}
            {metrics.performance_summary_base64 && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <span className="text-3xl mr-3"></span>
                  Complete Performance Summary
                </h2>
                <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${metrics.performance_summary_base64}`}
                    alt="Performance Summary"
                    className="w-full h-auto"
                    style={{maxWidth: '100%'}}
                  />
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  Comprehensive dashboard showing overall metrics, confusion matrix, and per-class performance comparison.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-8">
            {metrics.per_class_performance_base64 && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6"> Per-Class Performance Metrics</h2>
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${metrics.per_class_performance_base64}`}
                    alt="Per-Class Performance"
                    className="w-full max-w-5xl h-auto"
                  />
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  Comparison of Precision, Recall, and F1-Score across all tumor classes.
                </p>
              </div>
            )}

            {/* Metrics Table */}
            {metrics.per_class_precision && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-4"> Detailed Metrics Table</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Class</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Precision</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Recall</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">F1-Score</th>
                        {metrics.class_distribution && (
                          <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Samples</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(metrics.per_class_precision).map(([className, precision]) => (
                        <tr key={className} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-medium text-slate-800 capitalize">{className}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {(precision * 100).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {((metrics.per_class_recall?.[className] || 0) * 100).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {((metrics.per_class_f1?.[className] || 0) * 100).toFixed(2)}%
                            </span>
                          </td>
                          {metrics.class_distribution && (
                            <td className="px-6 py-4 text-center text-slate-700 font-medium">
                              {metrics.class_distribution[className] || 0}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confusion Matrix Tab */}
        {activeTab === 'confusion' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {metrics.confusion_matrix_base64 && (
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">🔢 Confusion Matrix (Counts)</h2>
                  <div className="flex justify-center">
                    <img
                      src={`data:image/png;base64,${metrics.confusion_matrix_base64}`}
                      alt="Confusion Matrix"
                      className="w-full max-w-2xl h-auto"
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-4">
                    Shows the actual number of predictions for each true class.
                  </p>
                </div>
              )}
              {metrics.confusion_matrix_normalized_base64 && (
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold text-slate-800 mb-6"> Confusion Matrix (Normalized)</h2>
                  <div className="flex justify-center">
                    <img
                      src={`data:image/png;base64,${metrics.confusion_matrix_normalized_base64}`}
                      alt="Normalized Confusion Matrix"
                      className="w-full max-w-2xl h-auto"
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-4">
                    Shows the percentage distribution, useful for comparing per-class accuracy.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Curves Tab */}
        {activeTab === 'curves' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {metrics.roc_curves_base64 && (
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold text-slate-800 mb-6"> ROC Curves (One-vs-Rest)</h2>
                  <div className="flex justify-center">
                    <img
                      src={`data:image/png;base64,${metrics.roc_curves_base64}`}
                      alt="ROC Curves"
                      className="w-full max-w-3xl h-auto"
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-4">
                    Receiver Operating Characteristic curves showing the tradeoff between True Positive Rate and False Positive Rate.
                    Higher AUC (Area Under Curve) indicates better performance.
                  </p>
                </div>
              )}
              {metrics.precision_recall_curves_base64 && (
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold text-slate-800 mb-6"> Precision-Recall Curves</h2>
                  <div className="flex justify-center">
                    <img
                      src={`data:image/png;base64,${metrics.precision_recall_curves_base64}`}
                      alt="Precision-Recall Curves"
                      className="w-full max-w-3xl h-auto"
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-4">
                    Shows the tradeoff between precision and recall for different threshold values.
                    Particularly useful for imbalanced datasets.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Distribution Tab */}
        {activeTab === 'distribution' && (
          <div className="space-y-8">
            {metrics.class_distribution_base64 && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-6"> Test Set Class Distribution</h2>
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${metrics.class_distribution_base64}`}
                    alt="Class Distribution"
                    className="w-full max-w-5xl h-auto"
                  />
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  Distribution of samples across different tumor classes in the test dataset.
                  Shows both absolute counts (bar chart) and relative percentages (pie chart).
                </p>
              </div>
            )}

            {metrics.class_distribution && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-4"> Sample Count by Class</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(metrics.class_distribution).map(([className, count]) => (
                    <div key={className} className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-lg border-2 border-cyan-200">
                      <div className="text-sm text-slate-600 font-medium uppercase">{className}</div>
                      <div className="text-4xl font-bold text-cyan-700 mt-2">{count}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {((count / (metrics.total_samples || 1)) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Tab */}
        {activeTab === 'detailed' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">🔍 Complete Metrics Report</h2>
              
              <div className="space-y-6">
                {/* Overall Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Overall Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded">
                      <div className="text-xs text-slate-600">Test Accuracy</div>
                      <div className="text-2xl font-bold text-slate-800">{(metrics.test_accuracy * 100).toFixed(2)}%</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded">
                      <div className="text-xs text-slate-600">Test Loss</div>
                      <div className="text-2xl font-bold text-slate-800">{metrics.test_loss?.toFixed(4)}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded">
                      <div className="text-xs text-slate-600">Weighted F1</div>
                      <div className="text-2xl font-bold text-slate-800">{(metrics.f1_weighted * 100).toFixed(2)}%</div>
                    </div>
                    {metrics.macro_f1 && (
                      <div className="bg-slate-50 p-4 rounded">
                        <div className="text-xs text-slate-600">Macro F1</div>
                        <div className="text-2xl font-bold text-slate-800">{(metrics.macro_f1 * 100).toFixed(2)}%</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ROC-AUC Scores */}
                {metrics.roc_auc && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">ROC-AUC Scores (One-vs-Rest)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(metrics.roc_auc).map(([className, score]) => (
                        score !== null && (
                          <div key={className} className="bg-blue-50 p-4 rounded">
                            <div className="text-xs text-slate-600 capitalize">{className}</div>
                            <div className="text-2xl font-bold text-blue-700">{score.toFixed(4)}</div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Classification Report JSON */}
                {metrics.classification_report && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-3 border-b pb-2">Full Classification Report</h3>
                    <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                      <pre>{JSON.stringify(metrics.classification_report, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center text-slate-600 text-sm">
            <p>Brain Tumor Classification Model • Statistics Dashboard</p>
            <p className="mt-1">Generated with TensorFlow & Scikit-learn</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
