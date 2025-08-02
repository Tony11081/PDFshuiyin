const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Selection {
  page: number
  objectIds: string[]
}

interface PDFFile {
  fileId: string
  filename: string
  pages: Array<{
    page: number
    width: number
    height: number
  }>
}

interface PDFObject {
  id: string
  type: 'text' | 'image' | 'path'
  bbox: [number, number, number, number]
  text?: string
  color?: number
  opacity?: number
}

interface RemoveResult {
  taskId: string
}

interface TaskResult {
  status: 'processing' | 'done' | 'error'
  downloadUrl?: string
  message?: string
}

interface APIClient {
  uploadPDF: (file: File) => Promise<PDFFile>
  getPageObjects: (fileId: string, page: number) => Promise<PDFObject[]>
  removeWatermarks: (fileId: string, selections: Selection[]) => Promise<RemoveResult>
  getResult: (taskId: string) => Promise<TaskResult>
  getPDFUrl: (fileId: string) => string
  getDownloadUrl: (taskId: string) => string
}

const apiClient: APIClient = {
  uploadPDF: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload PDF')
    }

    return response.json()
  },

  getPageObjects: async (fileId: string, page: number) => {
    const response = await fetch(`${API_BASE_URL}/api/objects?fileId=${fileId}&page=${page}`)
    if (!response.ok) {
      throw new Error('Failed to fetch page objects')
    }
    return response.json()
  },

  removeWatermarks: async (fileId: string, selections: Selection[]) => {
    const response = await fetch(`${API_BASE_URL}/api/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        selections
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to remove watermarks')
    }
    return response.json()
  },

  getResult: async (taskId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/result?taskId=${taskId}`)
    if (!response.ok) {
      throw new Error('Failed to get result')
    }
    return response.json()
  },

  getPDFUrl: (fileId: string) => {
    return `${API_BASE_URL}/api/download/${fileId}`
  },

  getDownloadUrl: (taskId: string) => {
    return `${API_BASE_URL}/api/download/result/${taskId}`
  }
}

export default apiClient
export type { PDFFile, Selection, PDFObject, RemoveResult, TaskResult }