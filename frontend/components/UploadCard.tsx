'use client'

import React, {useState} from 'react'
import axios from 'axios'

interface UploadCardProps {
  onDone: (result: any) => void
  apiUrl: string
}

export default function UploadCard({ onDone, apiUrl }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<any>(null)

  const choose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const upload = async () => {
    if(!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    try{
      const r = await axios.post(`${apiUrl}/predict`, fd, {headers:{'Content-Type':'multipart/form-data'}})
      setResult(r.data)
      onDone && onDone(r.data)
    }catch(e){
      console.error(e)
      const errMsg = axios.isAxiosError(e) 
        ? (e.response?.data?.detail || 'Upload failed. Make sure the model is trained first!')
        : 'Upload failed. Make sure the model is trained first!'
      alert(errMsg)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold">Upload MRI</h4>
      <input type="file" accept="image/*" onChange={choose} className="mt-3" />
      {preview && <img src={preview} className="mt-3 max-h-48 object-contain" />}
      <div className="mt-3">
        <button onClick={upload} className="px-4 py-2 bg-cyan-600 text-white rounded" disabled={loading}>{loading? 'Predicting...':'Predict'}</button>
      </div>
      {result && (
        <div className="mt-3 text-sm text-slate-700">
          <div>Predicted: <strong>{result.predicted_label}</strong></div>
        </div>
      )}
    </div>
  )
}
