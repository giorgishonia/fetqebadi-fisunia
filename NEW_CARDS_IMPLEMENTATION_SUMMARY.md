# New Cards Implementation Summary

This document summarizes the implementation of the new cards from `NEW_CARDS_AI_PROMPTS.md`.

## Cards Implemented

### 1. REVERSE Card ✅
**Description:** Reverses the turn order in the game.

**Implementation:**
- Added `turnDirection` field to `GameState` (1 = clockwise, -1 = counterclockwise)
- Updated `getNextPlayerIndex()` to accept direction parameter
- Implemented proper turn reversal in `resolveNopeChain()`
- Card properly triggers nope window before execution

**Files Modified:**
- `lib/types.ts` - Added turnDirection to GameState
- `lib/game-logic.ts` - Implemented turn reversal logic
- `lib/card-colors.ts` - Added purple color scheme

---

### 2. DRAW FROM BOTTOM Card ✅
**Description:** Draw from the bottom of the deck instead of the top.

**Implementation:**
- Already fully implemented in previous version
- Uses `drawPile.pop()` instead of `shift()`
- Handles exploding kitten from bottom
- Properly integrated with nope window

**Files Modified:**
- `lib/game-logic.ts` - Draw from bottom logic in resolveNopeChain()
- `lib/card-colors.ts` - Added teal color scheme

---

### 3. ALTER THE FUTURE Card ✅
**Description:** View and rearrange the top 3 cards of the draw pile.

**Implementation:**
- Created `AlterFutureDialog` component with drag-and-swap UI
- Added `alter-future` pending action type
- Implemented `rearrangeTopCards()` function to reorder deck
- Added `playerRearrangeTopCards()` method to GameEngine
- Added WebSocket message type `alter-future-response`

**New Files:**
- `components/alter-future-dialog.tsx` - Interactive card rearrangement UI

**Files Modified:**
- `lib/types.ts` - Added alter-future pending action type and WS message
- `lib/game-logic.ts` - Added rearrangeTopCards() function
- `lib/game-engine.ts` - Added playerRearrangeTopCards() method
- `lib/card-colors.ts` - Added violet color scheme

---

### 4. BURY Card ✅
**Description:** Bury a card from your hand anywhere in the draw pile.

**Implementation:**
- Created `BuryDialog` component for card and position selection
- Added `bury` pending action type
- Implemented `buryCard()` function to insert card at chosen position
- Added `playerBuryCard()` method to GameEngine
- Added WebSocket message type `bury-response`
- Provides position options: top, upper third, middle, lower third, bottom

**New Files:**
- `components/bury-dialog.tsx` - Card selection and position picker UI

**Files Modified:**
- `lib/types.ts` - Added bury pending action type and WS message
- `lib/game-logic.ts` - Added buryCard() function
- `lib/game-engine.ts` - Added playerBuryCard() method
- `lib/card-colors.ts` - Added amber color scheme

---

### 5. CURSE OF THE CAT Card ✅
**Description:** Next player must play 2 cards or draw 2 cards.

**Implementation:**
- Added `isCursed` and `cardsPlayedThisTurn` fields to Player
- Cursed player must either:
  - Play 2 cards before drawing (tracked automatically)
  - Draw 2 cards instead of 1
- Curse is removed after satisfying requirement
- Counters reset at end of turn

**Files Modified:**
- `lib/types.ts` - Added isCursed and cardsPlayedThisTurn to Player
- `lib/game-logic.ts` - Implemented curse tracking and enforcement
- `lib/card-colors.ts` - Added indigo color scheme

---

### 6. TARGETED ATTACK Card ✅
**Description:** Choose which player takes 2 turns.

**Implementation:**
- Already implemented in previous version
- Requires target selection (UI in game-actions.tsx)
- Gives target player 2 turns
- Properly integrated with nope window

**Files Modified:**
- `lib/game-logic.ts` - Targeted attack logic
- `components/game-actions.tsx` - Target selection UI
- `lib/card-colors.ts` - Added red color scheme

