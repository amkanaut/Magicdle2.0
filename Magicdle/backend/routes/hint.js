const express = require('express');
const router = express.Router();
const DailyChallenge = require('../models/DailyChallenge');

// ---------------------------------------------------------------------------
// Zone definitions — percentage-based bounding boxes on the card image.
//
// Scryfall "normal" images are 488×680px (M15 modern frame, 2014–present).
// Coordinates are { x, y, w, h } as percentages of the image dimensions so
// the frontend can position overlay cutouts at any rendered size.
//
// HOW THE BLUR WORKS (for frontend reference):
//   1. Render the card image.
//   2. Place a full-size blurred overlay on top (CSS: filter: blur(Npx)).
//   3. For each unlocked zone, punch a hole in the overlay using clip-path
//      or an absolutely-positioned transparent div of the same size.
//   4. Artist strip is always punched through.
// ---------------------------------------------------------------------------
const ZONES = {
  // Always visible --------------------------------------------------------
  artist: {
    id: 'artist',
    label: 'Artist',
    // Bottom strip containing the artist credit line
    x: 7, y: 92, w: 62, h: 4,
  },

  // Hint 1 ----------------------------------------------------------------
  mana_cost: {
    id: 'mana_cost',
    label: 'Mana Cost',
    // Top-right corner — mana pip icons live here
    x: 68, y: 3.5, w: 26, h: 7,
  },

  // Hint 2 ----------------------------------------------------------------
  power: {
    id: 'power',
    label: 'Power',
    // Power/Toughness box is one box; power is the left digit (X/Y).
    // We reveal the whole box at hint 2 but only tell the client power.
    x: 78, y: 86.5, w: 17, h: 6,
  },

  // Hint 3 ----------------------------------------------------------------
  toughness: {
    id: 'toughness',
    label: 'Toughness',
    // Same P/T box — revealing it again (already open) just confirms toughness.
    x: 78, y: 86.5, w: 17, h: 6,
  },

  // Hint 4 ----------------------------------------------------------------
  rarity: {
    id: 'rarity',
    label: 'Rarity',
    // Set symbol on the right side of the type line (color = rarity indicator)
    x: 81, y: 52, w: 13, h: 8,
  },

  // Hint 5 ----------------------------------------------------------------
  set_name: {
    id: 'set_name',
    label: 'Set Name',
    // Collector info strip at the bottom (set code + collector number + language)
    x: 7, y: 93.5, w: 72, h: 4,
  },

  // Hint 6 ----------------------------------------------------------------
  type_line: {
    id: 'type_line',
    label: 'Type Line',
    // Full-width type line bar below the art box
    x: 5, y: 52, w: 76, h: 8,
  },

  // Art quadrants — the illustration box only (x: 5–95%, y: 9–53%)
  // Unlocked progressively alongside the card-text hints above.
  art_q1: { id: 'art_q1', label: 'Art (top-left)',     x: 5,  y: 9,  w: 45, h: 22 },
  art_q2: { id: 'art_q2', label: 'Art (top-right)',    x: 50, y: 9,  w: 45, h: 22 },
  art_q3: { id: 'art_q3', label: 'Art (bottom-left)',  x: 5,  y: 31, w: 45, h: 22 },
  art_q4: { id: 'art_q4', label: 'Art (bottom-right)', x: 50, y: 31, w: 45, h: 22 },
};

// ---------------------------------------------------------------------------
// Which zones are unlocked at each hint level (cumulative).
// Level 0 = game start (no hints beyond the always-visible artist strip).
// Level N = N wrong guesses have been made.
// Art quadrants are bundled with card-text hints to give the illustration
// a four-step reveal that mirrors the hint cadence.
// ---------------------------------------------------------------------------
const HINT_LEVELS = [
  [],                                                                           // 0 — no hints
  ['mana_cost'],                                                                // 1
  ['mana_cost', 'power', 'art_q1'],                                            // 2
  ['mana_cost', 'power', 'toughness', 'art_q1'],                               // 3
  ['mana_cost', 'power', 'toughness', 'rarity', 'art_q1', 'art_q2'],          // 4
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name', 'art_q1', 'art_q2', 'art_q3'],                    // 5
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name', 'type_line', 'art_q1', 'art_q2', 'art_q3', 'art_q4'], // 6
];

// ---------------------------------------------------------------------------
// GET /api/hint?level=N
// Returns the zones to unblur and the corresponding card data revealed so far.
// The card_name is never included — hints are visual, not a giveaway.
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const level = parseInt(req.query.level, 10);

    if (isNaN(level) || level < 0 || level > 6) {
      return res.status(400).json({ error: 'level must be an integer between 0 and 6' });
    }

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" UTC
    const challenge = await DailyChallenge.findOne({ date: today });

    if (!challenge) {
      return res.status(404).json({ error: 'No daily challenge found for today' });
    }

    // Build the unlocked zone list — artist is always included.
    const unlockedIds = HINT_LEVELS[level];
    const zones = [ZONES.artist, ...unlockedIds.map(id => ZONES[id])];

    // Reveal card data fields progressively.
    // Nothing here exposes the card name or oracle text.
    const data = {
      artist: challenge.artist, // always returned (artist strip is always visible)
    };
    if (level >= 1) data.mana_cost  = challenge.mana_cost;
    if (level >= 2) data.power      = challenge.power;      // null for non-creatures
    if (level >= 3) data.toughness  = challenge.toughness;  // null for non-creatures
    if (level >= 4) data.rarity     = challenge.rarity;
    if (level >= 5) data.set_name   = challenge.set_name;
    if (level >= 6) data.type_line  = challenge.card_type;

    res.json({ level, zones, data });
  } catch (err) {
    console.error('[/api/hint] Error:', err.message);
    res.status(500).json({ error: 'Failed to load hints' });
  }
});

module.exports = router;
