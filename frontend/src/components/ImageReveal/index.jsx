import React from 'react';

// Matches ZONES.artist in backend/routes/hint.js — always visible
const ARTIST_ZONE = { id: 'artist', x: 12, y: 95, w: 34, h: 4 };

const ImageReveal = ({ imageUrl, zones, revealed }) => {
  // zones comes from hints?.zones (includes artist + unlocked sections).
  // Before any hint is requested, fall back to just the artist strip.
  const allZones = zones ?? [ARTIST_ZONE];

  if (!imageUrl) return <div className="image-reveal image-reveal--empty" />;

  // Full reveal on correct guess — skip blur entirely
  if (revealed) {
    return (
      <div className="image-reveal">
        <img
          src={imageUrl}
          alt="Daily Magic: The Gathering card"
          className="card-img"
        />
      </div>
    );
  }

  return (
    <div className="image-reveal">
      {/* Layer 1 — full blurred card */}
      <img
        src={imageUrl}
        alt="Daily Magic: The Gathering card"
        className="card-img card-img--blurred"
      />

      {/*
        SVG clip path — defines which regions to cut through the blur.
        clipPathUnits="objectBoundingBox" means x/y/w/h are fractions of
        the clipped element's bounding box (divide % by 100).
      */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: 'absolute', overflow: 'visible' }}
      >
        <defs>
          <clipPath id="reveal-clip" clipPathUnits="objectBoundingBox">
            {allZones.map(zone => (
              <rect
                key={zone.id}
                x={zone.x / 100}
                y={zone.y / 100}
                width={zone.w / 100}
                height={zone.h / 100}
              />
            ))}
          </clipPath>
        </defs>
      </svg>

      {/* Layer 2 — sharp card, visible only through the clip regions */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="card-img card-img--sharp"
        style={{ clipPath: 'url(#reveal-clip)' }}
      />
    </div>
  );
};

export default ImageReveal;
