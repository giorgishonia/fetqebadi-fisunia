"use client"

import { Card as UICard } from "@/components/ui/card"
import { GameCard } from "@/components/game-card"
import type { Card, TurnPhase } from "@/lib/types"

interface PlayerHandProps {
  cards: Card[]
  selectedCards: string[]
  onCardClick: (cardId: string) => void
  onPlayCard: (cardId: string, targetId?: string) => void
  isMyTurn: boolean
  turnPhase: TurnPhase
}

export function PlayerHand({ cards, selectedCards, onCardClick, isMyTurn, turnPhase }: PlayerHandProps) {
  const canPlayCards = isMyTurn && turnPhase === "playing-cards"
  const mustPlayDefuse = isMyTurn && turnPhase === "exploded"

  const sortedCards = [...cards].reverse()

  // Advanced fan layout with adaptive spacing
  const totalCards = sortedCards.length
  const maxRotation = totalCards <= 7 ? 15 : totalCards <= 12 ? 20 : 25 // More dramatic fan for many cards
  
  // Ultra-responsive card spacing - optimized for up to 20+ cards
  let cardSpacing: number
  let cardSize: "sm" | "md" | "lg"
  
  if (totalCards <= 5) {
    cardSpacing = 85
    cardSize = "lg" // Larger cards for few cards
  } else if (totalCards <= 8) {
    cardSpacing = 70
    cardSize = "lg"
  } else if (totalCards <= 12) {
    cardSpacing = 55
    cardSize = "md"
  } else if (totalCards <= 16) {
    cardSpacing = 42
    cardSize = "md"
  } else {
    // 17-20+ cards: ultra-compact
    cardSpacing = Math.max(32, 600 / totalCards)
    cardSize = "md"
  }

  // Enhanced visual calculations
  const containerWidth = totalCards * cardSpacing + (cardSize === "lg" ? 180 : 140)
  const containerHeight = cardSize === "lg" ? 100 : 240

  return (
    <div className="relative">
      {/* Elegant background panel with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-xl rounded-3xl border-2 border-white/20 shadow-2xl" />
      
      <UICard className="relative p-6 bg-transparent border-0 shadow-none">
        {/* Header with glow effect */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <h3 className="font-black text-2xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              Your Hand
            </h3>
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full" />
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xl px-5 py-2 rounded-full shadow-lg border-2 border-white/30">
            {cards.length} {cards.length === 1 ? "CARD" : "CARDS"}
          </div>
        </div>


        {/* Main card display area with enhanced spacing */}
        <div className="relative flex items-end justify-center py-6 pb-8" style={{ minHeight: `${containerHeight}px` }}>
          {sortedCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-48 gap-4">
              <div className="text-6xl opacity-20">🃏</div>
              <p className="text-white/40 text-2xl font-bold">No cards in hand</p>
            </div>
          ) : (
            <div className="relative" style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}>
              {sortedCards.map((card, index) => {
                // Enhanced rotation with smoother curve
                const normalizedPosition = (index - (totalCards - 1) / 2) / Math.max(totalCards - 1, 1)
                const rotation = normalizedPosition * maxRotation
                
                // Curved arc effect - cards in center are lower
                const arcHeight = Math.pow(Math.abs(normalizedPosition), 1.5) * 25
                const translateY = arcHeight
                
                // Selected cards pop up more
                const selectedLift = selectedCards.includes(card.id) ? -40 : 0
                
                // "Moses splits sea" effect - shift cards away from selected cards
                let mosesSplitOffset = 0
                if (selectedCards.length > 0 && !selectedCards.includes(card.id)) {
                  // Find indices of all selected cards
                  const selectedIndices = sortedCards
                    .map((c, i) => selectedCards.includes(c.id) ? i : -1)
                    .filter(i => i !== -1)
                  
                  // Calculate offset based on position relative to selected cards
                  const minSelectedIndex = Math.min(...selectedIndices)
                  const maxSelectedIndex = Math.max(...selectedIndices)
                  
                  const splitAmount = 30 // pixels to shift
                  
                  if (index < minSelectedIndex) {
                    // Card is to the left of selected group - shift left
                    const distance = minSelectedIndex - index
                    const proximity = 1 / distance // Closer cards shift more
                    mosesSplitOffset = -splitAmount * Math.min(proximity * 2, 1)
                  } else if (index > maxSelectedIndex) {
                    // Card is to the right of selected group - shift right
                    const distance = index - maxSelectedIndex
                    const proximity = 1 / distance // Closer cards shift more
                    mosesSplitOffset = splitAmount * Math.min(proximity * 2, 1)
                  }
                }
                
                const zIndex = selectedCards.includes(card.id) ? 100 : totalCards - Math.abs(index - (totalCards - 1) / 2)

                const isDefuseCard = card.type === "defuse"
                const isCardDisabled = mustPlayDefuse 
                  ? card.type !== "defuse" 
                  : !canPlayCards || (isDefuseCard && !mustPlayDefuse)

                return (
                  <div
                    key={card.id}
                    className="absolute bottom-0 transition-all duration-300 ease-out"
                    style={{
                      left: `${index * cardSpacing + mosesSplitOffset}px`,
                      transform: `rotate(${rotation}deg) translateY(${translateY + selectedLift}px) ${selectedCards.includes(card.id) ? 'scale(1.1)' : 'scale(1)'}`,
                      transformOrigin: 'bottom center',
                      zIndex,
                    }}
                  >
                    {/* Glow effect for selected cards */}
                    {selectedCards.includes(card.id) && (
                      <div className="absolute inset-0 -m-2 bg-gradient-to-t from-yellow-400/40 via-yellow-300/30 to-transparent blur-xl rounded-2xl animate-pulse" />
                    )}
                    
                    <GameCard
                      card={card}
                      size={cardSize}
                      selected={selectedCards.includes(card.id)}
                      onClick={() => {
                        if (mustPlayDefuse) {
                          if (card.type === "defuse") {
                            onCardClick(card.id)
                          }
                        } else if (canPlayCards && !isDefuseCard) {
                          onCardClick(card.id)
                        }
                      }}
                      disabled={isCardDisabled}
                      showInfo={true}
                      keepVisible={true}
                      isMyTurn={isMyTurn}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Enhanced selection info */}
        {selectedCards.length > 0 && (
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 blur-lg opacity-50 animate-pulse" />
            <div className="relative text-center text-base text-white font-black bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 backdrop-blur-md rounded-2xl p-3 border-2 border-white/30 shadow-xl">
              {selectedCards.length === 1 && "✨ Play card or select more matching cats"}
              {selectedCards.length === 2 && "🎲 2 CATS: Steal random card from opponent"}
              {selectedCards.length === 3 && "🎯 3 CATS: Steal specific card from opponent"}
            </div>
          </div>
        )}
      </UICard>
    </div>
  )
}
