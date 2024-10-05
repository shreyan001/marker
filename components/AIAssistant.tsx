'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Send } from 'lucide-react'

interface AIAssistantProps {
  isExpanded: boolean
  toggleExpanded: () => void
}

export default function AIAssistant({ isExpanded, toggleExpanded }: AIAssistantProps) {
  const { address } = useAccount()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ content: string; isUser: boolean }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isExpanded) {
      setTimeout(scrollToBottom, 300)
    }
  }, [isExpanded, messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setMessages(prev => [...prev, { content: input, isUser: true }])
      setInput('')
      // Here you would typically send the message to your AI backend
      // For now, we'll just simulate a response
      setTimeout(() => {
        setMessages(prev => [...prev, { content: "I'm a simple AI assistant. How can I help you?", isUser: false }])
      }, 1000)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="w-96 bg-gray-900 overflow-hidden border-l-2 border-t-2 border-b-2 border-white flex flex-col font-mono"
        initial={{ width: "70px" }}
        animate={{ width: isExpanded ? "484px" : "70px" }}
        transition={{ duration: 0.3 }}
        style={{ position: 'fixed', right: 0, top: '9%', height: '85%', zIndex: 10 }}
      >
        <Button 
          variant="ghost" 
          className="absolute top-1/4 -left-4 transform bg-[#FFC700] text-black border-2 border-white shadow-[0_4px_0_rgba(255,255,255,1)] hover:shadow-[0_2px_0_rgba(255,255,255,1)] active:shadow-none transition-all duration-200 z-10"
          onClick={toggleExpanded}
        >
          {isExpanded ? <ChevronRight /> : <ChevronLeft />}
        </Button>

        {!isExpanded && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-sm font-bold text-white">
            AI Trading Assistant
          </div>
        )}

        {isExpanded && address && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <div className="p-6 border-b-2 border-white">
              <h2 className="text-xl font-bold mb-4 text-white">AI Trading Assistant</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg ${
                    msg.isUser
                      ? 'bg-[#FFC700] text-black ml-auto'
                      : 'bg-gray-800 text-white mr-auto'
                  } max-w-[65%] break-words border-2 border-white shadow-[0_4px_0_rgba(255,255,255,1)]`}
                >
                  <pre className="whitespace-pre-wrap font-mono">{msg.content}</pre>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-white">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-grow bg-black text-white border-2 border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] focus:shadow-[0_0_0_2px_#FFC700]"
                />
                <Button 
                  type="submit" 
                  className="bg-[#FFC700] text-black border-2 border-white shadow-[0_4px_0_rgba(255,255,255,1)] hover:shadow-[0_2px_0_rgba(255,255,255,1)] active:shadow-none transition-all duration-200 transform active:translate-y-1"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}