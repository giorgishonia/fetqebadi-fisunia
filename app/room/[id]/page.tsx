"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Check, Crown, Users, Wifi, WifiOff } from "lucide-react"
import type { GameRoom } from "@/lib/types"
import { useWebSocket } from "@/lib/use-websocket"

export default function RoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string

  const { connected, room, gameState, error, joinRoom, leaveRoom, toggleReady, startGame } = useWebSocket(roomId)

  const [currentPlayerId, setCurrentPlayerId] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    const playerName = localStorage.getItem("playerName")

    if (!playerName) {
      router.push("/lobby")
      return
    }

    if (connected && !hasJoined) {
      joinRoom(playerName)
      setHasJoined(true)
    }
  }, [connected, hasJoined, joinRoom, router])

  useEffect(() => {
    if (room && room.players.length > 0) {
      const playerName = localStorage.getItem("playerName")
      const player = room.players.find((p) => p.name === playerName)
      if (player) {
        setCurrentPlayerId(player.id)
      }
    }
  }, [room])

  useEffect(() => {
    if (gameState) {
      router.push(`/game/${roomId}`)
    }
  }, [gameState, roomId, router])

  const handleToggleReady = () => {
    if (!currentPlayerId) return
    toggleReady(currentPlayerId)
  }

  const handleStartGame = () => {
    startGame()
  }

  const handleCopyRoomCode = () => {
    const url = `${window.location.origin}/room/${roomId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveRoom = () => {
    if (!currentPlayerId) return
    leaveRoom(currentPlayerId)
    router.push("/lobby")
  }

  if (!connected) {
    return (
      <main className="fixed inset-0 flex items-center justify-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/cat/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 text-center space-y-6 bg-black/40 backdrop-blur-md p-12 rounded-3xl border-4 border-white/20">
          <WifiOff className="w-16 h-16 mx-auto text-white animate-pulse" />
          <p className="text-2xl font-bold text-white">Connecting to server...</p>
        </div>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="fixed inset-0 flex items-center justify-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/cat/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 text-center space-y-6 bg-black/40 backdrop-blur-md p-12 rounded-3xl border-4 border-white/20">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
          <p className="text-2xl font-bold text-white">Loading room...</p>
        </div>
      </main>
    )
  }

  const currentPlayer = room.players.find((p) => p.id === currentPlayerId)
  const isHost = currentPlayer?.isHost || false
  const allReady = room.players.every((p) => p.isReady || p.isHost)

  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/cat/background.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-purple-900/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLeaveRoom}
                className="bg-white/10 hover:bg-white/20 border-2 border-red-400/50 backdrop-blur-md"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </Button>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-white/30">
                <h1 className="text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Game Room
                </h1>
                <p className="text-white/80 font-semibold text-lg">Waiting for players to get ready...</p>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-4 border-2 border-green-400/50">
              <Wifi className="w-6 h-6 text-green-400" />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="p-6 bg-red-900/90 border-4 border-red-500 backdrop-blur-md">
              <p className="text-red-100 font-bold text-xl">{error}</p>
            </Card>
          )}

          {/* Room Info */}
          <Card className="p-8 space-y-6 border-4 border-blue-500/50 bg-gradient-to-br from-blue-900/70 to-purple-900/70 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-4 rounded-2xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="font-black text-4xl text-white">
                    {room.players.length}/{room.maxPlayers} Players
                  </p>
                  <p className="text-lg font-semibold text-white/70">
                    {room.isPublic ? "🌍 Public Room" : "🔒 Private Room"}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyRoomCode}
                className="gap-3 bg-white/10 border-2 border-purple-400/50 hover:bg-purple-600 h-16 px-8 font-bold text-lg text-white"
              >
                {copied ? (
                  <>
                    <Check className="w-6 h-6" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-6 h-6" />
                    Share Link
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Players List */}
          <Card className="p-8 border-4 border-pink-500/50 bg-black/70 backdrop-blur-md shadow-2xl">
            <h2 className="text-4xl font-bold mb-8 text-white">Players in Room</h2>
            <div className="space-y-4">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-pink-900/60 to-purple-900/60 border-2 border-purple-400/30 hover:border-purple-400/60 transition-all backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl border-4 shadow-xl ${
                        player.id === currentPlayerId
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-500 text-white"
                          : "bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 text-white"
                      }`}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-2xl text-white">{player.name}</p>
                        {player.isHost && (
                          <Badge className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-lg px-3 py-1">
                            <Crown className="w-4 h-4" />
                            Host
                          </Badge>
                        )}
                        {player.id === currentPlayerId && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-lg px-3 py-1">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {player.isReady || player.isHost ? (
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white h-12 px-6 text-lg font-bold">
                        ✓ Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-2 border-gray-400 h-12 px-6 text-lg font-bold">
                        ⏳ Not Ready
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            {isHost ? (
              <Button
                size="lg"
                className="w-full h-20 text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-2xl"
                onClick={handleStartGame}
                disabled={!allReady || room.players.length < 2}
              >
                🚀 Start Game!
              </Button>
            ) : (
              <Button
                size="lg"
                className={`w-full h-20 text-3xl font-bold shadow-2xl ${
                  currentPlayer?.isReady
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                }`}
                onClick={handleToggleReady}
              >
                {currentPlayer?.isReady ? "❌ Not Ready" : "✅ Ready"}
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full h-16 bg-white/10 hover:bg-red-900/50 border-2 border-red-400/50 text-red-400 hover:text-red-300 font-bold text-xl"
              onClick={handleLeaveRoom}
            >
              Leave Room
            </Button>
          </div>

          {/* Game Info */}
          {isHost && (
            <Card className="p-8 bg-gradient-to-r from-yellow-900/70 to-orange-900/70 border-4 border-yellow-500/50 backdrop-blur-md shadow-2xl">
              <p className="text-center font-bold text-white text-2xl">
                {!allReady
                  ? "⏳ Waiting for all players to be ready..."
                  : room.players.length < 2
                    ? "👥 Need at least 2 players to start"
                    : "✨ All players ready! Click Start Game to begin!"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
