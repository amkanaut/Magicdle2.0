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
    x: 7, y: 94, w: 62, h: 4,
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
    x: 77, y: 89.5, w: 9, h: 6,
  },

  // Hint 3 ----------------------------------------------------------------
  toughness: {
    id: 'toughness',
    label: 'Toughness',
    // Same P/T box — revealing it again (already open) just confirms toughness.
    x: 79, y: 89.5, w: 17, h: 6,
  },

  // Hint 4 ----------------------------------------------------------------
  rarity: {
    id: 'rarity',
    label: 'Rarity',
    // Set symbol on the right side of the type line (color = rarity indicator)
    x: 81, y: 56, w: 13, h: 8,
  },

  // Hint 5 ----------------------------------------------------------------
  set_name: {
    id: 'set_name',
    label: 'Set Name',
    // Collector info strip at the bottom (set code + collector number + language)
    x: 3, y: 93.5, w: 76, h: 4,
  },

  // Hint 6 ----------------------------------------------------------------
  type_line: {
    id: 'type_line',
    label: 'Type Line',
    // Full-width type line bar below the art box
    x: 5, y: 52, w: 76, h: 9,
  },

  // Hint 7 ----------------------------------------------------------------
  oracle_text: {
    id: 'oracle_text',
    label: 'Oracle Text',
    // The text box — sits below the type line, above the P/T box
    x: 5, y: 61, w: 88, h: 26,
  },

  // Art quadrants — the illustration box only (x: 5–95%, y: 9–53%)
  // Unlocked progressively after all card-text hints are revealed.
  art_q1: { id: 'art_q1', label: 'Art (top-left)',     x: 5,  y: 11, w: 45, h: 22 },
  art_q2: { id: 'art_q2', label: 'Art (top-right)',    x: 50, y: 11, w: 45, h: 22 },
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
  [],                                                                                                          // 0
  ['mana_cost'],                                                                                               // 1
  ['mana_cost', 'power'],                                                                                      // 2
  ['mana_cost', 'power', 'toughness'],                                                                         // 3
  ['mana_cost', 'power', 'toughness', 'rarity'],                                                               // 4
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name'],                                                   // 5
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name', 'type_line'],                                                              // 6
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name', 'type_line', 'oracle_text'],                                               // 7
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name', 'type_line', 'oracle_text', 'art_q1'],                                     // 8
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name', 'type_line', 'oracle_text', 'art_q1', 'art_q2'],                           // 9
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name', 'type_line', 'oracle_text', 'art_q1', 'art_q2', 'art_q3'],                 // 10
  ['mana_cost', 'power', 'toughness', 'rarity', 'set_name', 'type_line', 'oracle_text', 'art_q1', 'art_q2', 'art_q3', 'art_q4'],      // 11
];

// ---------------------------------------------------------------------------
// GET /api/hint?level=N
// Returns the zones to unblur and the corresponding card data revealed so far.
// The card_name is never included — hints are visual, not a giveaway.
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const level = parseInt(req.query.level, 10);

    if (isNaN(level) || level < 0 || level > 11) {
      return res.status(400).json({ error: 'level must be an integer between 0 and 11' });
    }

    // Optional date param lets archive games fetch hints for a past card.
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const challenge = await DailyChallenge.findOne({ date });

    if (!challenge) {
      return res.status(404).json({ error: 'No daily challenge found for today' });
    }

    // Creature oracle text is withheld — abilities are too card-specific and
    // make identification trivial. The zone is silently skipped for creatures;
    // the art quadrant progression at levels 8–11 continues unchanged.
    const isCreature = challenge.card_type?.includes('Creature') ?? false;

    // Build the unlocked zone list — artist is always included.
    const unlockedIds = HINT_LEVELS[level].filter(
      id => !(id === 'oracle_text' && isCreature)
    );
    const zones = [ZONES.artist, ...unlockedIds.map(id => ZONES[id])];

    // Reveal card data fields progressively.
    // Nothing here exposes the card name.
    const data = {
      artist: challenge.artist,
    };
    if (level >= 1) data.mana_cost  = challenge.mana_cost;
    if (level >= 2) data.power      = challenge.power;
    if (level >= 3) data.toughness  = challenge.toughness;
    if (level >= 4) data.rarity     = challenge.rarity;
    if (level >= 5) data.set_name   = challenge.set_name;
    if (level >= 6) data.type_line  = challenge.card_type;
    if (level >= 7 && !isCreature)  data.oracle_text = challenge.oracle_text;
    // art_q1–4 are visual zones only — the zone coordinates in the zones array
    // are all the frontend needs; there are no extra data fields to expose here

    res.json({ level, zones, data });
  } catch (err) {
    console.error('[/api/hint] Error:', err.message);
    res.status(500).json({ error: 'Failed to load hints' });
  }
});

module.exports = router;
