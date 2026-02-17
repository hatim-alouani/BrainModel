'use client'

import React from 'react'
import { Metrics } from '../types'

interface MetricsDashboardProps {
  metrics: Metrics | null
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  if(!metrics) return <div className="bg-white p-4 rounded shadow">Loading metrics...</div>
  
  return (
    <div className="space-y-6">
      {/* Overall Metrics Cards */}
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold text-lg mb-4">Model Metrics Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-sm text-slate-600">Accuracy</div>
            <div className="text-2xl font-bold text-blue-600">{(metrics.test_accuracy * 100).toFixed(2)}%</div>
          </div>
          <div className="p-3 bg-red-50 rounded">
            <div className="text-sm text-slate-600">Loss</div>
            <div className="text-2xl font-bold text-red-600">{metrics.test_loss?.toFixed(4)}</div>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <div className="text-sm text-slate-600">F1 (weighted)</div>
            <div className="text-2xl font-bold text-green-600">{(metrics.f1_weighted * 100).toFixed(2)}%</div>
          </div>
          {metrics.macro_f1 && (
            <div className="p-3 bg-purple-50 rounded">
              <div className="text-sm text-slate-600">F1 (macro)</div>
              <div className="text-2xl font-bold text-purple-600">{(metrics.macro_f1 * 100).toFixed(2)}%</div>
            </div>
          )}
          {metrics.total_samples && (
            <div className="p-3 bg-amber-50 rounded">
              <div className="text-sm text-slate-600">Test Samples</div>
              <div className="text-2xl font-bold text-amber-600">{metrics.total_samples}</div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary Dashboard */}
      {metrics.performance_summary_base64 && (
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold text-lg mb-3">📊 Complete Performance Summary</h4>
          <img src={`data:image/png;base64,${metrics.performance_summary_base64}`} alt="Performance Summary" className="w-full" />
        </div>
      )}

      {/* Confusion Matrices Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.confusion_matrix_base64 && (
          <div className="bg-white p-4 rounded shadow">
            <h5 className="font-semibold mb-3">Confusion Matrix (Counts)</h5>
            <img src={`data:image/png;base64,${metrics.confusion_matrix_base64}`} alt="Confusion Matrix" className="w-full" />
          </div>
        )}
        {metrics.confusion_matrix_normalized_base64 && (
          <div className="bg-white p-4 rounded shadow">
            <h5 className="font-semibold mb-3">Confusion Matrix (Normalized %)</h5>
            <img src={`data:image/png;base64,${metrics.confusion_matrix_normalized_base64}`} alt="Normalized CM" className="w-full" />
          </div>
        )}
      </div>

      {/* ROC and PR Curves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.roc_curves_base64 && (
          <div className="bg-white p-4 rounded shadow">
            <h5 className="font-semibold mb-3">ROC Curves (One-vs-Rest)</h5>
            <img src={`data:image/png;base64,${metrics.roc_curves_base64}`} alt="ROC Curves" className="w-full" />
          </div>
        )}
        {metrics.precision_recall_curves_base64 && (
          <div className="bg-white p-4 rounded shadow">
            <h5 className="font-semibold mb-3">Precision-Recall Curves</h5>
            <img src={`data:image/png;base64,${metrics.precision_recall_curves_base64}`} alt="PR Curves" className="w-full" />
          </div>
        )}
      </div>

      {/* Per-Class Performance and Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.per_class_performance_base64 && (
          <div className="bg-white p-4 rounded shadow">
            <h5 className="font-semibold mb-3">Per-Class Performance</h5>
            <img src={`data:image/png;base64,${metrics.per_class_performance_base64}`} alt="Per-Class Performance" className="w-full" />
          </div>
        )}
        {metrics.class_distribution_base64 && (
          <div className="bg-white p-4 rounded shadow">
            <h5 className="font-semibold mb-3">Class Distribution</h5>
            <img src={`data:image/png;base64,${metrics.class_distribution_base64}`} alt="Class Distribution" className="w-full" />
          </div>
        )}
      </div>

      {/* Per-Class Metrics Table */}
      {metrics.per_class_precision && (
        <div className="bg-white p-4 rounded shadow">
          <h5 className="font-semibold mb-3">Detailed Per-Class Metrics</h5>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-center">Precision</th>
                  <th className="px-4 py-2 text-center">Recall</th>
                  <th className="px-4 py-2 text-center">F1-Score</th>
                  {metrics.class_distribution && <th className="px-4 py-2 text-center">Samples</th>}
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.per_class_precision).map(([className, precision]) => (
                  <tr key={className} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{className}</td>
                    <td className="px-4 py-2 text-center">{((precision as number) * 100).toFixed(2)}%</td>
                    <td className="px-4 py-2 text-center">{((metrics.per_class_recall?.[className] || 0) * 100).toFixed(2)}%</td>
                    <td className="px-4 py-2 text-center">{((metrics.per_class_f1?.[className] || 0) * 100).toFixed(2)}%</td>
                    {metrics.class_distribution && (
                      <td className="px-4 py-2 text-center">{metrics.class_distribution[className] || 0}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
