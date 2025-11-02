# 🎨 Special Effects Guide

Your Exploding Kittens game now has **amazing visual effects** for every card action! Each card type has its own unique animation, particles, colors, and style.

## 🎬 Card Effects Overview

### 💣 Exploding Kitten
**Effect**: Massive explosion with bomb particles
- **Animation**: Zoom in with ping effect
- **Colors**: Red/Orange explosion theme
- **Particles**: 12 bomb icons bursting outward
- **Duration**: 3 seconds
- **Special**: Screen shakes, multiple explosion rings
- **Message**: "💥 BOOM! 💥 [Player] exploded!"

### 🛡️ Defuse
**Effect**: Protective shield with green glow
- **Animation**: Pulse effect
- **Colors**: Green safety theme
- **Particles**: 8 shield icons radiating
- **Duration**: 2 seconds
- **Special**: Calm, protective aura
- **Message**: "🛡️ DEFUSED! 🛡️ [Player] survived!"

### 🚫 Nope
**Effect**: Purple stop-hand particles
- **Animation**: Bounce with rotation
- **Colors**: Purple cancellation theme
- **Particles**: 10 hand icons
- **Duration**: 2 seconds
- **Special**: Card rotates 12 degrees
- **Message**: "🚫 NOPE! 🚫 [Player] says NOPE!"

### ⚔️ Attack
**Effect**: Red sword slashes
- **Animation**: Shake effect
- **Colors**: Red aggressive theme
- **Particles**: 8 sword icons
- **Duration**: 2 seconds
- **Special**: Screen shakes
- **Message**: "⚔️ ATTACK! ⚔️ [Player] attacks! [Target] must draw 2 cards!"

### ⏭️ Skip
**Effect**: Blue forward-moving particles
- **Animation**: Slide in from left
- **Colors**: Blue flow theme
- **Particles**: 6 forward arrows
- **Duration**: 2 seconds
- **Special**: Smooth sliding motion
- **Message**: "⏭️ SKIP! ⏭️ [Player] skips their turn!"

### 🎁 Favor
**Effect**: Pink hearts and gift particles
- **Animation**: Zoom with pulse
- **Colors**: Pink/friendly theme
- **Particles**: 8 heart icons
- **Duration**: 2 seconds
- **Special**: Warm, friendly feel
- **Message**: "🎁 FAVOR! 🎁 [Player] asks for a favor!"

### 🔀 Shuffle
**Effect**: Yellow sparkles spinning
- **Animation**: 720-degree spin
- **Colors**: Yellow/gold theme
- **Particles**: 12 sparkle icons
- **Duration**: 2 seconds
- **Special**: Card spins dramatically
- **Message**: "🔀 SHUFFLE! 🔀 [Player] shuffles the deck!"

### 🔮 See the Future
**Effect**: Cyan mystical eye particles
- **Animation**: Pulse with glow
- **Colors**: Cyan/mystic theme
- **Particles**: 8 eye icons
- **Duration**: 2 seconds
- **Special**: Mysterious aura
- **Message**: "🔮 SEE THE FUTURE! 🔮 [Player] peers into the deck!"

### 😺 Cat Combos
**Effect**: Colorful cat-themed bursts
- **Animation**: Zoom with star particles
- **Colors**: Varies by cat type
- **Particles**: 8 star icons
- **Duration**: 2 seconds
- **Special**: Each cat has unique color

**Cat Types:**
- 🌮 **Taco Cat** - Orange theme
- 🌈 **Rainbow Cat** - Purple theme
- 🧔 **Beard Cat** - Yellow theme
- 🍉 **Melon Cat** - Green theme
- 🥔 **Potato Cat** - Amber theme

## 🎯 Card Hover Effects

### Enhanced Interactivity

All playable cards now have:
- ✨ **Hover lift**: Cards rise 8px when you hover
- 🔄 **Smooth scale**: Cards grow 110% on hover
- 💫 **Shine effect**: Light sweeps across the card
- 🎭 **Selected state**: Selected cards bounce and glow
- 🎪 **Special cards wiggle**: Exploding Kitten, Defuse, and Nope cards wiggle constantly

### Visual Feedback

```
Normal State → Hover → Selected
    ↓           ↓         ↓
  Still     Lifted    Bouncing
            Scaled    Glowing
            Shadow    Ring
```

## 🌊 Animation Classes

### Built-in Animations

