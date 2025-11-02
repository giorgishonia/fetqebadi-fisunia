"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GameCard as GameCardComponent } from "@/components/game-card"
import { Shovel } from "lucide-react"
import type { Card as GameCardType } from "@/lib/types"

interface BuryDialogProps {
  hand: GameCardType[]
  deckSize: number
  onConfirm: (cardId: string, position: number) => void
  onCancel: () => void
}

export function BuryDialog({ hand, deckSize, onConfirm, onCancel }: BuryDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number>(deckSize) // Default to bottom

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConfirm = () => {
    if (selectedCardId !== null) {
      const validPosition = Math.max(0, Math.min(selectedPosition, deckSize))
      onConfirm(selectedCardId, validPosition)
    }
  }

  const getPositionLabel = (pos: number) => {
    if (pos === 0) return "Top"
    if (pos === 1) return "Second"
    if (pos === deckSize) return "Bottom"
    if (pos === Math.floor(deckSize / 2)) return "Middle"
    return `Position ${pos}`
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-amber-900/95 to-orange-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-4xl w-full border-2 border-amber-500 shadow-2xl animate-in zoom-in-90 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 justify-center">
          <Shovel className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
          <h3 className="font-black text-xl sm:text-2xl text-white">Bury a Card</h3>
        </div>

        <p className="text-sm sm:text-base text-white/90 text-center">
          Select a card from your hand and choose where to bury it in the deck
        </p>

        {/* Card selection */}
        <div className="space-y-3">
          <p className="text-white text-sm sm:text-base font-bold">1. Choose Card to Bury:</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {hand.map((card) => (
              <div
                key={card.id}
                className={`relative cursor-pointer transition-all ${
                  selectedCardId === card.id ? 'scale-105 ring-4 ring-amber-400 rounded-lg' : 'hover:scale-105'
                }`}
                onClick={() => setSelectedCardId(card.id)}
              >
                <GameCardComponent card={card} size="sm" showInfo={false} />
                {selectedCardId === card.id && (
                  <div className="absolute inset-0 bg-amber-400/30 rounded-lg border-2 border-amber-400 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl drop-shadow-lg">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Position selection with slider */}
        {selectedCardId && (
          <div className="space-y-4 animate-in slide-in-from-top duration-200">
            <p className="text-white text-sm sm:text-base font-bold">2. Choose Position in Deck:</p>
            
            <div className="space-y-3">
              {/* Position slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bury-position" className="text-white text-sm sm:text-base font-bold">
                    Position: {getPositionLabel(selectedPosition)}
                  </Label>
                  <span className="text-white/80 text-xs sm:text-sm font-mono">
                    {selectedPosition} / {deckSize}
                  </span>
                </div>
                <input
                  type="range"
                  id="bury-position"
                  min={0}
                  max={deckSize}
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(parseInt(e.target.value))}
                  className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/60">
                  <span>Top (0)</span>
                  <span>Bottom ({deckSize})</span>
                </div>
              </div>

              {/* Or manual input */}
              <div className="space-y-2">
                <Label htmlFor="bury-position-input" className="text-white text-sm font-semibold">
                  Or enter exact position:
                </Label>
                <Input
                  id="bury-position-input"
                  type="number"
                  min={0}
                  max={deckSize}
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/30 text-white text-center font-mono text-lg h-12"
                />
              </div>

              {/* Quick position buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPosition(0)}
                  className={`${
                    selectedPosition === 0
                      ? "bg-amber-600 text-white border-amber-400"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                  } font-bold h-10`}
                >
                  Top (0)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPosition(Math.floor(deckSize / 2))}
                  className={`${
                    selectedPosition === Math.floor(deckSize / 2)
                      ? "bg-amber-600 text-white border-amber-400"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                  } font-bold h-10`}
                >
                  Middle ({Math.floor(deckSize / 2)})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPosition(1)}
                  className={`${
                    selectedPosition === 1
                      ? "bg-amber-600 text-white border-amber-400"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                  } font-bold h-10`}
                >
                  Second (1)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPosition(deckSize)}
                  className={`${
                    selectedPosition === deckSize
                      ? "bg-amber-600 text-white border-amber-400"
                      : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                  } font-bold h-10`}
                >
                  Bottom ({deckSize})
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            size="lg"
            className="flex-1 h-14 text-lg sm:text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xl"
            onClick={handleConfirm}
            disabled={selectedCardId === null}
          >
            Bury at Position {selectedPosition}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-lg sm:text-xl bg-black/60 hover:bg-black/80 text-white border-white/30 font-bold"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-center text-white/60">
          0 = Top of deck (next card drawn) • {deckSize} = Bottom of deck (last card)
        </p>
      </div>
    </div>,
    document.body
  )
}

