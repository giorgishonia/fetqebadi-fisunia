"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameCard as GameCardComponent } from "@/components/game-card"
import { Sparkles } from "lucide-react"
import type { Card as GameCardType } from "@/lib/types"

interface AlterFutureDialogProps {
  cards: GameCardType[]
  onConfirm: (cardOrder: string[]) => void
}

export function AlterFutureDialog({ cards, onConfirm }: AlterFutureDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [reorderedCards, setReorderedCards] = useState<GameCardType[]>([...cards])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCardClick = (index: number) => {
    if (selectedIndex === null) {
      // First selection - mark the card to move
      setSelectedIndex(index)
    } else {
      // Second selection - swap the cards
      const newCards = [...reorderedCards]
      ;[newCards[selectedIndex], newCards[index]] = [newCards[index], newCards[selectedIndex]]
      setReorderedCards(newCards)
      setSelectedIndex(null)
    }
  }

  const handleConfirm = () => {
    onConfirm(reorderedCards.map(card => card.id))
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-black/90 backdrop-blur-md rounded-xl p-6 space-y-4 max-w-2xl w-full border-2 border-violet-500/50 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2 justify-center">
          <Sparkles className="w-6 h-6 text-violet-400" />
          <h3 className="font-bold text-xl text-white">Alter the Future</h3>
        </div>

        <p className="text-white/80 text-center text-sm">
          Click two cards to swap their positions. Top card will be drawn first.
        </p>

        <div className="flex gap-4 justify-center items-end">
          {reorderedCards.map((card, index) => (
            <div key={card.id} className="relative cursor-pointer" onClick={() => handleCardClick(index)}>
              <div className={`transition-all ${selectedIndex === index ? 'scale-110 ring-4 ring-violet-400 rounded-lg' : ''}`}>
                <GameCardComponent card={card} size="md" showInfo={false} />
              </div>
              <Badge className={`absolute -top-3 -left-3 w-8 h-8 p-0 flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-red-500 border-red-400' : 
                index === 1 ? 'bg-yellow-500 border-yellow-400' : 
                'bg-green-500 border-green-400'
              }`}>
                {index + 1}
              </Badge>
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-violet-400/20 rounded-lg border-2 border-violet-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-6 text-lg"
            onClick={handleConfirm}
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

