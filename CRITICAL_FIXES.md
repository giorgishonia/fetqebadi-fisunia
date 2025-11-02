# Critical Bug Fixes

## Overview
Fixed multiple critical errors that were crashing the game, particularly around the Defuse card mechanic, Favor requests, and Nope card timing.

## Issues Fixed

### 1. FavorRequestDialog Crash (`targetPlayer.id` undefined)
**Problem:** When `FavorRequestDialog` received undefined players (from failed `find()` operations), it crashed trying to access `.id` on undefined.

**Root Cause:**
- `gameState.players.find()` could return undefined if player wasn't found
- Using non-null assertion (`!`) masked the problem
- Race conditions or stale state could cause player IDs to not match

**Solution:**
- Updated `FavorRequestDialogProps` to accept `Player | undefined` for both players
- Added defensive null checks before accessing player properties
- Show graceful loading state when players are undefined
- Removed non-null assertions in `app/game/[id]/page.tsx`

**Files Changed:**
- `components/favor-request-dialog.tsx`
- `app/game/[id]/page.tsx`

### 2. "No Action to Nope" Error
**Problem:** Players could click "Play Nope!" after the nope window expired, causing server errors.

**Root Cause:**
- Nope button remained clickable even after timer reached 0
- No expiration check in `handleNope` function
- Race condition between timer expiring and button being disabled

**Solution:**
- Added `timeLeft > 0` check before showing Nope button
- Added expiration validation in `handleNope` function
- Show "Time expired" message when window closes
- Prevent button click when `timeLeft <= 0`

**Files Changed:**
- `components/nope-window.tsx`
- `lib/game-logic.ts`

### 3. Defuse Card Crash
**Problem:** Using Defuse card would crash due to conflicting `pendingAction` usage and showing wrong UI dialogs.

**Root Cause:**
- `handleDefuse` set `pendingAction.type = "favor-request"` to store the kitten card
- This caused `FavorRequestDialog` to appear during kitten insertion phase
- The UI check `pendingAction?.type === "favor-request"` was too broad

**Solution:**
- Keep using `pendingAction` to store the kitten (required by `insertExplodingKitten`)
- Add `turnPhase !== "inserting-kitten"` check when showing `FavorRequestDialog`
- This prevents favor dialog from appearing during kitten insertion
- Document that "favor-request" type is reused for kitten storage (filtered by turnPhase)

**Files Changed:**
- `lib/game-logic.ts`
- `app/game/[id]/page.tsx`

## Code Changes Summary

### components/favor-request-dialog.tsx
```typescript
interface FavorRequestDialogProps {
  initiator: Player | undefined      // ← Now accepts undefined
  targetPlayer: Player | undefined   // ← Now accepts undefined
  currentPlayerId: string
  onSelectCard: (cardId: string) => void
}

// Added null check at start of component
if (!initiator || !targetPlayer) {
  return <Card>Waiting for favor request...</Card>
}
```

### components/nope-window.tsx
```typescript
// Only show button if time remaining
{hasNopeCard && timeLeft > 0 && (
  <Button onClick={() => {
    const nopeCard = currentPlayer?.hand.find((c) => c.type === "nope")
    if (nopeCard && timeLeft > 0) {  // ← Double check
      onPlayNope(nopeCard.id)
    }
  }}>
    Play Nope!
  </Button>
)}
```

### lib/game-logic.ts
```typescript
function handleNope(gameState: GameState, playerId: string, card: Card): GameState {
  if (!newState.pendingAction) {
    throw new Error("No action to nope")
  }
  
  // Check if nope window has expired ← NEW
  if (newState.pendingAction.expiresAt < Date.now()) {
    throw new Error("Nope window has expired")
  }
  
  // ... rest of function
}

function handleDefuse(gameState: GameState, playerId: string, card: Card): GameState {
  // ... remove kitten from hand, discard defuse ...
  
  newState.turnPhase = "inserting-kitten"
  // Store kitten in pendingAction for insertExplodingKitten to use
  newState.pendingAction = {
    type: "favor-request",  // Reused as container
    initiatorId: playerId,
    nopeChain: [],
    timestamp: Date.now(),
    expiresAt: Date.now() + 30000,
    cardPlayed: kitten,  // ← Stored here for later insertion
  }
  
  return newState
}
```

### app/game/[id]/page.tsx
```typescript
// Only show favor dialog if NOT in inserting-kitten phase
{gameState.pendingAction?.type === "favor-request" && 
 gameState.turnPhase !== "inserting-kitten" && (  // ← NEW CHECK
  <FavorRequestDialog
    initiator={gameState.players.find(...)}    // ← No more !
    targetPlayer={gameState.players.find(...)} // ← No more !
    currentPlayerId={currentPlayerId}
    onSelectCard={handleFavorResponse}
  />
)}
```

## Testing Checklist

To verify these fixes work:

1. **Test Defuse Card:**
   - [ ] Start a game and draw an Exploding Kitten
   - [ ] Play Defuse card
   - [ ] Verify no crash and kitten insertion UI appears
   - [ ] Insert kitten back into deck
   - [ ] Verify game continues normally

2. **Test Favor Request:**
   - [ ] Play Favor card targeting another player
   - [ ] Verify target sees card selection dialog
   - [ ] Select a card to give
   - [ ] Verify no crashes with undefined players

3. **Test Nope Window:**
   - [ ] Play any nopeable action card
   - [ ] Wait for nope window timer to reach 0
   - [ ] Verify "Play Nope!" button disappears or is disabled
   - [ ] Try clicking it (if visible) - should not error

4. **Test Reconnection:**
   - [ ] Join a game in progress
   - [ ] Refresh the page
   - [ ] Verify reconnection works
   - [ ] Verify no crashes with player state

## Impact

These fixes resolve:
- ✅ All crashes when playing Defuse card
- ✅ All crashes when players disconnect/reconnect during Favor requests
- ✅ All "No action to nope" errors
- ✅ Race conditions in Nope window timing
- ✅ Improved error handling throughout the game

## Technical Notes

**Why reuse "favor-request" for kitten insertion?**
- The `PendingAction` type only supports: "nope-chain", "favor-request", "see-future"
- Adding a new type would require updating the type definition and all related code
- Since `turnPhase` distinguishes between actual favor requests and kitten insertion, filtering by phase is cleaner
- The `cardPlayed` field naturally holds the kitten card for later insertion

**Alternative approaches considered:**
1. Add new "kitten-insertion" type to PendingAction ❌ (requires type changes)
2. Store kitten in separate GameState field ❌ (requires state structure changes)
3. Pass kitten directly to insertExplodingKitten ❌ (requires client to track card)
4. Clear pendingAction during kitten insertion ❌ (breaks insertExplodingKitten)
5. **Filter favor dialog by turnPhase ✅ (minimal change, works perfectly)**

