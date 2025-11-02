"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bomb } from "lucide-react"

interface InsertKittenDialogProps {
  drawPileSize: number
  onInsert: (position: number) => void
}

export function InsertKittenDialog({ drawPileSize, onInsert }: InsertKittenDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState(drawPileSize) // Default to bottom

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInsert = () => {
    const validPosition = Math.max(0, Math.min(position, drawPileSize))
    onInsert(validPosition)
  }

  const getPositionLabel = (pos: number) => {
    if (pos === 0) return "Top"
    if (pos === 1) return "Second"
    if (pos === drawPileSize) return "Bottom"
    if (pos === Math.floor(drawPileSize / 2)) return "Middle"
    return `Position ${pos}`
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-red-900/95 to-orange-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-md w-full border-2 border-red-500 shadow-2xl animate-in zoom-in-90 duration-300">
        <div className="flex items-center gap-3 justify-center">
          <Bomb className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 animate-pulse" />
          <h3 className="font-black text-xl sm:text-2xl text-white">Insert Exploding Kitten</h3>
        </div>

        <p className="text-sm sm:text-base text-white/90 text-center">
          Choose where to place the exploding kitten back in the deck
        </p>

        <div className="space-y-4">
          {/* Position slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="position" className="text-white text-sm sm:text-base font-bold">
                Position: {getPositionLabel(position)}
              </Label>
              <span className="text-white/80 text-xs sm:text-sm font-mono">
                {position} / {drawPileSize}
              </span>
            </div>
            <input
              type="range"
              id="position"
              min={0}
              max={drawPileSize}
              value={position}
              onChange={(e) => setPosition(parseInt(e.target.value))}
              className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>Top (0)</span>
              <span>Bottom ({drawPileSize})</span>
            </div>
          </div>

          {/* Or manual input */}
          <div className="space-y-2">
            <Label htmlFor="position-input" className="text-white text-sm font-semibold">
              Or enter exact position:
            </Label>
            <Input
              id="position-input"
              type="number"
              min={0}
              max={drawPileSize}
              value={position}
              onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
              className="bg-white/10 border-white/30 text-white text-center font-mono text-lg h-12"
            />
          </div>

          {/* Quick position buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPosition(0)}
              className={`${
                position === 0
                  ? "bg-red-600 text-white border-red-400"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20"
              } font-bold h-10`}
            >
              Top (0)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPosition(Math.floor(drawPileSize / 2))}
              className={`${
                position === Math.floor(drawPileSize / 2)
                  ? "bg-red-600 text-white border-red-400"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20"
              } font-bold h-10`}
            >
              Middle ({Math.floor(drawPileSize / 2)})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPosition(1)}
              className={`${
                position === 1
                  ? "bg-red-600 text-white border-red-400"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20"
              } font-bold h-10`}
            >
              Second (1)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPosition(drawPileSize)}
              className={`${
                position === drawPileSize
                  ? "bg-red-600 text-white border-red-400"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20"
              } font-bold h-10`}
            >
              Bottom ({drawPileSize})
            </Button>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-14 text-lg sm:text-xl font-black bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-xl"
          onClick={handleInsert}
        >
          Insert at Position {position}
        </Button>

        <p className="text-xs text-center text-white/60">
          0 = Top of deck (next card drawn) • {drawPileSize} = Bottom of deck (last card)
        </p>
      </div>
    </div>,
    document.body
  )
}


