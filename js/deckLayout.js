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
    { x: 360, y: 155, frame: 9 }
  ],

  coverSpots: [
    { x: 480, y: 540, frame: 0 },
    { x: 360, y: 620, frame: 1 },
    { x: 430, y: 580, frame: 2 },
    { x: 400, y: 380, frame: 3 },
    { x: 450, y: 900, frame: 9 },
    { x: 500, y: 720, frame: 10 },
    { x: 552, y: 560, frame: 2 }
  ],

  storageDecorations: [
    { room: 'storage1', type: 'cover', nx: 0.32, ny: 0.42, frame: 4 },
    { room: 'storage1', type: 'barrel', nx: 0.58, ny: 0.30, frame: 4 },
    { room: 'storage1', type: 'pile', nx: 0.74, ny: 0.54, frame: 0 },
    { room: 'storage1', type: 'barrel', nx: 0.40, ny: 0.74, frame: 5 },
    { room: 'storage2', type: 'cover', nx: 0.34, ny: 0.40, frame: 5 },
    { room: 'storage2', type: 'barrel', nx: 0.60, ny: 0.28, frame: 6 },
    { room: 'storage2', type: 'pile', nx: 0.76, ny: 0.52, frame: 1 },
    { room: 'storage2', type: 'barrel', nx: 0.42, ny: 0.72, frame: 7 }
  ],

  captainPatrol: [
    { x: 615, y: 468 },
    { x: 745, y: 468 },
    { x: 745, y: 545 },
    { x: 680, y: 598 },
    { x: 615, y: 598 }
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
      zone: 'acesso-capitao',
      speed: 48,
      wpStart: 0,
      waitMs: 750,
      wp: [
        { x: 522, y: 458 },
        { x: 522, y: 520 },
        { x: 522, y: 585 },
        { x: 522, y: 648 },
        { x: 512, y: 648 },
        { x: 512, y: 585 },
        { x: 512, y: 520 },
        { x: 512, y: 458 }
      ]
    },
    {
      zone: 'centro-esq',
      speed: 54,
      wpStart: 0,
      waitMs: 450,
      wp: patrolZoneRect(455, 620, 'edge', 395)
    },
    {
      zone: 'centro-dir',
      speed: 56,
      wpStart: 1,
      waitMs: 550,
      reverse: true,
      wp: patrolZoneRect(445, 665, 435, 'edge')
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
      speed: 52,
      wpStart: 3,
      waitMs: 1100,
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

function storageSpot(roomKey, nx, ny) {
  const room = DECK_LAYOUT[roomKey];
  if (!room) return { x: 0, y: 0 };

  const padX = 28;
  const padY = 22;
  const innerW = Math.max(40, room.w - padX * 2);
  const innerH = Math.max(40, room.h - padY * 2);

  return {
    x: Math.round(room.x + padX + innerW * Phaser.Math.Clamp(nx, 0, 1)),
    y: Math.round(room.y + padY + innerH * Phaser.Math.Clamp(ny, 0, 1))
  };
}

DECK_LAYOUT.deckPatrols = buildDeckPatrols();
