import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Clock, Globe, Play, Plus } from "lucide-react"

export default function HomePage() {
  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/cat/background.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl w-full space-y-8 sm:space-y-12 text-center">
          {/* Hero Section */}
          <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                  Exploding
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  Kittens
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-white/90 max-w-2xl mx-auto px-4">
                Strategic multiplayer card game. Draw cards, avoid explosions, eliminate opponents.
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-150">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-md border-2 border-white/30 shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
              <div className="relative p-6 sm:p-8 space-y-4">
                <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">Quick Play</h2>
                <p className="text-sm sm:text-base text-white/90">
                  Join existing games or matchmake with players
                </p>
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                  asChild
                >
                  <Link href="/lobby">Find Game</Link>
                </Button>
              </div>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-600/90 to-cyan-600/90 backdrop-blur-md border-2 border-white/30 shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
              <div className="relative p-6 sm:p-8 space-y-4">
                <Plus className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">Private Room</h2>
                <p className="text-sm sm:text-base text-white/90">
                  Create room and invite friends to play
                </p>
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold bg-white text-blue-600 hover:bg-white/90 shadow-lg"
                  asChild
                >
                  <Link href="/lobby?create=true">Create Room</Link>
                </Button>
              </div>
            </Card>
          </div>

          {/* Game Info */}
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <Card className="p-4 sm:p-6 lg:p-8 bg-black/70 backdrop-blur-xl border-2 border-white/20 shadow-2xl max-w-3xl mx-auto">
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                  <div className="text-left">
                    <p className="text-white/60 text-xs sm:text-sm">Players</p>
                    <span className="text-white text-lg sm:text-xl font-bold">2-5</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                  <div className="text-left">
                    <p className="text-white/60 text-xs sm:text-sm">Duration</p>
                    <span className="text-white text-lg sm:text-xl font-bold">5-15 min</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                  <div className="text-left">
                    <p className="text-white/60 text-xs sm:text-sm">Mode</p>
                    <span className="text-white text-lg sm:text-xl font-bold">Real-time</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* How to Play Link */}
          <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-450">
            <Button
              className="h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-2xl"
              asChild
            >
              <Link href="/rules">How to Play</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
