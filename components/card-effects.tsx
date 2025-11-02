"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import type { CardType } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface CardEffectProps {
  cardType: CardType
  playerName: string
  targetName?: string
  onComplete: () => void
}

export function CardEffect({ cardType, playerName, targetName, onComplete }: CardEffectProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const duration = cardType === "exploding-kitten" ? 3500 : 2500
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 500)
    }, duration)

    return () => clearTimeout(timer)
  }, [cardType, onComplete])

  if (!visible) return null

  const effects: Record<CardType, JSX.Element> = {
    "exploding-kitten": <ExplosionEffect playerName={playerName} />,
    "defuse": <DefuseEffect playerName={playerName} />,
    "nope": <NopeEffect playerName={playerName} />,
    "attack": <AttackEffect playerName={playerName} targetName={targetName} />,
    "skip": <SkipEffect playerName={playerName} />,
    "favor": <FavorEffect playerName={playerName} targetName={targetName} />,
    "shuffle": <ShuffleEffect playerName={playerName} />,
    "see-the-future": <SeeFutureEffect playerName={playerName} />,
    "cat-taco": <CatComboEffect playerName={playerName} targetName={targetName} color="orange" catName="Taco" />,
    "cat-rainbow": <CatComboEffect playerName={playerName} targetName={targetName} color="purple" catName="Rainbow" />,
    "cat-beard": <CatComboEffect playerName={playerName} targetName={targetName} color="amber" catName="Beard" />,
    "cat-melon": <CatComboEffect playerName={playerName} targetName={targetName} color="green" catName="Melon" />,
    "cat-potato": <CatComboEffect playerName={playerName} targetName={targetName} color="yellow" catName="Potato" />,
  }

  return <AnimatePresence mode="wait">{effects[cardType]}</AnimatePresence>
}

