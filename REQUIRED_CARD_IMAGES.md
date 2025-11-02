# Required Card Images

## Images You Need to Create/Place in `/public/cat/`

### ✅ Existing Cards (Already Have Images)
- `exploding-kitten.png` ✅
- `defuse.png` ✅
- `nope.png` ✅
- `skip.png` ✅
- `favor.png` ✅
- `shuffle.png` ✅
- `see-the-future.png` ✅
- `tacocat.png` ✅
- `rainbow-ralphing-cat.png` ✅
- `beart-cat.png` ✅
- `cattermelon.png` ✅
- `hairy-potato-cat.png` ✅
- `attack.png` ✅ (you provided this)
- `backside.png` ✅ (card back)
- `background.mp4` ✅

### 🆕 NEW Cards - Need to Generate with Nanobanana AI

Use the prompts from `NEW_CARDS_AI_PROMPTS.md` to generate these:

1. **`reverse.png`** 🔄
   - Purple cat doing backflip with reverse arrows
   - See: "REVERSE Card" prompt

2. **`draw-from-bottom.png`** ⬇️
   - Upside-down cat reaching for cards at bottom
   - See: "DRAW FROM BOTTOM Card" prompt

3. **`alter-the-future.png`** 🔮
   - Mystical cat with floating rearranging cards
   - See: "ALTER THE FUTURE Card" prompt

4. **`imploding-kitten.png`** 💥
   - Cat collapsing inward like black hole/vortex
   - See: "IMPLODING KITTEN Card" prompt

5. **`curse-of-the-cat.png`** 😈
   - Evil witch cat casting dark spell
   - See: "CURSE OF THE CAT Card" prompt

6. **`targeted-attack.png`** 🎯
   - Aggressive cat with targeting reticle/crosshair
   - See: "TARGETED ATTACK Card" prompt

7. **`bury.png`** 🪦
   - Sneaky cat burying card with shovel
   - See: "BURY Card" prompt

---

## Quick Setup Guide

### Step 1: Generate Images
1. Open Nanobanana AI
2. Copy each prompt from `NEW_CARDS_AI_PROMPTS.md`
3. Generate at **1024x1536 resolution** (portrait)
4. Use **Exploding Kittens art style** keywords
5. Ensure **bold black outlines** and **flat vibrant colors**

### Step 2: Save Images
1. Save each generated image with the exact filename above
2. Place all images in: `/public/cat/`
3. Format: PNG (with transparency if possible)

### Step 3: Test in Game
1. Start the game server
2. Check that all new cards display correctly
3. Verify images match the card names and effects
4. Adjust if needed for consistency

---

## Image Specifications

### Required Properties
- **Format**: PNG (preferred) or JPG
- **Resolution**: 1024x1536 pixels (portrait, 2:3 aspect ratio)
- **Style**: Exploding Kittens aesthetic
  - Bold black outlines
  - Vibrant flat colors (no gradients)
  - Comic book style
  - Purple/rainbow cats
  - Playful expressions

### File Naming
- Use exact filenames listed above (lowercase, hyphens for spaces)
- Example: `draw-from-bottom.png` NOT `DrawFromBottom.png`

### Consistency Checklist
- [ ] All cats have similar style/color (purple/rainbow theme)
- [ ] All cards have similar border treatment
- [ ] Card names appear at top in bold letters
- [ ] Line weight is consistent across all cards
- [ ] Color vibrancy matches existing cards
- [ ] Style matches existing Exploding Kittens cards

---

## Alternative: Placeholder Images

If you want to test the game before generating all images, you can:

1. **Use existing images as placeholders**:
   ```javascript
   // In the CARD_IMAGES mapping, temporarily use:
   reverse: "/cat/shuffle.png",  // placeholder
   "draw-from-bottom": "/cat/see-the-future.png",  // placeholder
   // etc.
   ```

2. **Create simple text placeholders**:
   - Use any image editor
   - Create 1024x1536 purple background
   - Add card name in large white text
   - Saves as temporary placeholder

3. **Generate later**: 
   - Game will still function with placeholder images
   - Replace with proper artwork when ready

---

## Batch Generation Tips

### For Nanobanana AI:
1. **Generate in order** - Start with simpler cards (Reverse, Bury)
2. **Save prompts** - Keep a copy of successful prompt variations
3. **Iterate quickly** - Generate multiple versions, pick best one
4. **Maintain consistency** - Use same cat color scheme for all
5. **Check scale** - Ensure main character/element fills frame well

### Quality Checks:
- ✅ Card name clearly visible at top
- ✅ Main element (cat) is centered and prominent
- ✅ Colors are vibrant and high contrast
- ✅ Style matches existing Exploding Kittens cards
- ✅ Details are clear at card size (not too fine)
- ✅ Background doesn't overpower main subject

---

## Need Help?

If images don't generate as expected:

1. **Adjust prompts** - Add more style keywords (comic book, bold outlines, etc.)
2. **Reference existing cards** - Look at the style of nope.png, defuse.png, etc.
3. **Simplify composition** - Focus on main cat character and key prop
4. **Increase contrast** - Make sure colors pop and outlines are bold
5. **Test different AI models** - Some work better for specific styles

---

## File Checklist

Copy this to track your progress:

```
[ ] reverse.png
[ ] draw-from-bottom.png
[ ] alter-the-future.png
[ ] imploding-kitten.png
[ ] curse-of-the-cat.png
[ ] targeted-attack.png
[ ] bury.png
```

Once all 7 images are created and placed in `/public/cat/`, your game will have all the new card artwork! 🎨

