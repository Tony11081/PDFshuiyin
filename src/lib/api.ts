const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Selection {
  page: number
  objectIds: string[]
}

const apiClient = {
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