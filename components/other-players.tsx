"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Player } from "@/lib/types"

interface OtherPlayersProps {
  players: Player[]
  currentPlayerId: string
  turnPlayerId: string
}

export function OtherPlayers({ players, turnPlayerId }: OtherPlayersProps) {
  if (players.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {players.map((player) => {
        const isCurrentTurn = player.id === turnPlayerId
        const isAlive = player.isAlive

        return (
          <Card
            key={player.id}
            className={`p-3 space-y-2 transition-all backdrop-blur-md border-2 ${
              isCurrentTurn
                ? "bg-yellow-900/80 border-yellow-500 shadow-xl shadow-yellow-500/50"
                : isAlive
                  ? "bg-black/60 border-white/30"
                  : "bg-red-900/40 border-red-500/50 opacity-50 grayscale"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border-2 shadow-md ${
                    isCurrentTurn
                      ? "bg-yellow-500 border-yellow-600 text-white animate-pulse"
                      : isAlive
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 text-white"
                        : "bg-gray-600 border-gray-700 text-gray-300"
                  }`}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`font-bold text-sm ${isAlive ? "text-white" : "text-gray-400"}`}>{player.name}</p>
                  {isCurrentTurn && (
                    <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0">Turn</Badge>
                  )}
                  {!isAlive && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Out</Badge>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className={`text-xl font-black ${isAlive ? "text-white" : "text-gray-500"}`}>
                  {player.hand.length}
                </p>
                <p className="text-[10px] text-white/60 font-semibold">Cards</p>
              </div>
              {player.turnsRemaining > 1 && (
                <Badge variant="secondary" className="text-xs font-bold">
                  {player.turnsRemaining}x
                </Badge>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
