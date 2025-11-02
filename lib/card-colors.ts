import type { CardType } from "./types"

// Card color schemes for visual distinction
export const CARD_COLORS: Record<CardType, { bg: string; border: string; text: string }> = {
  "exploding-kitten": {
    bg: "bg-destructive",
    border: "border-destructive",
    text: "text-destructive-foreground",
  },
  defuse: {
    bg: "bg-success",
    border: "border-success",
    text: "text-success-foreground",
  },
  nope: {
    bg: "bg-accent",
    border: "border-accent",
    text: "text-accent-foreground",
  },
  attack: {
    bg: "bg-primary",
    border: "border-primary",
    text: "text-primary-foreground",
  },
  skip: {
    bg: "bg-secondary",
    border: "border-secondary",
    text: "text-secondary-foreground",
  },
  favor: {
    bg: "bg-chart-5",
    border: "border-chart-5",
    text: "text-foreground",
  },
  shuffle: {
    bg: "bg-chart-2",
    border: "border-chart-2",
    text: "text-foreground",
  },
  "see-the-future": {
    bg: "bg-chart-3",
    border: "border-chart-3",
    text: "text-foreground",
  },
  "cat-taco": {
    bg: "bg-chart-4",
    border: "border-chart-4",
    text: "text-foreground",
  },
  "cat-rainbow": {
    bg: "bg-chart-1",
    border: "border-chart-1",
    text: "text-foreground",
  },
  "cat-beard": {
    bg: "bg-chart-5",
    border: "border-chart-5",
    text: "text-foreground",
  },
  "cat-melon": {
    bg: "bg-chart-2",
    border: "border-chart-2",
    text: "text-foreground",
  },
  "cat-potato": {
    bg: "bg-chart-3",
    border: "border-chart-3",
    text: "text-foreground",
  },
  reverse: {
    bg: "bg-purple-600",
    border: "border-purple-600",
    text: "text-white",
  },
  "draw-from-bottom": {
    bg: "bg-teal-600",
    border: "border-teal-600",
    text: "text-white",
  },
  "alter-the-future": {
    bg: "bg-violet-600",
    border: "border-violet-600",
    text: "text-white",
  },
  bury: {
    bg: "bg-amber-700",
    border: "border-amber-700",
    text: "text-white",
  },
}
