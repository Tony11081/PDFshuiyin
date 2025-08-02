'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import apiClient, { type PDFFile } from '@/lib/api'

const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-16">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white">Loading PDF viewer...</p>
      </div>
    </div>
  )
})

export default function PDFUploader() {
  const [uploadedPDF, setUploadedPDF] = useState<PDFFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      setError('Please select a PDF file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const result = await apiClient.uploadPDF(file)
      setUploadedPDF(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
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
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card rounded-2xl p-8 md:p-12"
      >
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50/50 scale-105' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/30'
          }`}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Loader2 className="w-16 h-16 text-blue-600" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Uploading your PDF...</h3>
                  <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.div
                  animate={{ 
                    y: isDragActive ? -10 : 0,
                    scale: isDragActive ? 1.1 : 1 
                  }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Upload className="w-12 h-12 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: isDragActive ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {isDragActive ? 'Drop your PDF here' : 'Upload your PDF document'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Drag and drop your PDF file here, or click to browse and select from your device
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>PDF files only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Max 100MB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Secure & Private</span>
                  </div>
                </div>
                
                <motion.button
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Choose File
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-white">1</span>
            </div>
            <h4 className="font-semibold text-gray-800">Upload</h4>
            <p className="text-sm text-gray-600">Select and upload your watermarked PDF document</p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-white">2</span>
            </div>
            <h4 className="font-semibold text-gray-800">Select</h4>
            <p className="text-sm text-gray-600">Choose watermark elements you want to remove</p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-white">3</span>
            </div>
            <h4 className="font-semibold text-gray-800">Download</h4>
            <p className="text-sm text-gray-600">Get your clean, watermark-free PDF instantly</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}