```css
.animate-shake       /* Quick shake side-to-side */
.animate-wiggle      /* Gentle rotation wiggle */
.animate-glow        /* Pulsing glow effect */
.animate-float       /* Up and down floating */
.animate-spin-in     /* Dramatic 720° entrance */
.animate-pulse-slow  /* Slow opacity pulse */
```

### Particle System

Each effect spawns 6-12 particles that:
1. Start at center
2. Burst outward in a circle
3. Fade as they move
4. Disappear after 1 second

## 🎮 How It Works

### Automatic Detection

The game automatically detects:
1. **Card plays**: When a card is added to discard pile
2. **Explosions**: When a player draws Exploding Kitten
3. **Defuse usage**: When entering "inserting-kitten" phase
4. **Target actions**: Favor and Attack show target name

### Effect Triggering

```typescript
// When you play a card:
playCard(cardId) → Server updates state → Effect triggers

// Effect lifecycle:
1. Card played
2. Game state updates
3. Effect component renders
4. Animation plays (2-3 seconds)
5. Effect clears automatically
```

## 🎨 Customization

### Changing Effect Duration

Edit `components/card-effects.tsx`:

```typescript
const duration = cardType === "exploding-kitten" ? 3000 : 2000
// Change 2000 to your preferred milliseconds
```

### Changing Particle Count

Edit the particle loop:

```typescript
{Array.from({ length: 12 }).map((_, i) => (
  <Particle key={i} ... />
))}
// Change 12 to add more/fewer particles
```

### Changing Colors

Edit the color schemes in `card-effects.tsx`:

```typescript
const colorClasses = {
  orange: { bg: "bg-orange-950/90", border: "border-orange-500", text: "text-orange-400" },
  // Add or modify colors here
}
```

### Adding New Animations

Add to `app/globals.css`:

```css
@keyframes my-animation {
  0% { /* start state */ }
  100% { /* end state */ }
}

.animate-my-animation {
  animation: my-animation 1s ease-in-out;
}
```

## 🚀 Performance

### Optimizations

- Effects use CSS animations (GPU-accelerated)
- Particles clean up automatically
- Only one effect shows at a time
- No effect loops (all one-shot)
- Pointer events disabled on overlays

### Browser Compatibility

- ✅ Chrome/Edge (Chromium): Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support (may be slightly slower)

## 🎭 Effect States

### Effect Manager

The `useCardEffects` hook manages:
- **Current effect**: Only one effect at a time
- **Effect queue**: Effects wait for previous to finish
- **Auto-clear**: Effects clear after duration

### No Overlapping

Effects are queued to prevent:
- ❌ Multiple effects blocking the screen
- ❌ Confusing animations
- ❌ Performance issues

## 💡 Tips for Best Experience

### For Players

1. **Watch the effects**: They show what card was played
2. **Identify cards**: Each color scheme matches card type
3. **Read messages**: Effect text explains what happened
4. **Special cards**: Wiggling cards are important!

### For Developers

1. **Test effects**: Play each card type to see animations
2. **Adjust timing**: Shorter durations for faster gameplay
3. **More particles**: Increase count for more drama
4. **New effects**: Copy existing and modify colors/animations

## 🐛 Troubleshooting

### Effects Not Showing

- Check browser console for errors
- Ensure `components/card-effects.tsx` is imported
- Verify game state is updating properly

### Effects Too Fast/Slow

- Adjust `duration` in `CardEffect` component
- Modify animation speeds in `globals.css`

### Particles Not Animating

- Check CSS is loaded (`globals.css`)
- Verify `@keyframes particle-burst` exists
- Clear browser cache

### Performance Issues

- Reduce particle count (12 → 6)
- Shorten effect duration (2000 → 1000)
- Disable wiggle on special cards

## 📚 File Structure

```
components/
  ├── card-effects.tsx       # Main effect component
  ├── game-card.tsx          # Enhanced card with hover
  └── explosion-animation.tsx # (Deprecated, use card-effects)

lib/
  └── use-card-effects.ts    # Effect state management

app/
  ├── globals.css            # Custom animations
  └── game/[id]/page.tsx     # Effect triggering logic
```

## 🎉 Result

Your game now has:
- ✅ 10+ unique card effects
- ✅ Particle systems
- ✅ Smooth animations
- ✅ Interactive cards
- ✅ Automatic triggering
- ✅ Professional polish

Every card play feels **exciting and rewarding**! 🎮✨

