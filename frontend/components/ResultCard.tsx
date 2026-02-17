'use client'

import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { HistoryDetails, HistoryItem } from '../types'

interface ResultCardProps {
  selected: HistoryItem | null
  apiUrl: string
}

export default function ResultCard({ selected, apiUrl }: ResultCardProps) {
  const [details, setDetails] = useState<HistoryDetails | null>(null)

  useEffect(()=>{
    if(selected){
      axios.get<HistoryDetails>(`${apiUrl}/history/${selected.id}`).then(r=>setDetails(r.data)).catch(()=>setDetails(null))
    }
  }, [selected, apiUrl])

  if(!selected) return (
    <div className="bg-white p-4 rounded shadow">No item selected</div>
  )

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold">Prediction Details</h4>
      {details? (
        <div className="mt-3">
          {details.image_base64 && <img src={`data:image/png;base64,${details.image_base64}`} className="max-h-60 object-contain" />}
          <div className="mt-2 text-2xl font-bold">{details.predicted_label}</div>
          <div className="mt-2">
            {Object.entries(details.probabilities).map(([k,v])=> (
              <div key={k} className="flex items-center gap-2 my-1">
                <div className="w-28 text-sm">{k}</div>
                <div className="flex-1 bg-slate-100 rounded h-3 overflow-hidden">
                  <div style={{width:`${Math.round((v as number)*100)}%`}} className="bg-cyan-600 h-3" />
                </div>
                <div className="w-10 text-right text-sm">{Math.round((v as number)*100)}%</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h5 className="font-semibold">Recommendations</h5>
            <div className="mt-2">
              {details.recommendations? (
                <div>
                  <div className="font-medium">{details.recommendations.title}</div>
                  <ul className="list-disc ml-5 mt-2 text-sm">
                    {details.recommendations.items.map((it, idx)=> <li key={idx}>{it}</li>)}
                  </ul>
                </div>
              ): <div className="text-sm text-slate-400">No recommendations</div>}
            </div>
          </div>
        </div>
      ) : <div>Loading...</div>}
    </div>
  )
}
