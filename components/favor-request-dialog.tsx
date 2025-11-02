"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { GameCard } from "@/components/game-card"
import { Gift } from "lucide-react"
import type { Player } from "@/lib/types"

interface FavorRequestDialogProps {
  initiator: Player | undefined
  targetPlayer: Player | undefined
  currentPlayerId: string
  onSelectCard: (cardId: string) => void
}

export function FavorRequestDialog({
  initiator,
  targetPlayer,
  currentPlayerId,
  onSelectCard,
}: FavorRequestDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle missing players gracefully
  if (!initiator || !targetPlayer) {
    if (!mounted) return null
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md rounded-xl p-6 space-y-4 max-w-md w-full border-2 border-pink-500/50 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 justify-center">
            <Gift className="w-6 h-6 text-pink-400" />
            <h3 className="font-bold text-xl text-white">Favor Request</h3>
          </div>
          <p className="text-sm text-white/70 text-center">
            Waiting for favor request...
          </p>
        </div>
      </div>,
      document.body
    )
  }

  const isTarget = targetPlayer.id === currentPlayerId

  if (!isTarget) {
    if (!mounted) return null
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md rounded-xl p-6 space-y-4 max-w-md w-full border-2 border-pink-500/50 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2 justify-center">
            <Gift className="w-6 h-6 text-pink-400" />
            <h3 className="font-bold text-xl text-white">Favor Request</h3>
          </div>
          <p className="text-sm text-white/70 text-center">
            {initiator.name} is requesting a card from {targetPlayer.name}...
          </p>
        </div>
      </div>,
      document.body
    )
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none">
      <div className="bg-black/80 backdrop-blur-md rounded-xl p-6 space-y-4 max-w-2xl w-full border-2 border-pink-500/50 shadow-2xl animate-pulse-slow pointer-events-auto">
        <div className="flex items-center gap-2 justify-center">
          <Gift className="w-6 h-6 text-pink-400" />
          <h3 className="font-bold text-xl text-white">Choose a Card to Give</h3>
        </div>

        <p className="text-sm text-white/70 text-center">
          {initiator.name} has requested a card from you. Choose which card to give them.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {targetPlayer.hand.map((card) => (
            <GameCard key={card.id} card={card} size="md" onClick={() => onSelectCard(card.id)} showInfo={false} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
