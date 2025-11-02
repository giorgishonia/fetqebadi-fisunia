"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Info } from "lucide-react"
import { Card } from "@/lib/types"
import { CARD_DISPLAY_NAMES, CARD_DESCRIPTIONS } from "@/lib/game-logic"
import Image from "next/image"

const CARD_IMAGES: Record<string, string> = {
  "exploding-kitten": "/cat/exploding-kitten.png",
  defuse: "/cat/defuse.png",
  nope: "/cat/nope.png",
  attack: "/cat/favor.png", // Using favor as attack placeholder  
  skip: "/cat/skip.png",
  favor: "/cat/favor.png",
  shuffle: "/cat/shuffle.png",
  "see-the-future": "/cat/see-the-future.png",
  "cat-taco": "/cat/tacocat.png",
  "cat-rainbow": "/cat/rainbow-ralphing-cat.png",
  "cat-beard": "/cat/beart-cat.png",
  "cat-melon": "/cat/cattermelon.png",
  "cat-potato": "/cat/hairy-potato-cat.png",
}

interface CardInfoModalProps {
  card: Card
  isOpen: boolean
  onClose: () => void
}

export function CardInfoModal({ card, isOpen, onClose }: CardInfoModalProps) {
  const [mounted, setMounted] = useState(false)
  const imageSrc = CARD_IMAGES[card.type] || "/cat/nope.png"

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative max-w-2xl w-full pointer-events-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-4 -right-4 z-10 w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Card content */}
              <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl border-4 border-purple-500 overflow-hidden">
                <div className="p-8 space-y-6">
                  {/* Card Image */}
                  <div className="relative w-full aspect-[2/3] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-400">
                    <Image src={imageSrc} alt={CARD_DISPLAY_NAMES[card.type]} fill className="object-cover" />
                  </div>

                  {/* Card Info */}
                  <div className="space-y-4 text-center">
                    <h2 className="text-5xl font-black text-white">{CARD_DISPLAY_NAMES[card.type]}</h2>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                      <p className="text-2xl font-bold text-white/90 leading-relaxed">
                        {CARD_DESCRIPTIONS[card.type]}
                      </p>
                    </div>

                    {/* Additional info for cat cards */}
                    {card.type.startsWith("cat-") && (
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-amber-500/50">
                          <p className="text-sm font-semibold text-amber-300 mb-1">2 Matching Cards</p>
                          <p className="text-base text-white/90">Steal a random card from any player</p>
                        </div>
                        <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-500/50">
                          <p className="text-sm font-semibold text-purple-300 mb-1">3 Matching Cards</p>
                          <p className="text-base text-white/90">Steal a specific card from any player</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

// Info button component to trigger the modal
export function CardInfoButton({ card, className }: { card: Card; className?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
        }}
        className={`absolute top-1 right-1 w-6 h-6 rounded-full bg-blue-600/90 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 z-20 ${className}`}
      >
        <Info className="w-4 h-4" />
      </button>

      <CardInfoModal card={card} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

