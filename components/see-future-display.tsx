"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Badge } from "@/components/ui/badge"
import { GameCard as GameCardComponent } from "@/components/game-card"
import { Eye } from "lucide-react"
import type { Card as GameCardType } from "@/lib/types"

interface SeeFutureDisplayProps {
  cards: GameCardType[]
}

export function SeeFutureDisplay({ cards }: SeeFutureDisplayProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted || !visible) return null

  return createPortal(
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      <div className="bg-black/90 backdrop-blur-md rounded-xl p-4 space-y-3 border-2 border-cyan-500/50 shadow-2xl animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2 justify-center">
          <Eye className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-lg text-white">Next {cards.length} Cards</h3>
        </div>

        <div className="flex gap-3 justify-center">
          {cards.map((card, index) => (
            <div key={card.id} className="relative">
              <GameCardComponent card={card} size="sm" showInfo={false} />
              <Badge className="absolute -top-2 -left-2 w-5 h-5 p-0 flex items-center justify-center bg-cyan-500 text-white border-cyan-400 text-xs">{index + 1}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
