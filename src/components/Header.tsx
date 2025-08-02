'use client'

import { motion } from 'framer-motion'
import { FileText, Github, Star } from 'lucide-react'

export default function Header() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-20 w-full"
    >
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 glass rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PDF Cleaner</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            <motion.a
              href="#features"
              className="text-white/80 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Features
            </motion.a>
            <motion.a
              href="#how-it-works"
              className="text-white/80 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              How it Works
            </motion.a>
            <motion.a
              href="#pricing"
              className="text-white/80 hover:text-white transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Pricing
            </motion.a>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.a
              href="https://github.com"
              className="p-2 glass rounded-xl text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5" />
            </motion.a>
            
            <motion.button
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Star</span>
            </motion.button>
          </div>
        </div>
      </nav>
    </motion.header>
  )
}