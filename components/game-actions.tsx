"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import type { GameState, CardType } from "@/lib/types"
import { isCatCard, CARD_DISPLAY_NAMES } from "@/lib/game-logic"

interface GameActionsProps {
  selectedCards: string[]
  gameState: GameState
  currentPlayerId: string
  onPlayCard: (cardId: string, targetId?: string) => void
  onPlayCatCombo: (targetId: string, targetCardType?: CardType) => void
  onCancel: () => void
}

export function GameActions({
  selectedCards,
  gameState,
  currentPlayerId,
  onPlayCard,
  onPlayCatCombo,
  onCancel,
}: GameActionsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentPlayer = gameState.players.find((p) => p.id === currentPlayerId)
  if (!currentPlayer) return null

  const selectedCardObjects = selectedCards.map((id) => currentPlayer.hand.find((c) => c.id === id)!).filter(Boolean)

  // Check if it's a 2-card cat combo (steal random)
  const is2CardCatCombo =
    selectedCards.length === 2 &&
    selectedCardObjects.every((c) => isCatCard(c.type)) &&
    selectedCardObjects[0].type === selectedCardObjects[1].type

  // Check if it's a 3-card cat combo (steal specific)
  const is3CardCatCombo =
    selectedCards.length === 3 &&
    selectedCardObjects.every((c) => isCatCard(c.type)) &&
    selectedCardObjects[0].type === selectedCardObjects[1].type &&
    selectedCardObjects[1].type === selectedCardObjects[2].type

  const otherAlivePlayers = gameState.players.filter((p) => p.id !== currentPlayerId && p.isAlive)

  if (!mounted) return null

  // 2-Card Cat Combo - Steal Random
  if (is2CardCatCombo) {
    return createPortal(
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom duration-200">
        <div className="bg-black/90 backdrop-blur-md rounded-xl p-4 space-y-3 max-w-md w-full border-2 border-amber-500/50 shadow-2xl">
          <h3 className="font-bold text-lg text-white text-center">Steal Random Card</h3>
          <div className="space-y-2">
            {otherAlivePlayers.map((player) => (
              <Button
                key={player.id}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onPlayCatCombo(player.id)}
                disabled={player.hand.length === 0}
              >
                {player.name}
              </Button>
            ))}
          </div>
          <Button variant="ghost" className="w-full text-white hover:bg-white/10" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>,
      document.body
    )
  }

  // 3-Card Cat Combo - Steal Specific
  if (is3CardCatCombo) {
    return createPortal(
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom duration-200">
        <div className="bg-black/90 backdrop-blur-md rounded-xl p-4 space-y-3 max-w-2xl w-full border-2 border-purple-500/50 shadow-2xl">
          <h3 className="font-bold text-lg text-white text-center">Steal Specific Card</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {otherAlivePlayers.map((player) => (
              <div key={player.id} className="space-y-2">
                <p className="font-bold text-white text-sm">{player.name}:</p>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from(new Set(player.hand.map((c) => c.type))).map((cardType) => (
                    <Button
                      key={`${player.id}-${cardType}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      onClick={() => onPlayCatCombo(player.id, cardType)}
                    >
                      {CARD_DISPLAY_NAMES[cardType]}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full text-white hover:bg-white/10" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>,
      document.body
    )
  }

  // Single card actions
  if (selectedCards.length === 1) {
    const card = selectedCardObjects[0]

    // Check if it's a cat card (can't be played alone)
    const catCards = ["cat-taco", "cat-rainbow", "cat-beard", "cat-melon", "cat-potato"]
    if (catCards.includes(card.type)) {
      // Show cancel button only for single cat cards
      return createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom duration-200">
          <div className="bg-black/90 backdrop-blur-md rounded-xl p-4 space-y-3 max-w-md w-full border-2 border-yellow-500/50 shadow-2xl">
            <p className="text-white text-center font-semibold">
              Cat cards must be played in pairs (2) or triples (3)
            </p>
            <Button variant="ghost" className="w-full text-white hover:bg-white/10" onClick={onCancel}>
              Cancel Selection
            </Button>
          </div>
        </div>,
        document.body
      )
    }

    // Cards that need a target
    if (card.type === "favor") {
      return createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom duration-200">
          <div className="bg-black/90 backdrop-blur-md rounded-xl p-4 space-y-3 max-w-md w-full border-2 border-pink-500/50 shadow-2xl">
            <h3 className="font-bold text-lg text-white text-center">Request from Player</h3>
            <div className="space-y-2">
              {otherAlivePlayers.map((player) => (
                <Button
                  key={player.id}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => onPlayCard(card.id, player.id)}
                  disabled={player.hand.length === 0}
                >
                  {player.name}
                </Button>
              ))}
            </div>
            <Button variant="ghost" className="w-full text-white hover:bg-white/10" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>,
        document.body
      )
    }

    // Defuse card (special case)
    const isDefuse = card.type === "defuse"
    return createPortal(
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex gap-3 animate-in slide-in-from-bottom duration-200">
        <Button
          size="lg"
          className={`${
            isDefuse
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white font-bold px-8 py-6 text-xl shadow-2xl`}
          onClick={() => onPlayCard(card.id)}
        >
          {isDefuse ? "DEFUSE!" : `Play Card`}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="bg-black/60 hover:bg-black/80 text-white border-white/30 font-bold px-6 py-6 text-xl shadow-2xl"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>,
      document.body
    )
  }

  return null
}
