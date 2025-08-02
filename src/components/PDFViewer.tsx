'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { pdfjs } from 'react-pdf'
import apiClient from '@/lib/api'

// Dynamically import Document and Page components
const PDFComponents = dynamic(
  () => import('react-pdf').then(mod => {
    // Set up PDF.js worker (only in browser)
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
    }
    return {
      Document: mod.Document,
      Page: mod.Page
    }
  }),
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
      const objects = await apiClient.getPageObjects(pdfFile.fileId, page)
      setPageObjects(objects)
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

      const result = await apiClient.removeWatermarks(pdfFile.fileId, selections)
      const taskId = result.taskId

      const resultData = await apiClient.getResult(taskId)
      if (resultData.status === 'done') {
        window.open(apiClient.getDownloadUrl(taskId), '_blank')
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card rounded-2xl p-6 md:p-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              {pdfFile.filename}
            </h2>
            <p className="text-gray-600">
              Page {currentPage} of {pdfFile.pages.length} • {selectedObjects.size} elements selected
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Scale:</label>
              <select 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0.5}>50%</option>
                <option value={0.75}>75%</option>
                <option value={1.0}>100%</option>
                <option value={1.25}>125%</option>
                <option value={1.5}>150%</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Previous
              </motion.button>
              
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium">
                {currentPage} / {pdfFile.pages.length}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(Math.min(pdfFile.pages.length, currentPage + 1))}
                disabled={currentPage >= pdfFile.pages.length}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Next
              </motion.button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="xl:col-span-3"
          >
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <PDFComponents.Document
                file={apiClient.getPDFUrl(pdfFile.fileId)}
                loading={
                  <div className="flex items-center justify-center p-16">
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
                      />
                      <p className="text-gray-600">Loading PDF...</p>
                    </div>
                  </div>
                }
              >
                <PDFComponents.Page
                  pageNumber={currentPage}
                  scale={scale}
                  loading={
                    <div className="flex items-center justify-center p-16">
                      <div className="text-center space-y-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full mx-auto"
                        />
                        <p className="text-gray-600">Rendering page...</p>
                      </div>
                    </div>
                  }
                />
              </PDFComponents.Document>
              
              {!loading && pageObjects.map(renderObjectOverlay)}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="xl:col-span-1"
          >
            <div className="glass rounded-2xl p-6 h-fit sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  Elements ({pageObjects.length})
                </h3>
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                  {selectedObjects.size} selected
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-3 border-white border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-white/80 text-sm">Analyzing elements...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {pageObjects.map((obj, index) => (
                      <motion.div
                        key={obj.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedObjects.has(obj.id)
                            ? 'bg-red-500/20 border-2 border-red-400 scale-105'
                            : 'bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-102'
                        }`}
                        onClick={() => handleObjectClick(obj.id)}
                        whileHover={{ scale: selectedObjects.has(obj.id) ? 1.05 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium capitalize">
                            {obj.type}
                          </span>
                          <span className={`w-3 h-3 rounded-full ${
                            obj.type === 'text' ? 'bg-blue-400' :
                            obj.type === 'image' ? 'bg-green-400' : 'bg-purple-400'
                          }`} />
                        </div>
                        
                        {obj.text && (
                          <div className="text-white/80 text-sm mb-2 line-clamp-2">
                            &ldquo;{obj.text}&rdquo;
                          </div>
                        )}
                        
                        <div className="text-white/60 text-xs">
                          Position: ({Math.round(obj.bbox[0])}, {Math.round(obj.bbox[1])})
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedObjects(new Set())}
                  className="w-full px-4 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors disabled:opacity-50"
                  disabled={selectedObjects.size === 0}
                >
                  Clear Selection ({selectedObjects.size})
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: processing ? 1 : 1.02 }}
                  whileTap={{ scale: processing ? 1 : 0.98 }}
                  onClick={handleRemoveWatermarks}
                  disabled={selectedObjects.size === 0 || processing}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                    processing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 animate-glow'
                  } text-white disabled:opacity-50`}
                >
                  {processing ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Processing...
                    </div>
                  ) : (
                    `Remove Watermarks (${selectedObjects.size})`
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}