// Explosion Effect
function ExplosionEffect({ playerName }: { playerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(220,38,38,0.9) 0%, rgba(153,27,27,0.95) 50%, rgba(127,29,29,0.98) 100%)",
      }}
    >
      {/* Explosion waves */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-96 h-96 rounded-full border-8 border-orange-500"
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 4, 6],
            opacity: [1, 0.5, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Center card */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{
          scale: [0, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 0.6, ease: "backOut" }}
      >
        <Card className="p-12 space-y-6 text-center border-8 border-orange-600 bg-red-950/95 shadow-2xl backdrop-blur-md">
          <motion.div
            className="text-8xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            💣
          </motion.div>
          <div className="space-y-4">
            <motion.h2
              className="text-6xl font-black text-orange-400"
              animate={{
                textShadow: [
                  "0 0 20px rgba(251, 146, 60, 0.8)",
                  "0 0 40px rgba(251, 146, 60, 0.8)",
                  "0 0 20px rgba(251, 146, 60, 0.8)",
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              EXPLOSION!
            </motion.h2>
            <p className="text-3xl font-bold text-red-200">{playerName} drew an Exploding Kitten!</p>
          </div>
        </Card>
      </motion.div>

      {/* Flying particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-orange-500 rounded-full"
          style={{
            left: "50%",
            top: "50%",
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  )
}

// Defuse Effect
function DefuseEffect({ playerName }: { playerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(34,197,94,0.7) 0%, rgba(22,163,74,0.8) 50%, rgba(21,128,61,0.9) 100%)",
      }}
    >
      {/* Shield waves */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-96 h-96 rounded-full border-4 border-green-400"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{
            scale: [0.5, 2.5],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.3,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "backOut" }}
      >
        <Card className="p-12 space-y-6 text-center border-8 border-green-500 bg-green-950/95 shadow-2xl backdrop-blur-md">
          <motion.div
            className="text-7xl"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            🛡️
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-6xl font-black text-green-400">DEFUSED!</h2>
            <p className="text-3xl font-bold text-green-200">{playerName} survived the explosion!</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Nope Effect
function NopeEffect({ playerName }: { playerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(147,51,234,0.7) 0%, rgba(126,34,206,0.8) 50%, rgba(107,33,168,0.9) 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: "backOut" }}
      >
        <Card className="p-12 space-y-6 text-center border-8 border-purple-500 bg-purple-950/95 shadow-2xl backdrop-blur-md">
          <motion.div
            className="text-7xl"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            🚫
          </motion.div>
          <div className="space-y-4">
            <motion.h2
              className="text-6xl font-black text-purple-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              NOPE!
            </motion.h2>
            <p className="text-3xl font-bold text-purple-200">{playerName} cancelled the action!</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Attack Effect - Enhanced with slashing effects
function AttackEffect({ playerName, targetName }: { playerName: string; targetName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(239,68,68,0.7) 0%, rgba(220,38,38,0.8) 50%, rgba(185,28,28,0.9) 100%)",
      }}
    >
      {/* Slash effects */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-96 bg-gradient-to-b from-transparent via-white to-transparent"
          style={{
            left: `${20 + i * 20}%`,
            transform: `rotate(${-15 + i * 10}deg)`,
          }}
          initial={{ y: -800, opacity: 0 }}
          animate={{ y: 1000, opacity: [0, 1, 0] }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            ease: "easeIn",
          }}
        />
      ))}

      {/* Sword particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-red-400 rounded-full"
          style={{
            left: "50%",
            top: "50%",
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600,
          }}
          transition={{
            duration: 1.2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, x: -200 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "backOut" }}
      >
        <Card className="p-12 space-y-6 text-center border-8 border-red-500 bg-red-950/95 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"
            animate={{
              x: [-1000, 1000],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="text-9xl relative z-10"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -15, 15, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            ⚔️
          </motion.div>
          <div className="space-y-4 relative z-10">
            <motion.h2
              className="text-7xl font-black text-red-400"
              animate={{
                textShadow: [
                  "0 0 20px rgba(239, 68, 68, 0.8)",
                  "0 0 40px rgba(239, 68, 68, 1)",
                  "0 0 20px rgba(239, 68, 68, 0.8)",
                ],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ATTACK!
            </motion.h2>
            <p className="text-3xl font-bold text-red-200">{playerName} attacks!</p>
            {targetName && <p className="text-2xl font-semibold text-red-300 animate-pulse">{targetName} takes 2 turns!</p>}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Skip Effect - Enhanced with speed lines
function SkipEffect({ playerName }: { playerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(59,130,246,0.7) 0%, rgba(37,99,235,0.8) 50%, rgba(29,78,216,0.9) 100%)",
      }}
    >
      {/* Speed lines */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 bg-gradient-to-r from-transparent via-blue-300 to-transparent"
          style={{
            top: `${10 + i * 7}%`,
            width: `${200 + Math.random() * 400}px`,
          }}
          initial={{ x: -1000, opacity: 0 }}
          animate={{ x: 2000, opacity: [0, 1, 0] }}
          transition={{
            duration: 1,
            delay: i * 0.05,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "linear",
          }}
        />
      ))}

      <motion.div
        initial={{ x: -400, scale: 0 }}
        animate={{ x: 0, scale: 1 }}
        exit={{ x: 400, scale: 0 }}
        transition={{ duration: 0.6, ease: "backOut" }}
      >
        <Card className="p-12 space-y-6 text-center border-8 border-blue-500 bg-blue-950/95 shadow-2xl backdrop-blur-md">
          <motion.div
            className="text-9xl"
            animate={{
              x: [-20, 20, -20],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ⏭️
          </motion.div>
          <div className="space-y-4">
            <motion.h2
              className="text-7xl font-black text-blue-400"
              animate={{
                x: [-5, 5, -5],
                textShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.8)",
                  "0 0 40px rgba(59, 130, 246, 1)",
                  "0 0 20px rgba(59, 130, 246, 0.8)",
                ],
              }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              SKIP!
            </motion.h2>
            <p className="text-3xl font-bold text-blue-200">{playerName} skipped their turn!</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Favor Effect - Enhanced with floating hearts
function FavorEffect({ playerName, targetName }: { playerName: string; targetName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(236,72,153,0.7) 0%, rgba(219,39,119,0.8) 50%, rgba(190,24,93,0.9) 100%)",
      }}
    >
      {/* Floating hearts */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: -50,
          }}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{
            y: [-50, -1000],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: i * 0.15,
            ease: "easeOut",
          }}
        >
          💗
        </motion.div>
      ))}

      {/* Sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-3 h-3 bg-pink-300 rounded-full"
          style={{
            left: "50%",
            top: "50%",
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 500,
            y: (Math.random() - 0.5) * 500,
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.8,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: "backOut", type: "spring" }}
      >
        <Card className="p-12 space-y-6 text-center border-8 border-pink-500 bg-pink-950/95 shadow-2xl backdrop-blur-md">
          <motion.div
            className="text-9xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            💝
          </motion.div>
          <div className="space-y-4">
            <motion.h2
              className="text-7xl font-black text-pink-400"
              animate={{
                textShadow: [
                  "0 0 20px rgba(236, 72, 153, 0.8)",
                  "0 0 40px rgba(236, 72, 153, 1)",
                  "0 0 20px rgba(236, 72, 153, 0.8)",
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              FAVOR!
            </motion.h2>
            <p className="text-3xl font-bold text-pink-200">{playerName} asks for a favor!</p>
            {targetName && <p className="text-2xl font-semibold text-pink-300 animate-pulse">{targetName} must give a card</p>}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Shuffle Effect - Enhanced with flying cards
function ShuffleEffect({ playerName }: { playerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(234,179,8,0.7) 0%, rgba(202,138,4,0.8) 50%, rgba(161,98,7,0.9) 100%)",
      }}
    >
      {/* Flying card particles */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-12 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg shadow-xl border-2 border-yellow-200"
          style={{
            left: "50%",
            top: "50%",
          }}
          initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            scale: [0, 1, 0.5],
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 2,
            delay: i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 1, ease: "backOut" }}
      >
        <Card className="p-12 space-y-6 text-center border-8 border-yellow-500 bg-yellow-950/95 shadow-2xl backdrop-blur-md">
          <motion.div
            className="text-9xl"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            🔀
          </motion.div>
          <div className="space-y-4">
            <motion.h2
              className="text-7xl font-black text-yellow-400"
              animate={{
                textShadow: [
                  "0 0 20px rgba(234, 179, 8, 0.8)",
                  "0 0 40px rgba(234, 179, 8, 1)",
                  "0 0 20px rgba(234, 179, 8, 0.8)",
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              SHUFFLE!
            </motion.h2>
            <p className="text-3xl font-bold text-yellow-200">{playerName} shuffled the deck!</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// See Future Effect
function SeeFutureEffect({ playerName }: { playerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(6,182,212,0.7) 0%, rgba(8,145,178,0.8) 50%, rgba(21,94,117,0.9) 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
      >
        <Card className="p-12 space-y-6 text-center border-8 border-cyan-500 bg-cyan-950/95 shadow-2xl backdrop-blur-md">
          <motion.div
            className="text-7xl"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            🔮
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-6xl font-black text-cyan-400">SEE THE FUTURE!</h2>
            <p className="text-3xl font-bold text-cyan-200">{playerName} peers into the deck!</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// Cat Combo Effect - Enhanced with paw prints and sparkles
function CatComboEffect({
  playerName,
  targetName,
  color,
  catName,
}: {
  playerName: string
  targetName?: string
  color: string
  catName: string
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string; gradient: string; particle: string }> = {
    orange: {
      bg: "bg-orange-950/95",
      border: "border-orange-500",
      text: "text-orange-400",
      gradient: "radial-gradient(circle, rgba(249,115,22,0.7) 0%, rgba(234,88,12,0.8) 50%, rgba(194,65,12,0.9) 100%)",
      particle: "rgba(249,115,22,1)",
    },
    purple: {
      bg: "bg-purple-950/95",
      border: "border-purple-500",
      text: "text-purple-400",
      gradient: "radial-gradient(circle, rgba(168,85,247,0.7) 0%, rgba(147,51,234,0.8) 50%, rgba(126,34,206,0.9) 100%)",
      particle: "rgba(168,85,247,1)",
    },
    amber: {
      bg: "bg-amber-950/95",
      border: "border-amber-500",
      text: "text-amber-400",
      gradient: "radial-gradient(circle, rgba(245,158,11,0.7) 0%, rgba(217,119,6,0.8) 50%, rgba(180,83,9,0.9) 100%)",
      particle: "rgba(245,158,11,1)",
    },
    green: {
      bg: "bg-green-950/95",
      border: "border-green-500",
      text: "text-green-400",
      gradient: "radial-gradient(circle, rgba(34,197,94,0.7) 0%, rgba(22,163,74,0.8) 50%, rgba(21,128,61,0.9) 100%)",
      particle: "rgba(34,197,94,1)",
    },
    yellow: {
      bg: "bg-yellow-950/95",
      border: "border-yellow-500",
      text: "text-yellow-400",
      gradient: "radial-gradient(circle, rgba(234,179,8,0.7) 0%, rgba(202,138,4,0.8) 50%, rgba(161,98,7,0.9) 100%)",
      particle: "rgba(234,179,8,1)",
    },
  }

  const colors = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: colors.gradient }}
    >
      {/* Paw print particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-5xl opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            rotate: Math.random() * 360,
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            ease: "easeOut",
          }}
        >
          🐾
        </motion.div>
      ))}

      {/* Sparkle particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: "50%",
            top: "50%",
            backgroundColor: colors.particle,
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 700,
            y: (Math.random() - 0.5) * 700,
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: "backOut", type: "spring" }}
      >
        <Card className={`p-12 space-y-6 text-center border-8 ${colors.border} ${colors.bg} shadow-2xl backdrop-blur-md`}>
          <motion.div
            className="text-9xl"
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            🐱
          </motion.div>
          <div className="space-y-4">
            <motion.h2
              className={`text-7xl font-black ${colors.text}`}
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  `0 0 20px ${colors.particle}`,
                  `0 0 40px ${colors.particle}`,
                  `0 0 20px ${colors.particle}`,
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {catName.toUpperCase()} CAT!
            </motion.h2>
            <p className={`text-3xl font-bold ${colors.text.replace('400', '200')}`}>
              {playerName} steals from {targetName}!
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export function ExplosionAnimation({ playerName, onComplete }: { playerName: string; onComplete: () => void }) {
  return <CardEffect cardType="exploding-kitten" playerName={playerName} onComplete={onComplete} />
}
