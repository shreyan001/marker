'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import SwapView from './SwapView'
import LiquidityView from './LiquidityVIew'
import AIAssistant from './AIAssistant'
import { motion, AnimatePresence } from 'framer-motion'
import ConnectButton from './ui/WalletButton'


export function MainComponent() {
  const [activeView, setActiveView] = useState<'swap' | 'liquidity'>('swap')
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(false)

  const toggleAssistant = () => setIsAssistantExpanded(!isAssistantExpanded)

  return (
 
      <div className="flex flex-col min-h-screen bg-black text-white font-mono">
        {/* Navbar */}
        <nav className="fixed z-50 top-0 left-0 right-0 flex justify-between items-center p-4 bg-gray-900 border-b-2 border-white">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#FFC700] rounded-full shadow-[0_0_10px_#FFC700] flex items-center justify-center">
              <span className="font-bold text-black text-xl">SD</span>
            </div>
            <span className="font-bold text-2xl">Swapster</span>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </nav>
        <div className="flex flex-1 overflow-hidden pt-16"> {/* Add padding-top to account for the navbar height */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Swap/Liquidity Switch */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-800 p-1 rounded-full">
                  <Button
                    variant={activeView === 'swap' ? 'default' : 'ghost'}
                    onClick={() => setActiveView('swap')}
                    className={`rounded-full px-6 py-2 ${activeView === 'swap' ? 'bg-[#FFC700] text-black shadow-[0_4px_0_rgba(255,255,255,1)]' : 'text-gray-400'}`}
                  >
                    Swap
                  </Button>
                  <Button
                    variant={activeView === 'liquidity' ? 'default' : 'ghost'}
                    onClick={() => setActiveView('liquidity')}
                    className={`rounded-full px-6 py-2 ${activeView === 'liquidity' ? 'bg-[#FFC700] text-black shadow-[0_4px_0_rgba(255,255,255,1)]' : 'text-gray-400'}`}
                  >
                    Liquidity
                  </Button>
                </div>
              </div>

              {/* Render active view */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeView === 'swap' ? <SwapView /> : <LiquidityView />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* AI Assistant Panel */}
          <AIAssistant isExpanded={isAssistantExpanded} toggleExpanded={toggleAssistant} />
        </div>
      </div>
   
  )
}