import PDFUploader from '@/components/PDFUploader'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF 水印去除工具
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            上传带水印的 PDF 文件，手动选择要删除的水印元素，生成无水印的新 PDF
          </p>
        </div>
        
        <PDFUploader />
      </div>
    </main>
  )
}
