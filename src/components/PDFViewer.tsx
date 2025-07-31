'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import react-pdf components with worker configuration
const PDFViewerComponents = dynamic(
  async () => {
    const mod = await import('react-pdf')
    // Set up PDF.js worker (only in browser)
    mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.js`
    return {
      Document: mod.Document,
      Page: mod.Page
    }
  },
  { ssr: false }
)

interface PDFObject {
  id: string
  type: 'text' | 'image' | 'path'
  bbox: [number, number, number, number]
  text?: string
  color?: number
  opacity?: number
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

interface Props {
  pdfFile: PDFFile
}

export default function PDFViewer({ pdfFile }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageObjects, setPageObjects] = useState<PDFObject[]>([])
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [scale, setScale] = useState(1.0)

  const loadPageObjects = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8000/api/objects?fileId=${pdfFile.fileId}&page=${page}`
      )
      if (response.ok) {
        const objects = await response.json()
        setPageObjects(objects)
      }
    } catch (error) {
      console.error('Failed to load page objects:', error)
    } finally {
      setLoading(false)
    }
  }, [pdfFile.fileId])

  useEffect(() => {
    loadPageObjects(currentPage)
  }, [currentPage, loadPageObjects])

  const handleObjectClick = (objectId: string) => {
    const newSelected = new Set(selectedObjects)
    if (newSelected.has(objectId)) {
      newSelected.delete(objectId)
    } else {
      newSelected.add(objectId)
    }
    setSelectedObjects(newSelected)
  }

  const handleRemoveWatermarks = async () => {
    if (selectedObjects.size === 0) {
      alert('请先选择要删除的水印元素')
      return
    }

    setProcessing(true)
    try {
      const selections = [{
        page: currentPage,
        objectIds: Array.from(selectedObjects)
      }]

      const response = await fetch('http://localhost:8000/api/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: pdfFile.fileId,
          selections
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const taskId = result.taskId

        const resultResponse = await fetch(
          `http://localhost:8000/api/result?taskId=${taskId}`
        )
        
        if (resultResponse.ok) {
          const resultData = await resultResponse.json()
          if (resultData.status === 'done') {
            window.open(`http://localhost:8000${resultData.downloadUrl}`, '_blank')
          }
        }
      }
    } catch (error) {
      console.error('Failed to remove watermarks:', error)
      alert('删除水印失败，请重试')
    } finally {
      setProcessing(false)
    }
  }

  const renderObjectOverlay = (obj: PDFObject) => {
    const [x1, y1, x2, y2] = obj.bbox
    const isSelected = selectedObjects.has(obj.id)
    
    return (
      <div
        key={obj.id}
        className={`absolute border-2 cursor-pointer transition-colors ${
          isSelected 
            ? 'border-red-500 bg-red-200 bg-opacity-30' 
            : 'border-blue-500 bg-blue-200 bg-opacity-20 hover:bg-opacity-30'
        }`}
        style={{
          left: x1 * scale,
          top: y1 * scale,
          width: (x2 - x1) * scale,
          height: (y2 - y1) * scale,
        }}
        onClick={() => handleObjectClick(obj.id)}
        title={obj.type === 'text' ? obj.text : `${obj.type} 对象`}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {pdfFile.filename} - 第 {currentPage} 页 / 共 {pdfFile.pages.length} 页
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">缩放:</label>
              <select 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={0.5}>50%</option>
                <option value={0.75}>75%</option>
                <option value={1.0}>100%</option>
                <option value={1.25}>125%</option>
                <option value={1.5}>150%</option>
              </select>
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              上一页
            </button>
            
            <span className="text-sm text-gray-600">
              {currentPage} / {pdfFile.pages.length}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(pdfFile.pages.length, currentPage + 1))}
              disabled={currentPage >= pdfFile.pages.length}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative border border-gray-300 inline-block">
              <PDFViewerComponents.Document
                file={`http://localhost:8000/api/download/${pdfFile.fileId}`}
                loading={<div className="p-8">加载 PDF...</div>}
              >
                <PDFViewerComponents.Page
                  pageNumber={currentPage}
                  scale={scale}
                  loading={<div className="p-8">渲染页面...</div>}
                />
              </PDFViewerComponents.Document>
              
              {!loading && pageObjects.map(renderObjectOverlay)}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">
                页面对象 ({pageObjects.length})
              </h3>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">加载中...</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pageObjects.map((obj) => (
                    <div
                      key={obj.id}
                      className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                        selectedObjects.has(obj.id)
                          ? 'bg-red-100 border border-red-300'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleObjectClick(obj.id)}
                    >
                      <div className="font-medium">{obj.type}</div>
                      {obj.text && (
                        <div className="text-gray-600 truncate">
                          &ldquo;{obj.text}&rdquo;
                        </div>
                      )}
                      <div className="text-gray-500 text-xs mt-1">
                        位置: ({Math.round(obj.bbox[0])}, {Math.round(obj.bbox[1])})
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setSelectedObjects(new Set())}
                  className="w-full px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  disabled={selectedObjects.size === 0}
                >
                  清除选择 ({selectedObjects.size})
                </button>
                
                <button
                  onClick={handleRemoveWatermarks}
                  disabled={selectedObjects.size === 0 || processing}
                  className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? '处理中...' : `删除选中的水印 (${selectedObjects.size})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}