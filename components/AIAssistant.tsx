'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Client } from '@xmtp/xmtp-js'
import { useClient, useConversations, useMessages, useStreamMessages, useSendMessage } from '@xmtp/react-sdk'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Send } from 'lucide-react'
import { Buffer } from "buffer";
import { CachedConversation, CachedMessage } from '@xmtp/react-sdk'
import { toCachedMessage } from '@xmtp/react-sdk';

interface AIAssistantProps {
  isExpanded: boolean
  toggleExpanded: () => void
}

const ENCODING = "binary";

const getEnv = (): "dev" | "production" | "local" => {
  return (typeof process !== undefined && process.env.REACT_APP_XMTP_ENV
    ? process.env.REACT_APP_XMTP_ENV
    : "production") as "dev" | "production" | "local";
};

const buildLocalStorageKey = (walletAddress: string) => {
  return walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";
};

const loadKeys = (walletAddress: string) => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

const storeKeys = (walletAddress: string, keys: Uint8Array) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING)
  );
};

const emptyConversation: CachedConversation = {
  createdAt: new Date(),
  isReady: false,
  peerAddress: '',
  topic: 'initial-topic', // You can set this to any initial value
  updatedAt: new Date(),
  walletAddress: ''
};

export default function AIAssistant({ isExpanded, toggleExpanded }: AIAssistantProps) {
  const { address } = useAccount()
  const { data: signer } = useWalletClient()
  const [isXmtpConnected, setIsXmtpConnected] = useState(false)
  const [input, setInput] = useState('')

  const { client, initialize } = useClient()
  const { conversations } = useConversations()
  const peerAddress = '0x78160b2c45b0A7FAC6857DC3FED965c4aD55803F' // AI assistant address

  const [conversation, setConversation] = useState<CachedConversation>(emptyConversation);
  const { messages: initialMessages, isLoading: isMessagesLoading } = useMessages(conversation)
  const [messages, setMessages] = useState<CachedMessage[]>([])
  const { sendMessage } = useSendMessage()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useStreamMessages(conversation, {
    onMessage: (message) => {
      const cachedMessage = toCachedMessage(message, client.address);
      setMessages((prevMessages) => [...prevMessages, cachedMessage]);
    },
  })

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      console.log("Scrolling to bottom");
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.log("messagesEndRef.current is null");
    }
  };

  useEffect(() => {
    console.log("Messages updated, scrolling to bottom");
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isExpanded) {
      console.log("Assistant expanded, scrolling to bottom");
      setTimeout(scrollToBottom, 300);
    }
  }, [isExpanded]);

  useEffect(() => {
    console.log("Client:", client)
    console.log("Conversations:", conversations)
  }, [client, conversations])

  useEffect(() => {
    if (client && conversations.length > 0) {
      const aiConversation = conversations.find(
        conv => conv.peerAddress.toLowerCase() === peerAddress.toLowerCase()
      )
      console.log("AI Conversation:", aiConversation)
      if (aiConversation) {
        setConversation(aiConversation)
        setIsXmtpConnected(true)
      }
    }
  }, [client, conversations, peerAddress])

  const initXmtpWithKeys = async () => {
    if (!signer) {
      console.log("No signer available")
      return
    }
    const options = { env: getEnv() };
    if (!address) return;
    let keys = loadKeys(address);
    if (!keys) {
      const rawKeys = await Client.getKeys(signer as any, {
        ...options,
        skipContactPublishing: true,
      });
      keys = Buffer.from(rawKeys);
    }
    try {
      await initialize({ keys, options, signer: signer as any });
      setIsXmtpConnected(true)
      console.log("XMTP client initialized successfully")
    } catch (error) {
      console.error("Error initializing XMTP client:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && conversation) {
      try {
        await sendMessage(conversation, input)
        setInput('')
      } catch (error) {
        console.error("Error sending message:", error)
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="w-96 bg-gray-200 overflow-hidden border-l-2 border-t-2 border-b-2 border-black flex flex-col"
        initial={{ width: "70px" }}
        animate={{ width: isExpanded ? "484px" : "70px" }}
        transition={{ duration: 0.3 }}
        style={{ position: 'fixed', right: 0, top: '9%', height: '85%', zIndex: 10 }}
        onAnimationComplete={() => {
          if (isExpanded) {
            console.log("Animation complete, scrolling to bottom");
            scrollToBottom();
          }
        }}
      >
        <Button 
          variant="ghost" 
          className={`absolute top-1/4 -left-4 transform bg-[#39FF14] text-black border-2 border-black shadow-[0_4px_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_rgba(0,0,0,1)] active:shadow-none transition-all duration-200 z-10 ${!signer ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={signer ? toggleExpanded : undefined}
          disabled={!signer}
        >
          {isExpanded ? <ChevronRight /> : <ChevronLeft />}
        </Button>

        {!isExpanded && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-sm font-bold">
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
            onAnimationComplete={scrollToBottom}
          >
            {!isXmtpConnected ? (
              <div className="flex justify-center items-center h-full">
                <Button onClick={initXmtpWithKeys}>
                  Connect to XMTP
                </Button>
              </div>
            ) : (
              <>
                <div className="p-6 border-b-2 border-black">
                  <h2 className="text-xl font-bold mb-4">AI Trading Assistant</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isMessagesLoading ? (
                    <div>Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div>No messages yet</div>
                  ) : (
                    messages.map((msg, index) => (
                      <motion.div
                        key={msg.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-lg ${
                          msg.senderAddress === address
                            ? 'bg-[#39FF14] text-black ml-auto'
                            : 'bg-white text-black mr-auto'
                        } max-w-[65%] break-words border-2 border-black shadow-[0_4px_0_rgba(0,0,0,1)]`}
                      >
                        <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-black">
                  <div className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-grow bg-white border-2 border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:shadow-[0_0_0_2px_#39FF14]"
                    />
                    <Button 
                      type="submit" 
                      className="bg-[#39FF14] text-black border-2 border-black shadow-[0_4px_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_rgba(0,0,0,1)] active:shadow-none transition-all duration-200 transform active:translate-y-1"
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
