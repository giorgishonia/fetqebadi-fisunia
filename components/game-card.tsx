"use client"

import { useState } from "react"
import type { Card as GameCardType } from "@/lib/types"
import Image from "next/image"
import { CardInfoModal } from "@/components/card-info-modal"

interface GameCardProps {
  card: GameCardType
  size?: "sm" | "md" | "lg"
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  showInfo?: boolean
  keepVisible?: boolean // Keep card visible even when disabled
  isMyTurn?: boolean // Whether it's the player's turn
}

// Map card types to image filenames
const CARD_IMAGES: Record<string, string> = {
  "exploding-kitten": "/cat/exploding-kitten.png",
  defuse: "/cat/defuse.png",
  nope: "/cat/nope.png",
  attack: "/cat/attack.png",
  skip: "/cat/skip.png",
  favor: "/cat/favor.png",
  shuffle: "/cat/shuffle.png",
  "see-the-future": "/cat/see-the-future.png",
  "cat-taco": "/cat/tacocat.png",
  "cat-rainbow": "/cat/rainbow-ralphing-cat.png",
  "cat-beard": "/cat/beart-cat.png",
  "cat-melon": "/cat/cattermelon.png",
  "cat-potato": "/cat/hairy-potato-cat.png",
  reverse: "/cat/reverse.png",
  "draw-from-bottom": "/cat/draw-from-bottom.png",
  "alter-the-future": "/cat/alter-the-future.png",
  bury: "/cat/bury.png",
}

export function GameCard({
  card,
  size = "md",
  selected = false,
  onClick,
  disabled = false,
  showInfo = true,
  keepVisible = false,
  isMyTurn = true,
}: GameCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const imageSrc = CARD_IMAGES[card.type] || "/cat/backside.png"

  const sizeClasses = {
    sm: "w-20 h-28",
    md: "w-28 h-40",
    lg: "w-36 h-52",
  }

  const isSpecialCard = ["exploding-kitten", "defuse", "nope"].includes(card.type)

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (showInfo) {
      setIsInfoOpen(true)
    }
  }

  return (
    <div className="group relative">
      <div
        onClick={onClick && !disabled ? onClick : undefined}
        onContextMenu={handleRightClick}
        className={`
          ${sizeClasses[size]} 
          rounded-xl
          transition-all duration-300 ease-out
          ${selected ? "ring-4 ring-yellow-400 scale-110 -translate-y-2 shadow-2xl z-10" : ""} 
          ${onClick && !disabled ? "hover:scale-110 hover:-translate-y-2 hover:shadow-xl cursor-pointer" : ""} 
          ${disabled && !keepVisible ? "opacity-50 cursor-not-allowed grayscale" : ""} 
          ${disabled && keepVisible ? "cursor-not-allowed opacity-80" : ""} 
          ${isSpecialCard && !disabled ? "animate-pulse-glow" : ""}
          relative overflow-hidden
          p-0
        `}
      >
        {/* Shine effect */}
        {!disabled && onClick && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-30 transition-opacity duration-500 -translate-x-full hover:translate-x-full z-10 rounded-xl" />
        )}

        {/* Card Image */}
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={card.type}
            fill
            className={`
              object-cover rounded-xl
              ${selected ? "animate-pulse" : ""}
              ${!isMyTurn ? "grayscale brightness-75" : ""}
            `}
            sizes={size === "sm" ? "80px" : size === "md" ? "112px" : "144px"}
            priority={isSpecialCard}
          />
        </div>

        {/* Glow effect for special cards */}
        {isSpecialCard && !disabled && (
          <div className="absolute inset-0 bg-gradient-radial from-yellow-400/20 via-transparent to-transparent rounded-xl pointer-events-none animate-pulse-slow" />
        )}
      </div>

      {/* Info Modal - triggered by right-click */}
      {showInfo && <CardInfoModal card={card} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />}
    </div>
  )
}
