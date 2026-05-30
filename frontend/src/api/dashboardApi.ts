import type { DashboardResponse } from '../types/dashboard'
import api from '../services/api.js'

export async function analyzeDataset(file: File, onUploadProgress?: (progress: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<DashboardResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!event.total) {
        return
      }
      onUploadProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })

  return response.data
}