import { useState } from 'react'
import api from '../api/client'
import SectionCard from '../components/SectionCard'
import type { DatasetUploadResponse } from '../types'

function UploadDataset() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [response, setResponse] = useState<DatasetUploadResponse | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      setError('Select a CSV file before uploading.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await api.post<DatasetUploadResponse>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResponse(result.data)
      setMessage(result.data.message)
      setFile(null)
    } catch (uploadError) {
      setError('Upload failed. Ensure the CSV contains the required columns.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard
      title="Upload Dataset"
      subtitle="Submit a historical sales CSV file to validate, store, and prepare it for training."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 transition hover:border-signal/40 hover:bg-white/8">
          <span className="mb-2 block text-sm text-slate-300">CSV file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-signal file:px-4 file:py-2 file:font-semibold file:text-midnight hover:file:bg-[#6ee7d8]"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-signal px-5 py-3 text-sm font-semibold text-midnight transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Uploading...' : 'Upload Dataset'}
        </button>

        {message ? <div className="rounded-2xl border border-signal/25 bg-signal/10 p-4 text-sm text-signal">{message}</div> : null}
        {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

        {response ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">{response.dataset.filename}</p>
            <p>{response.rows} rows validated</p>
            <p>{response.columns.length} columns detected</p>
          </div>
        ) : null}
      </form>
    </SectionCard>
  )
}

export default UploadDataset