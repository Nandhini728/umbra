const BOUNDS = { x: 38, y: 64, width: 884, height: 472 };
const HALL_WALLS = [
  { x: 70, y: 150, width: 820, height: 26 },
  { x: 70, y: 424, width: 820, height: 26 },
  { x: 70, y: 176, width: 26, height: 248 },
  { x: 864, y: 176, width: 26, height: 248 },
];
const NARROW_HALL = [
  { x: 70, y: 200, width: 820, height: 26 },
  { x: 70, y: 374, width: 820, height: 26 },
  { x: 70, y: 226, width: 26, height: 148 },
  { x: 864, y: 226, width: 26, height: 148 },
];

export const LEVEL_DATA = [
  {
    id: 1,
    name: "The First Light",
    mechanic: "A wall gives way to the unseen.",
    bounds: BOUNDS,
    start: { x: 120, y: 300 },
    goal: { x: 832, y: 274, width: 46, height: 54 },
    lamp: { x: 145, y: 300, radius: 182 },
    walls: [...HALL_WALLS, { x: 470, y: 176, width: 24, height: 104 }, { x: 470, y: 320, width: 24, height: 104 }],
    solidOnlyWalls: [{ x: 470, y: 280, width: 24, height: 40 }],
    occluders: [...HALL_WALLS, { x: 470, y: 176, width: 24, height: 104 }, { x: 470, y: 320, width: 24, height: 104 }],
    hazards: [], blocks: [], switches: [], gates: [],
  },
  {
    id: 2,
    name: "A Tender Burn",
    mechanic: "Only the real can be hurt.",
    bounds: BOUNDS,
    start: { x: 120, y: 300 },
    goal: { x: 832, y: 274, width: 46, height: 54 },
    lamp: { x: 145, y: 300, radius: 182 },
    walls: HALL_WALLS,
    occluders: HALL_WALLS,
    hazards: [{ x: 310, y: 178, width: 112, height: 246 }, { x: 594, y: 178, width: 92, height: 246 }],
    blocks: [], switches: [], gates: [],
  },
  {
    id: 3,
    name: "Weight of Being",
    mechanic: "Some things move only when you are real.",
    bounds: BOUNDS,
    start: { x: 120, y: 300 },
    goal: { x: 812, y: 274, width: 46, height: 54 },
    lamp: { x: 145, y: 300, radius: 182 },
    walls: NARROW_HALL,
    occluders: NARROW_HALL,
    hazards: [{ x: 260, y: 226, width: 104, height: 148 }],
    blocks: [{ id: "weight", x: 488, y: 228, width: 48, height: 144 }],
    switches: [], gates: [],
  },
  {
    id: 4,
    name: "Held Open",
    mechanic: "A weight can hold a door open.",
    bounds: BOUNDS,
    start: { x: 120, y: 300 },
    goal: { x: 844, y: 274, width: 34, height: 54 },
    lamp: { x: 145, y: 300, radius: 190 },
    walls: NARROW_HALL,
    occluders: NARROW_HALL,
    hazards: [{ x: 244, y: 226, width: 86, height: 148 }],
    blocks: [{ id: "weight", x: 390, y: 228, width: 48, height: 144 }],
    switches: [{ id: "plate", x: 588, y: 282, width: 28, height: 36, active: false }],
    gates: [{ id: "door", switchId: "plate", x: 730, y: 226, width: 22, height: 148, open: false }],
  },
  {
    id: 5,
    name: "Borrowed Light",
    mechanic: "The lamp follows a rhythm of its own.",
    bounds: BOUNDS,
    start: { x: 120, y: 300 },
    goal: { x: 844, y: 274, width: 34, height: 54 },
    lamp: { x: 120, y: 300, radius: 192, period: 10, path: [{ x: 120, y: 300 }, { x: 850, y: 300 }] },
    walls: NARROW_HALL,
    occluders: NARROW_HALL,
    hazards: [{ x: 244, y: 226, width: 86, height: 148 }],
    blocks: [{ id: "weight", x: 390, y: 228, width: 48, height: 144 }],
    switches: [{ id: "plate", x: 588, y: 282, width: 28, height: 36, active: false }],
    gates: [{ id: "door", switchId: "plate", x: 730, y: 226, width: 22, height: 148, open: false }],
  },
  {
    id: 6,
    name: "The Narrowing",
    mechanic: "Everything you have learned, with less room.",
    bounds: BOUNDS,
    start: { x: 116, y: 300 },
    goal: { x: 852, y: 274, width: 26, height: 54 },
    lamp: { x: 116, y: 300, radius: 205, period: 9, path: [{ x: 116, y: 300 }, { x: 846, y: 300 }] },
    walls: [...NARROW_HALL, { x: 632, y: 226, width: 24, height: 48 }, { x: 632, y: 326, width: 24, height: 48 }],
    solidOnlyWalls: [{ x: 632, y: 274, width: 24, height: 52 }],
    occluders: [...NARROW_HALL, { x: 632, y: 226, width: 24, height: 48 }, { x: 632, y: 326, width: 24, height: 48 }],
    hazards: [{ x: 210, y: 226, width: 72, height: 148 }, { x: 680, y: 226, width: 72, height: 148 }],
    blocks: [{ id: "weight", x: 390, y: 228, width: 48, height: 144 }],
    switches: [{ id: "plate", x: 552, y: 282, width: 28, height: 36, active: false }],
    gates: [{ id: "door", switchId: "plate", x: 790, y: 226, width: 22, height: 148, open: false }],
  },
  {
    id: 7,
    name: "Convergence",
    mechanic: "There is no time to waste.",
    bounds: BOUNDS,
    start: { x: 112, y: 300 },
    goal: { x: 854, y: 274, width: 24, height: 54 },
    lamp: { x: 112, y: 300, radius: 174 },
    walls: [...HALL_WALLS, { x: 408, y: 176, width: 24, height: 104 }, { x: 408, y: 320, width: 24, height: 104 }, { x: 690, y: 176, width: 24, height: 76 }, { x: 690, y: 348, width: 24, height: 76 }],
    solidOnlyWalls: [{ x: 408, y: 280, width: 24, height: 40 }, { x: 690, y: 252, width: 24, height: 96 }],
    occluders: [...HALL_WALLS, { x: 408, y: 176, width: 24, height: 104 }, { x: 408, y: 320, width: 24, height: 104 }, { x: 690, y: 176, width: 24, height: 76 }, { x: 690, y: 348, width: 24, height: 76 }],
    hazards: [{ x: 240, y: 178, width: 88, height: 246 }, { x: 520, y: 178, width: 92, height: 246 }],
    blocks: [], switches: [], gates: [], timeLimit: 48,
  },
];

export function loadLevel(index) {
  const data = LEVEL_DATA[index];
  if (!data) throw new RangeError(`No UMBRA room at index ${index}`);
  // Each visit gets mutable blocks, switches, and gates without changing the source data.
  const room = JSON.parse(JSON.stringify(data));
  room.walls = [...room.walls, ...(room.solidOnlyWalls ?? []).map((wall) => ({ ...wall, solidOnly: true }))];
  room.occluders ??= [];
  room.hazards ??= [];
  room.blocks ??= [];
  room.switches ??= [];
  room.gates ??= [];
  for (const rectangle of [...room.walls, ...room.hazards, ...room.blocks, ...room.switches, ...room.gates, room.goal]) {
    if (!(rectangle.width > 0 && rectangle.height > 0)) throw new TypeError(`Room ${room.id} contains an invalid rectangle`);
  }
  return room;
}

export function getLevelCount() {
  return LEVEL_DATA.length;
}