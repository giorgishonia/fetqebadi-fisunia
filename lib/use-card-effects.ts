"use client"

import { useState, useCallback } from "react"
import type { CardType } from "./types"

export interface CardEffectData {
  cardType: CardType
  playerName: string
  targetName?: string
}

export function useCardEffects() {
  const [currentEffect, setCurrentEffect] = useState<CardEffectData | null>(null)

  const triggerEffect = useCallback((effect: CardEffectData) => {
    setCurrentEffect(effect)
  }, [])

  const clearEffect = useCallback(() => {
    setCurrentEffect(null)
  }, [])

  return {
    currentEffect,
    triggerEffect,
    clearEffect,
  }
}

