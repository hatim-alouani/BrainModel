'use client'

import React from 'react'

interface SidebarProps {
  items: any[]
  onSelect: (item: any) => void
}

export default function Sidebar({ items, onSelect }: SidebarProps) {
  return (
    <aside className="w-80 bg-white shadow p-4">
      <h3 className="font-semibold text-lg">Prediction History</h3>
      <div className="mt-4 space-y-2 overflow-y-auto max-h-[70vh]">
        {items && items.length? items.map(it=> (
          <button key={it.id} onClick={()=>onSelect(it)} className="w-full text-left p-2 rounded hover:bg-slate-50">
            <div className="text-sm text-slate-700">{it.filename || 'upload'}</div>
            <div className="text-xs text-slate-400">{it.predicted_label} • {new Date(it.created_at).toLocaleString()}</div>
          </button>
        )): <div className="text-sm text-slate-400">No history yet</div>}
      </div>
    </aside>
  )
}
