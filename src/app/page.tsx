import PDFUploader from '@/components/PDFUploader'
import Header from '@/components/Header'
import BackgroundPattern from '@/components/BackgroundPattern'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <BackgroundPattern />
      <Header />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center p-2 glass rounded-full mb-6">
            <span className="text-white/80 text-sm font-medium px-4 py-2">
              ✨ Professional PDF Watermark Removal Tool
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Remove PDF
            <span className="block gradient-text">Watermarks</span>
            <span className="block text-white/90">Effortlessly</span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
            Upload your watermarked PDF, select unwanted elements with precision, 
            and download a clean, professional document in seconds.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60 mb-16">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Batch Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>High Precision</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Original Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
        
        <PDFUploader />
      </div>
    </main>
  )
}
