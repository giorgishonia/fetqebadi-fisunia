"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Lock, Globe, Wifi, WifiOff, RefreshCw } from "lucide-react"
import Link from "next/link"
import type { GameRoom } from "@/lib/types"
import { getWebSocketClient } from "@/lib/websocket-client"
import { generateId } from "@/lib/game-logic"

export default function LobbyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shouldCreate = searchParams.get("create") === "true"

  const [playerName, setPlayerName] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(shouldCreate)
  const [isPrivate, setIsPrivate] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([])
  const [connected, setConnected] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const savedName = localStorage.getItem("playerName")
    if (savedName) {
      setPlayerName(savedName)
    }

    const ws = getWebSocketClient()

    ws.connect()
      .then(() => {
        console.log("[v0] Connected to WebSocket")
        setConnected(true)
        ws.getRooms()
      })
      .catch((err) => {
        console.error("[v0] WebSocket connection failed:", err)
      })

    ws.on("rooms-list", (rooms: GameRoom[]) => {
      console.log("[v0] Received rooms list:", rooms)
      setAvailableRooms(rooms)
      setRefreshing(false)
    })

    return () => {
      ws.off("rooms-list")
    }
  }, [])

  const loadAvailableRooms = () => {
    setRefreshing(true)
    const ws = getWebSocketClient()
    ws.getRooms()
  }

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name")
      return
    }

    if (!connected) {
      alert("Not connected to server. Please wait...")
      return
    }

    localStorage.setItem("playerName", playerName)
    const roomId = generateId()
    router.push(`/room/${roomId}`)
  }

  const handleJoinRoom = (roomId: string) => {
    if (!playerName.trim()) {
      alert("Please enter your name")
      return
    }

    localStorage.setItem("playerName", playerName)
    router.push(`/room/${roomId}`)
  }

  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/cat/background.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="bg-white/10 hover:bg-white/20 border-2 border-white/30 backdrop-blur-md flex-shrink-0"
              >
                <Link href="/">
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </Link>
              </Button>
              <div className="bg-black/60 backdrop-blur-xl rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20 flex-1 sm:flex-initial">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Game Lobby
                </h1>
                <p className="text-white/70 font-medium text-sm sm:text-base hidden sm:block">Join or create a room</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-xl rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/20">
              {connected ? (
                <>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span className="text-sm sm:text-base font-bold text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 animate-pulse" />
                  <span className="text-sm sm:text-base font-bold text-gray-400">Connecting...</span>
                </>
              )}
            </div>
          </div>

          {/* Player Name Input */}
          <Card className="p-4 sm:p-6 border-2 border-purple-500/30 bg-black/70 backdrop-blur-xl shadow-xl">
            <div className="space-y-3">
              <Label htmlFor="playerName" className="text-base sm:text-lg font-bold text-white">
                Player Name
              </Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="text-base sm:text-lg border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 h-12 sm:h-14 backdrop-blur-sm focus:bg-white/10 focus:border-purple-400"
              />
            </div>
          </Card>

          {/* Create Room Section */}
          {showCreateForm ? (
            <Card className="p-4 sm:p-6 border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl shadow-xl">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Create New Room</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    variant={isPrivate ? "outline" : "default"}
                    className={`h-14 sm:h-16 text-base sm:text-lg font-bold ${
                      !isPrivate
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-white/5 border-2 border-white/20 text-white hover:bg-white/10"
                    }`}
                    onClick={() => setIsPrivate(false)}
                  >
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    Public
                  </Button>
                  <Button
                    variant={isPrivate ? "default" : "outline"}
                    className={`h-14 sm:h-16 text-base sm:text-lg font-bold ${
                      isPrivate
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : "bg-white/5 border-2 border-white/20 text-white hover:bg-white/10"
                    }`}
                    onClick={() => setIsPrivate(true)}
                  >
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    Private
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim()}
                >
                  Create Room
                </Button>
              </div>
            </Card>
          ) : (
            <Button
              size="lg"
              className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 shadow-xl"
              onClick={() => setShowCreateForm(true)}
            >
              Create New Room
            </Button>
          )}

          {/* Available Rooms */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between bg-black/60 backdrop-blur-xl rounded-xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Available Rooms</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadAvailableRooms}
                disabled={!connected || refreshing}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-9 sm:h-10 px-3 sm:px-4 text-sm sm:text-base font-bold"
              >
                <RefreshCw className={`w-4 h-4 mr-1 sm:mr-2 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>

            {availableRooms.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center border-2 border-white/10 bg-black/70 backdrop-blur-xl">
                <p className="text-white/70 font-medium text-base sm:text-lg">No rooms available</p>
                <p className="text-white/50 mt-2 text-sm sm:text-base">Create a room to start playing</p>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {availableRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="p-4 sm:p-5 space-y-3 sm:space-y-4 hover:scale-[1.02] transition-all border-2 border-blue-500/30 bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-2 flex-1 min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-white truncate">
                          {room.players.find((p) => p.isHost)?.name}'s Room
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {room.isPublic ? (
                            <Badge className="bg-green-600/90 text-xs sm:text-sm">
                              <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border border-purple-400/50 text-xs sm:text-sm">
                              <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Private
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs sm:text-sm font-bold">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {room.players.length}/{room.maxPlayers}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {room.players.map((player) => (
                        <Badge key={player.id} className="bg-purple-600/90 text-white text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
                          {player.name}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      className="w-full h-11 sm:h-12 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={
                        !playerName.trim() || room.players.length >= room.maxPlayers || room.status !== "waiting"
                      }
                    >
                      Join Room
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