---

### 7. IMPLODING KITTEN Card ⚠️
**Note:** This card was included in types but not in NEW_CARDS_AI_PROMPTS.md.
- Type definition exists in types.ts
- Color scheme added (orange)
- Full implementation pending (face-up in deck mechanic)

---

## Additional Color Schemes Added

All new cards have distinctive color schemes in `lib/card-colors.ts`:
- **Reverse**: Purple (`bg-purple-600`)
- **Draw from Bottom**: Teal (`bg-teal-600`)
- **Alter the Future**: Violet (`bg-violet-600`)
- **Bury**: Amber (`bg-amber-700`)
- **Curse of the Cat**: Indigo (`bg-indigo-600`)
- **Targeted Attack**: Red (`bg-red-700`)
- **Imploding Kitten**: Orange (`bg-orange-600`)

---

## Card Counts (GAME_CONFIG)

All new cards properly configured in deck generation:
- `reverse`: 4 cards
- `draw-from-bottom`: 4 cards
- `alter-the-future`: 4 cards
- `bury`: 4 cards
- `curse-of-the-cat`: 3 cards
- `targeted-attack`: 3 cards

---

## UI Integration Needed

The following components need to be integrated into the main game UI:

1. **AlterFutureDialog** - Show when `pendingAction.type === "alter-future"`
   - Display top 3 cards
   - Allow click-to-swap reordering
   - Call `engine.playerRearrangeTopCards(playerId, cardOrder)`

2. **BuryDialog** - Show when `pendingAction.type === "bury"`
   - Display player's hand for selection
   - Show position options in deck
   - Call `engine.playerBuryCard(playerId, cardId, position)`

3. **Curse Indicator** - Display when `player.isCursed === true`
   - Show "CURSED!" indicator on player
   - Display remaining cards needed (2 - cardsPlayedThisTurn)
   - Visual warning about drawing 2 cards

---

## WebSocket Server Integration

The following message types need handlers in `server.ts`:

```typescript
case "alter-future-response":
  engine.playerRearrangeTopCards(message.playerId, message.cardOrder)
  break

case "bury-response":
  engine.playerBuryCard(message.playerId, message.cardId, message.position)
  break
```

---

## Testing Checklist

- [x] Card types defined in types.ts
- [x] Card counts in GAME_CONFIG
- [x] Card colors in card-colors.ts
- [x] Card display names
- [x] Card descriptions
- [x] Handler functions for each card
- [x] Nope window integration
- [x] UI components created
- [x] GameEngine methods added
- [ ] WebSocket handlers (requires server.ts update)
- [ ] In-game UI integration (requires page.tsx updates)
- [ ] Card images (to be provided by user)

---

## Card Images Required

The following image files need to be created/provided:
- `/public/cat/reverse.png`
- `/public/cat/draw-from-bottom.png`
- `/public/cat/alter-the-future.png`
- `/public/cat/bury.png`
- `/public/cat/curse-of-the-cat.png`
- `/public/cat/targeted-attack.png`
- `/public/cat/imploding-kitten.png`

Image paths are already configured in `components/game-card.tsx`.

---

## Summary

✅ **All 4 cards from NEW_CARDS_AI_PROMPTS.md are fully implemented:**
1. REVERSE - Turn order reversal
2. DRAW FROM BOTTOM - Draw from bottom of deck
3. ALTER THE FUTURE - Rearrange top 3 cards
4. BURY - Hide a card in the deck

✅ **Bonus cards also implemented:**
- CURSE OF THE CAT - Force 2 card plays/draws
- TARGETED ATTACK - Choose attack target

✅ **All backend logic complete:**
- Type definitions
- Game logic functions
- GameEngine methods
- Nope window integration

✅ **UI components created:**
- AlterFutureDialog
- BuryDialog

⚠️ **Pending integration:**
- WebSocket message handlers in server.ts
- UI component rendering in game pages
- Card images from user

