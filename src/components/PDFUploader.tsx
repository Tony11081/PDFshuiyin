'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import PDFViewer from './PDFViewer'

interface PDFFile {
  fileId: string
  filename: string
  pages: Array<{
    page: number
    width: number
    height: number
  }>
}

export default function PDFUploader() {
  const [uploadedPDF, setUploadedPDF] = useState<PDFFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      setError('请选择 PDF 文件')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const result = await response.json()
      setUploadedPDF(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  if (uploadedPDF) {
    return <PDFViewer pdfFile={uploadedPDF} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="text-6xl">📄</div>
          
          {uploading ? (
            <div>
              <div className="text-lg font-medium text-gray-700">上传中...</div>
              <div className="mt-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? '放下文件以上传' : '拖拽 PDF 文件到这里或点击选择'}
              </div>
              <div className="text-sm text-gray-500">
                支持最大 100MB 的 PDF 文件
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <h3 className="font-semibold mb-2">使用说明：</h3>
        <ol className="text-left space-y-1 max-w-md mx-auto">
          <li>1. 上传带水印的 PDF 文件</li>
          <li>2. 在预览中选择要删除的水印元素</li>
          <li>3. 点击生成按钮获得无水印 PDF</li>
        </ol>
      </div>
    </div>
  )
}