"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Hand } from "lucide-react"
import type { PendingAction, Player } from "@/lib/types"
import { GAME_CONFIG } from "@/lib/types"
import { CARD_DISPLAY_NAMES } from "@/lib/game-logic"

interface NopeWindowProps {
  pendingAction: PendingAction
  players: Player[]
  currentPlayerId: string
  onPlayNope: (cardId: string) => void
}

export function NopeWindow({ pendingAction, players, currentPlayerId, onPlayNope }: NopeWindowProps) {
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.NOPE_WINDOW_MS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = pendingAction.expiresAt - Date.now()
      setTimeLeft(Math.max(0, remaining))

      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [pendingAction.expiresAt])

  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const hasNopeCard = currentPlayer?.hand.some((c) => c.type === "nope")
  const nopeCount = pendingAction.nopeChain.length
  const progress = (timeLeft / GAME_CONFIG.NOPE_WINDOW_MS) * 100
  
  // Get initiator name and card type
  const initiator = players.find((p) => p.id === pendingAction.initiatorId)
  const initiatorName = initiator?.name || "Someone"
  const cardName = pendingAction.cardType ? CARD_DISPLAY_NAMES[pendingAction.cardType] : "a card"
  
  // Get target name if applicable
  const target = pendingAction.targetId ? players.find((p) => p.id === pendingAction.targetId) : null
  const targetName = target?.name

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none">
      <div className="bg-black/80 backdrop-blur-md rounded-xl p-6 space-y-4 max-w-md w-full border-2 border-red-500/50 shadow-2xl animate-pulse-slow pointer-events-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hand className="w-6 h-6 text-red-400" />
            <h3 className="font-bold text-xl text-white">Nope Window!</h3>
          </div>
          <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">{(timeLeft / 1000).toFixed(1)}s</Badge>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="space-y-2">
          <p className="text-base text-white font-semibold">
            {initiatorName} used {cardName}!
            {targetName && ` (targeting ${targetName})`}
          </p>
          <p className="text-sm text-white/70">
            {nopeCount === 0
              ? "Anyone can play a Nope card to cancel this action"
              : `${nopeCount} Nope${nopeCount > 1 ? "s" : ""} played! Action is ${nopeCount % 2 === 1 ? "cancelled" : "active"}`}
          </p>
        </div>

        {hasNopeCard && timeLeft > 0 && (
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              const nopeCard = currentPlayer?.hand.find((c) => c.type === "nope")
              if (nopeCard && timeLeft > 0) {
                onPlayNope(nopeCard.id)
              }
            }}
          >
            Play Nope!
          </Button>
        )}

        {!hasNopeCard && <p className="text-center text-sm text-white/50 italic">You don't have a Nope card</p>}
        {timeLeft <= 0 && (
          <div className="text-center space-y-2">
            <p className="text-sm text-yellow-400 font-semibold">⏳ Resolving action...</p>
            <p className="text-xs text-white/50 italic">Waiting for server</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
