import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CARD_DISPLAY_NAMES, CARD_DESCRIPTIONS } from "@/lib/game-logic"

export default function RulesPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">How to Play</h1>
            <p className="text-muted-foreground">Learn the rules of Exploding Kittens</p>
          </div>
        </div>

        {/* Game Overview */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-primary">Game Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            Exploding Kittens is a strategic card game where players take turns drawing cards until someone draws an
            Exploding Kitten and loses. Use action cards to avoid drawing the Exploding Kitten or force your opponents
            to draw it instead.
          </p>
        </Card>

        {/* Setup */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-secondary">Setup</h2>
          <ul className="space-y-2 text-muted-foreground leading-relaxed">
            <li>• Each player starts with 7 cards plus 1 Defuse card</li>
            <li>• Exploding Kittens are shuffled into the deck after dealing</li>
            <li>• Number of Exploding Kittens = Number of players - 1</li>
            <li>• The game begins with the first player's turn</li>
          </ul>
        </Card>

        {/* Turn Structure */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-accent">Turn Structure</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <p>On your turn, you can:</p>
            <ol className="space-y-2 ml-4">
              <li>1. Play as many action cards as you want (optional)</li>
              <li>2. Draw a card from the deck (required, unless you play Skip or Attack)</li>
            </ol>
            <p className="text-sm italic">
              If you draw an Exploding Kitten, you must play a Defuse card or you're out!
            </p>
          </div>
        </Card>

        {/* Card Types */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Card Types</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(CARD_DISPLAY_NAMES).map(([type, name]) => (
              <div key={type} className="p-4 rounded-lg border-2 space-y-2">
                <h3 className="font-bold">{name}</h3>
                <p className="text-sm text-muted-foreground">
                  {CARD_DESCRIPTIONS[type as keyof typeof CARD_DESCRIPTIONS]}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Special Rules */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-primary">Special Rules</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Cat Card Combos</h3>
              <p>Play 2 matching Cat cards to steal a random card from another player.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Nope Cards</h3>
              <p>
                Can be played at any time to cancel another player's action. Nope cards can be Noped by other players,
                creating a Nope chain!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Attack Stacking</h3>
              <p>
                If you play an Attack card, the next player takes 2 turns. They can play another Attack to pass 4 turns
                to the next player!
              </p>
            </div>
          </div>
        </Card>

        {/* Winning */}
        <Card className="p-6 space-y-4 bg-success/10 border-success">
          <h2 className="text-2xl font-bold text-success">Winning the Game</h2>
          <p className="text-muted-foreground leading-relaxed">
            The last player remaining (who hasn't exploded) wins the game!
          </p>
        </Card>

        <Button size="lg" className="w-full" asChild>
          <Link href="/lobby">Play Now</Link>
        </Button>
      </div>
    </main>
  )
}
