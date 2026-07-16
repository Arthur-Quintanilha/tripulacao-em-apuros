const DECK_LAYOUT = {
  worldW: 960,
  worldH: 1320,
  hullCx: 480,

  bow: { x: 380, y: 40, w: 200, h: 210 },

  openDeck: { x: 175, y: 240, w: 395, h: 820 },

  captainRoom: { x: 580, y: 438, w: 200, h: 200 },
  storage1: { x: 580, y: 648, w: 200, h: 160 },
  storage2: { x: 580, y: 818, w: 200, h: 165 },

  corridor: { x: 395, y: 1040, w: 170, h: 280 },

  playerStart: { x: 480, y: 1235 },
  holdAccess: { x: 480, y: 1285 },

  captainDoor: { x: 580, y: 538 },

  bowGate: { x: 480, y: 258 },

  captainDesk: { x: 680, y: 538 },
  keys: { x: 680, y: 502 },

  lifeboat: { x: 480, y: 108 },

  mast: { x: 480, y: 650, scale: 0.34 },

  pileSpots: [
    { x: 400, y: 320, frame: 0 },
    { x: 520, y: 300, frame: 1 },
    { x: 350, y: 480, frame: 2 },
    { x: 520, y: 430, frame: 3 },
    { x: 410, y: 610, frame: 4 },
    { x: 520, y: 680, frame: 5 },
    { x: 420, y: 800, frame: 6 },
    { x: 545, y: 830, frame: 7 }
  ],

  barrelSpots: [
    { x: 450, y: 960, frame: 0 },
    { x: 500, y: 780, frame: 1 },
    { x: 380, y: 700, frame: 2 },
    { x: 500, y: 380, frame: 3 },
    { x: 360, y: 155, frame: 9 },
    { x: 720, y: 700, frame: 6 },
    { x: 710, y: 860, frame: 7 },
    { x: 730, y: 920, frame: 8 }
  ],

  coverSpots: [
    { x: 480, y: 540, frame: 0 },
    { x: 360, y: 620, frame: 1 },
    { x: 430, y: 580, frame: 2 },
    { x: 400, y: 380, frame: 3 },
    { x: 450, y: 900, frame: 9 },
    { x: 500, y: 720, frame: 10 }
  ],

  captainPatrol: [
    { x: 615, y: 473 },
    { x: 745, y: 473 },
    { x: 745, y: 603 },
    { x: 615, y: 603 }
  ],

  deckPatrols: null
};

const HULL_BODY_MARGIN = 8;
const PATROL_HULL_MARGIN = 12;
const PATROL_DECK_RIGHT = 562;

function getHullHalfWidth(y) {
  const Y = Phaser.Math.Clamp(y, 0, DECK_LAYOUT.worldH);

  if (Y < 160) return 108 + (Y / 160) * 36;
  if (Y < 320) return 144 + ((Y - 160) / 160) * 156;
  if (Y < 960) return 300;
  if (Y < 1120) return 300 - ((Y - 960) / 160) * 100;
  return 200 - ((Y - 1120) / 200) * 80;
}

function getHullInnerHalfWidth(y, margin = HULL_BODY_MARGIN) {
  return Math.max(28, getHullHalfWidth(y) - margin);
}

function getPatrolEdgeX(y, side) {
  const cx = DECK_LAYOUT.hullCx;
  const hw = getHullInnerHalfWidth(y, PATROL_HULL_MARGIN);

  if (side === 'left') return Math.round(cx - hw);
  return Math.round(Math.min(cx + hw, PATROL_DECK_RIGHT));
}

function patrolZoneRect(topY, bottomY, leftX, rightX) {
  const lTop = leftX === 'edge' ? getPatrolEdgeX(topY, 'left') : leftX;
  const lBot = leftX === 'edge' ? getPatrolEdgeX(bottomY, 'left') : leftX;
  const rTop = rightX === 'edge' ? getPatrolEdgeX(topY, 'right') : rightX;
  const rBot = rightX === 'edge' ? getPatrolEdgeX(bottomY, 'right') : rightX;

  return [
    { x: lTop, y: topY },
    { x: rTop, y: topY },
    { x: rBot, y: bottomY },
    { x: lBot, y: bottomY },
    { x: lTop, y: topY }
  ];
}

function buildDeckPatrols() {
  return [
    {
      zone: 'proa',
      speed: 54,
      wpStart: 0,
      waitMs: 0,
      wp: patrolZoneRect(268, 358, 'edge', 'edge')
    },
    {
      zone: 'centro-esq',
      speed: 56,
      wpStart: 0,
      waitMs: 300,
      wp: patrolZoneRect(472, 608, 'edge', 390)
    },
    {
      zone: 'centro-dir',
      speed: 60,
      wpStart: 2,
      waitMs: 700,
      reverse: true,
      wp: patrolZoneRect(492, 638, 425, 'edge')
    },
    {
      zone: 'popa-esq',
      speed: 50,
      wpStart: 1,
      waitMs: 900,
      wp: patrolZoneRect(792, 948, 'edge', 385)
    },
    {
      zone: 'popa-dir',
      speed: 54,
      wpStart: 3,
      waitMs: 1200,
      reverse: true,
      wp: patrolZoneRect(812, 968, 420, 'edge')
    }
  ].map((route) => {
    const spawn = route.wp[route.wpStart ?? 0];
    return { ...route, x: spawn.x, y: spawn.y };
  });
}

function clampSpriteToHull(sprite, options = {}) {
  const margin = options.margin ?? HULL_BODY_MARGIN;
  const L = DECK_LAYOUT;
  const cx = L.hullCx;
  const minY = 44;
  const maxY = L.worldH - 44;

  let y = Phaser.Math.Clamp(sprite.y, minY, maxY);
  const hw = getHullInnerHalfWidth(y, margin);
  let x = Phaser.Math.Clamp(sprite.x, cx - hw, cx + hw);

  if (sprite.body) {
    if (x !== sprite.x && sprite.body.velocity) sprite.body.velocity.x = 0;
    if (y !== sprite.y && sprite.body.velocity) sprite.body.velocity.y = 0;
  }

  sprite.setPosition(x, y);
}

function deckRect(zone) {
  return new Phaser.Geom.Rectangle(zone.x, zone.y, zone.w, zone.h);
}

DECK_LAYOUT.deckPatrols = buildDeckPatrols();
