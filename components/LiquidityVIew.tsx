import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function LiquidityView() {
  const [selectedPair, setSelectedPair] = useState({ token1: '', token2: '' })
  const [showLiquidityDetails, setShowLiquidityDetails] = useState(false)

  return (
    <Card className="bg-black text-white border-2 border-white shadow-[0_10px_20px_rgba(255,255,255,0.1)] max-w-md mx-auto font-mono">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Liquidity</h2>
        {!showLiquidityDetails ? (
          <>
            <div className="space-y-4 mb-4">
              <Select onValueChange={(value) => setSelectedPair(prev => ({ ...prev, token1: value }))}>
                <SelectTrigger className="w-full bg-black text-white border-2 border-white shadow-[0_4px_0_rgba(255,255,255,1)] hover:shadow-[0_2px_0_rgba(255,255,255,1)] active:shadow-none transition-all duration-200">
                  <SelectValue placeholder="Select first token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setSelectedPair(prev => ({ ...prev, token2: value }))}>
                <SelectTrigger className="w-full bg-black text-white border-2 border-white shadow-[0_4px_0_rgba(255,255,255,1)] hover:shadow-[0_2px_0_rgba(255,255,255,1)] active:shadow-none transition-all duration-200">
                  <SelectValue placeholder="Select second token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full bg-[#FFC700] text-black border-2 border-white shadow-[0_4px_0_rgba(255,255,255,1)] hover:shadow-[0_2px_0_rgba(255,255,255,1)] active:shadow-none transition-all duration-200 transform active:translate-y-1"
              onClick={() => setShowLiquidityDetails(true)}
              disabled={!selectedPair.token1 || !selectedPair.token2}
            >
              Add Liquidity
            </Button>
          </>
        ) : (
          <>
            <div className="bg-gray-900 p-4 border-2 border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] mb-4">
              <span className="font-bold">Selected Pair:</span> {selectedPair.token1}/{selectedPair.token2}
            </div>
            <div className="space-y-4 mb-4">
              <div className="bg-gray-900 p-4 border-2 border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
                <Label htmlFor="amount1" className="text-white">Amount {selectedPair.token1}</Label>
                <Input id="amount1" className="mt-2 bg-black text-white border-2 border-white" placeholder="0" />
              </div>
              <div className="bg-gray-900 p-4 border-2 border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
                <Label htmlFor="amount2" className="text-white">Amount {selectedPair.token2}</Label>
                <Input id="amount2" className="mt-2 bg-black text-white border-2 border-white" placeholder="0" />
              </div>
              <div className="bg-gray-900 p-4 border-2 border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
                <Label className="text-white">Fee Tier</Label>
                <Select>
                  <SelectTrigger className="w-full mt-2 bg-black text-white border-2 border-white">
                    <SelectValue placeholder="Select fee tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.01">0.01%</SelectItem>
                    <SelectItem value="0.05">0.05%</SelectItem>
                    <SelectItem value="0.3">0.3%</SelectItem>
                    <SelectItem value="1">1%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-gray-900 p-4 border-2 border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
                <Label className="text-white">Price Range</Label>
                <div className="flex space-x-4 mt-2">
                  <Input className="bg-black text-white border-2 border-white" placeholder="Min Price" />
                  <Input className="bg-black text-white border-2 border-white" placeholder="Max Price" />
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button 
                className="flex-1 bg-gray-800 text-white border-2 border-white shadow-[0_4px_0_rgba(255,255,255,1)] hover:shadow-[0_2px_0_rgba(255,255,255,1)] active:shadow-none transition-all duration-200 transform active:translate-y-1"
                onClick={() => setShowLiquidityDetails(false)}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-[#FFC700] text-black border-2 border-white shadow-[0_4px_0_rgba(255,255,255,1)] hover:shadow-[0_2px_0_rgba(255,255,255,1)] active:shadow-none transition-all duration-200 transform active:translate-y-1"
              >
                Confirm
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}