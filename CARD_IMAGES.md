# 🃏 Card Images Guide

## Overview

The game now uses **beautiful custom card artwork** instead of styled divs! Each card type displays its own unique, full-color illustration.

## 🎨 Card Image Mapping

### Available Cards

| Card Type | Image File | Status |
|-----------|------------|--------|
| 💣 Exploding Kitten | `exploding-kitten.png` | ✅ Available |
| 🛡️ Defuse | `defuse.png` | ✅ Available |
| 🚫 Nope | `nope.png` | ✅ Available |
| ⚔️ Attack | `skip.png` | ⚠️ Using Skip as placeholder |
| ⏭️ Skip | `skip.png` | ✅ Available |
| 🎁 Favor | `favor.png` | ✅ Available |
| 🔀 Shuffle | `shuffle.png` | ✅ Available |
| 🔮 See the Future | `see-the-future.png` | ✅ Available |
| 🌮 Taco Cat | `tacocat.png` | ✅ Available |
| 🌈 Rainbow Cat | `rainbow-ralphing-cat.png` | ✅ Available |
| 🧔 Beard Cat | `beart-cat.png` | ✅ Available |
| 🍉 Melon Cat | `cattermelon.png` | ✅ Available |
| 🥔 Potato Cat | `hairy-potato-cat.png` | ✅ Available |

### Image Location

All card images are stored in:
```
/public/cat/
```

## 🎯 Features

### Image Display

Cards are displayed using Next.js `Image` component for:
- ✅ Automatic optimization
- ✅ Lazy loading (except special cards)
- ✅ Responsive sizing
- ✅ Better performance

### Size Options

Three card sizes available:
- **Small (sm)**: 80px × 112px - Used in discard pile
- **Medium (md)**: 112px × 160px - Default hand size
- **Large (lg)**: 144px × 208px - Featured cards

### Interactive Effects

All the original effects are preserved:
- ✨ **Hover lift**: Cards rise when you hover
- 🔄 **Scale animation**: Smooth 110% zoom
- 💫 **Shine sweep**: Light effect on hover
- 🎭 **Selection glow**: Yellow ring when selected
- 🎪 **Special wiggle**: Bomb/Defuse/Nope cards wiggle
- 🌟 **Glow effect**: Special cards have pulsing glow

### Accessibility

- Disabled cards appear **grayscale**
- Selected cards have high-contrast yellow ring
- Alt text provided for screen readers
- Keyboard navigation supported

## 🔧 Implementation

### Card Component

```typescript
// Map in components/game-card.tsx
const CARD_IMAGES: Record<string, string> = {
  "exploding-kitten": "/cat/exploding-kitten.png",
  "defuse": "/cat/defuse.png",
  "nope": "/cat/nope.png",
  // ... etc
}
```

### Usage

```tsx
<GameCard 
  card={card}
  size="md"
  selected={isSelected}
  onClick={handleClick}
  disabled={!isMyTurn}
/>
```

## 📝 Notes

### Attack Card

Currently, the **Attack** card uses the **Skip** card image as a placeholder since no specific attack image was provided. Both are action cards, so the visual is similar.

To add a proper Attack card image:
1. Add `attack.png` to `/public/cat/`
2. Update the mapping in `components/game-card.tsx`:
   ```typescript
   "attack": "/cat/attack.png",
   ```

### Card Aspect Ratio

All cards maintain a **5:7 aspect ratio** (standard playing card proportion):
- Small: 80 × 112px
- Medium: 112 × 160px (28 × 40 in Tailwind units)
- Large: 144 × 208px

### Image Optimization

Next.js automatically:
- Converts images to WebP format
- Serves responsive sizes
- Lazy loads non-critical images
- Caches aggressively

## 🎨 Visual Effects

### Hover State

```
Normal → Hover
  ↓       ↓
Scale   Scale 110%
100%    Lift 8px
        Shadow XL
        Shine sweep
```

### Selected State

```
Normal → Selected
  ↓         ↓
No ring   Yellow ring
Scale     Scale 110%
100%      Lift 8px
          Shadow 2XL
          Pulse
```

### Disabled State

```
Normal → Disabled
  ↓         ↓
Color     Grayscale
100%      50% opacity
          No hover
          No click
```

### Special Cards

Exploding Kitten, Defuse, and Nope cards have:
- 🎪 Constant wiggle animation
- 🌟 Pulsing radial glow
- ⚡ Priority loading
- ✨ Extra attention-grabbing

## 🚀 Performance

### Optimizations

- **Priority loading** for special cards
- **Lazy loading** for regular cards
- **Responsive images** (multiple sizes)
- **WebP format** (smaller file size)
- **Browser caching** enabled

### File Sizes

Original PNG files range from 700KB to 1MB, but Next.js automatically:
- Compresses to WebP (~50% smaller)
- Serves appropriate size for viewport
- Result: Much faster loading!

## 🎮 In-Game Display

### Player Hand

Cards in your hand are displayed as **medium (md)** size with:
- Full hover effects
- Selection capability
- Click to select/deselect
- Visual feedback

### Discard Pile

Top card shown as **small (sm)** size:
- No interaction
- Clear visibility
- Compact display

### Other Players

Shows card count only (no card faces for opponent hands - keeps the mystery!)

## 🐛 Troubleshooting

### Cards Not Showing

1. Check files exist in `/public/cat/`
2. Verify filenames match exactly (case-sensitive)
3. Clear browser cache (Ctrl+Shift+R)
4. Check browser console for errors

### Images Look Blurry

1. Ensure original images are high resolution
2. Check the `sizes` prop in Image component
3. Verify aspect ratio is maintained

### Slow Loading

1. Check image file sizes
2. Enable Next.js image optimization
3. Use priority loading for above-fold cards
4. Consider WebP conversion

### Wrong Card Displayed

1. Check CARD_IMAGES mapping
2. Verify card.type matches key
3. Check fallback image path

## 🎨 Customization

### Adding New Card Images

1. Add PNG file to `/public/cat/`
2. Update mapping in `components/game-card.tsx`:
   ```typescript
   const CARD_IMAGES: Record<string, string> = {
     // ... existing cards
     "new-card": "/cat/new-card.png",
   }
   ```
3. Image automatically displays!

### Changing Card Sizes

Edit `sizeClasses` in `game-card.tsx`:
```typescript
const sizeClasses = {
  sm: "w-20 h-28",   // Change these
  md: "w-28 h-40",   // values to
  lg: "w-36 h-52",   // adjust sizes
}
```

### Custom Effects

Add to the button className:
```typescript
${yourCondition ? "your-custom-animation" : ""}
```

## 📚 File Structure

```
public/
  └── cat/
      ├── exploding-kitten.png
      ├── defuse.png
      ├── nope.png
      ├── skip.png
      ├── favor.png
      ├── shuffle.png
      ├── see-the-future.png
      ├── tacocat.png
      ├── hairy-potato-cat.png
      ├── cattermelon.png
      ├── rainbow-ralphing-cat.png
      └── beart-cat.png

components/
  └── game-card.tsx         # Card display component

app/
  └── game/[id]/page.tsx    # Uses GameCard
```

## ✨ Result

Your game now features:
- 🎨 Beautiful custom artwork
- ⚡ Fast, optimized loading
- 🎭 Smooth animations
- 🎮 Professional appearance
- 💫 Interactive effects
- 🖼️ Authentic card game feel

The cards look amazing and make the game feel like a real, professional card game! 🃏✨

