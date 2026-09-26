import { loadLevel, getLevelCount } from "./level.js";
import { createPlayer, updatePlayer, renderPlayer } from "./player.js";
import { aimLight, createLight, isPointLit, renderLight, updateLight } from "./light.js";
import { overlaps, playerRect, updateSwitches } from "./collision.js";
import { flashDamage, formatTime, initializeUI, setTransition, showState, showVictory, updateRoomHUD, waitForTransition } from "./ui.js";

const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const keys = new Set();
const roomCount = getLevelCount();
let state = "start";
let roomIndex = 0;
let room = null;
let player = null;
let light = null;
let lastFrame = 0;
let roomElapsed = 0;
let penaltyTime = 0;
let totalTime = 0;
let totalResets = 0;
let totalMoves = 0;
let completedRooms = 0;
let victoryTime = 0;
let instructionsShown = false;

initializeUI(roomCount);
showState("start");

function enterRoom(index) {
  roomIndex = index;
  room = loadLevel(index);
  player = createPlayer(room.start);
  light = createLight(room.lamp);
  roomElapsed = 0;
  penaltyTime = 0;
  updateRoomHUD(room, roomIndex, 0, totalMoves, totalResets, player.solid, completedRooms);
}

function beginRun() {
  totalTime = 0;
  totalResets = 0;
  totalMoves = 0;
  completedRooms = 0;
  initializeUI(roomCount);
  keys.clear();
  enterRoom(0);
  state = "playing";
  showState(state, instructionsShown ? null : "instructions");
}

function setPlaying() {
  state = "playing";
  showState(state);
  lastFrame = performance.now();
}

async function completeRoom() {
  if (state !== "playing") return;
  keys.clear();
  state = "roomComplete";
  setTransition(true);
  await waitForTransition();
  completedRooms = roomIndex + 1;
  if (roomIndex + 1 === roomCount) {
    const rating = totalTime < 210 && totalResets <= 2 ? 3 : totalTime < 340 && totalResets <= 7 ? 2 : 1;
    state = "victory";
    victoryTime = 0;
    showVictory(totalTime, totalResets, rating);
    setTransition(false);
    return;
  }
  enterRoom(roomIndex + 1);
  setTransition(false);
  await waitForTransition();
  keys.clear();
  state = "playing";
  showState(state);
}

function resetPlayer() {
  player.x = room.start.x;
  player.y = room.start.y;
  player.vx = 0;
  player.vy = 0;
  player.solid = false;
  player.solidity = 0;
  player.sparks.length = 0;
}

function handleHazard() {
  resetPlayer();
  totalResets += 1;
  penaltyTime += 2.5;
  totalTime += 2.5;
  flashDamage();
}

function update(delta) {
  if (state === "playing" && document.querySelector("#instruction-screen").hidden) {
    roomElapsed += delta;
    totalTime += delta;
    updateLight(light, delta);
    const hazard = updatePlayer(player, keys, room, light, delta);
    updateSwitches(room, player);

    if (hazard) handleHazard();
    if (room.timeLimit && roomElapsed + penaltyTime >= room.timeLimit) {
      resetPlayer();
      totalResets += 1;
      totalTime += 5;
      roomElapsed = 0;
      penaltyTime = 0;
      flashDamage();
    }
    if (overlaps(playerRect(player), room.goal)) completeRoom();

    const shownTime = room.timeLimit
      ? room.timeLimit - roomElapsed - penaltyTime
      : roomElapsed + penaltyTime;
    updateRoomHUD(room, roomIndex, shownTime, totalMoves, totalResets, player.solid, completedRooms);
  }
  if (state === "victory") victoryTime += delta;
}

function render(time) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#0b0e1a";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const backdrop = context.createRadialGradient(480, 300, 25, 480, 300, 550);
  backdrop.addColorStop(0, "rgba(42, 49, 72, 0.35)");
  backdrop.addColorStop(1, "rgba(5, 7, 13, 0.72)");
  context.fillStyle = backdrop;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (!room) {
    drawStartTexture(time);
    return;
  }

  drawRoom(time);
  if (state === "victory") drawVictoryFlood();
}

function drawStartTexture(time) {
  context.strokeStyle = "rgba(185, 197, 225, 0.08)";
  context.lineWidth = 1;
  for (let x = 80; x < 960; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 600);
    context.stroke();
  }
  const x = 480 + Math.sin(time / 2800) * 55;
  const y = 294 + Math.cos(time / 3400) * 26;
  const glow = context.createRadialGradient(x, y, 2, x, y, 300);
  glow.addColorStop(0, "rgba(255, 179, 71, 0.12)");
  glow.addColorStop(0.5, "rgba(123, 143, 255, 0.045)");
  glow.addColorStop(1, "rgba(123, 143, 255, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(255, 220, 166, 0.82)";
  context.beginPath();
  context.arc(x, y, 4, 0, Math.PI * 2);
  context.fill();
}

function drawRoom(time) {
  context.fillStyle = "rgba(18, 22, 37, 0.76)";
  context.fillRect(room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height);
  context.strokeStyle = "rgba(177, 190, 221, 0.16)";
  context.lineWidth = 1;
  for (let x = room.bounds.x + 16; x < room.bounds.x + room.bounds.width; x += 32) {
    context.beginPath();
    context.moveTo(x, room.bounds.y);
    context.lineTo(x, room.bounds.y + room.bounds.height);
    context.stroke();
  }

  for (const hazard of room.hazards) drawHazard(hazard, time);
  for (const wall of room.walls) drawWall(wall, time);
  for (const block of room.blocks) drawBlock(block);
  for (const pressureSwitch of room.switches) drawSwitch(pressureSwitch, time);
  for (const gate of room.gates) drawGate(gate, time);
  drawGoal(room.goal, time);
  if (light.moving) drawLampPath();
  renderLight(context, light);
  renderPlayer(context, player);

  const vignette = context.createRadialGradient(480, 300, 180, 480, 300, 590);
  vignette.addColorStop(0, "rgba(3, 5, 12, 0)");
  vignette.addColorStop(1, "rgba(3, 5, 12, 0.5)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawWall(wall, time) {
  const phantomOnly = Boolean(wall.solidOnly);
  context.fillStyle = phantomOnly ? "rgba(74, 91, 161, 0.46)" : "rgba(29, 35, 53, 0.98)";
  context.fillRect(wall.x, wall.y, wall.width, wall.height);
  context.strokeStyle = phantomOnly ? "rgba(129, 150, 255, 0.68)" : "rgba(148, 161, 190, 0.28)";
  context.lineWidth = 1;
  context.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.width - 1, wall.height - 1);
  if (phantomOnly) {
    context.save();
    context.beginPath();
    context.rect(wall.x, wall.y, wall.width, wall.height);
    context.clip();
    context.strokeStyle = `rgba(156, 171, 255, ${0.18 + Math.sin(time / 240) * 0.05})`;
    for (let offset = -wall.height; offset < wall.width; offset += 10) {
      context.beginPath();
      context.moveTo(wall.x + offset, wall.y + wall.height);
      context.lineTo(wall.x + offset + wall.height, wall.y);
      context.stroke();
    }
    context.restore();
  }
}

function drawHazard(hazard, time) {
  context.fillStyle = "rgba(102, 35, 45, 0.36)";
  context.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
  context.save();
  context.beginPath();
  context.rect(hazard.x, hazard.y, hazard.width, hazard.height);
  context.clip();
  context.strokeStyle = `rgba(255, 103, 99, ${0.3 + Math.sin(time / 180) * 0.08})`;
  context.lineWidth = 1;
  for (let offset = -hazard.height; offset < hazard.width; offset += 14) {
    context.beginPath();
    context.moveTo(hazard.x + offset, hazard.y + hazard.height);
    context.lineTo(hazard.x + offset + hazard.height, hazard.y);
    context.stroke();
  }
  context.restore();
}

function drawBlock(block) {
  context.fillStyle = "#222a3a";
  context.fillRect(block.x, block.y, block.width, block.height);
  context.strokeStyle = "rgba(198, 205, 220, 0.62)";
  context.lineWidth = 1;
  context.strokeRect(block.x + 0.5, block.y + 0.5, block.width - 1, block.height - 1);
  context.fillStyle = "rgba(255, 179, 71, 0.13)";
  context.fillRect(block.x + 5, block.y + 5, block.width - 10, block.height - 10);
  context.strokeStyle = "rgba(255, 179, 71, 0.5)";
  context.strokeRect(block.x + 7, block.y + 7, block.width - 14, block.height - 14);
}

function drawSwitch(pressureSwitch, time) {
  const active = pressureSwitch.active;
  context.fillStyle = active ? "rgba(255, 179, 71, 0.28)" : "rgba(17, 22, 36, 0.92)";
  context.fillRect(pressureSwitch.x, pressureSwitch.y, pressureSwitch.width, pressureSwitch.height);
  context.strokeStyle = active ? "#ffc16b" : "rgba(176, 188, 213, 0.62)";
  context.strokeRect(pressureSwitch.x + 0.5, pressureSwitch.y + 0.5, pressureSwitch.width - 1, pressureSwitch.height - 1);
  context.fillStyle = active ? "#ffca7d" : `rgba(123, 143, 255, ${0.5 + Math.sin(time / 380) * 0.14})`;
  context.beginPath();
  context.arc(pressureSwitch.x + pressureSwitch.width / 2, pressureSwitch.y + pressureSwitch.height / 2, active ? 4 : 3, 0, Math.PI * 2);
  context.fill();
}

function drawGate(gate, time) {
  if (gate.open) {
    context.strokeStyle = `rgba(255, 179, 71, ${0.24 + Math.sin(time / 280) * 0.1})`;
    context.setLineDash([4, 6]);
    context.strokeRect(gate.x + 4, gate.y, gate.width - 8, gate.height);
    context.setLineDash([]);
    return;
  }
  context.fillStyle = "rgba(117, 89, 55, 0.8)";
  context.fillRect(gate.x, gate.y, gate.width, gate.height);
  context.strokeStyle = "rgba(255, 190, 105, 0.7)";
  context.strokeRect(gate.x + 0.5, gate.y + 0.5, gate.width - 1, gate.height - 1);
}

function drawGoal(goal, time) {
  const pulse = 0.6 + Math.sin(time / 340) * 0.12;
  context.save();
  context.shadowBlur = 20;
  context.shadowColor = "#ffb347";
  context.strokeStyle = `rgba(255, 190, 111, ${pulse})`;
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(goal.x, goal.y, goal.width, goal.height, 22);
  context.stroke();
  context.shadowBlur = 0;
  context.fillStyle = "rgba(255, 179, 71, 0.12)";
  context.fillRect(goal.x + 5, goal.y + 5, Math.max(1, goal.width - 10), goal.height - 10);
  context.restore();
}

function drawLampPath() {
  context.save();
  context.setLineDash([3, 10]);
  context.strokeStyle = "rgba(255, 203, 138, 0.28)";
  context.beginPath();
  light.path.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.closePath();
  context.stroke();
  context.restore();
}

function drawVictoryFlood() {
  const radius = Math.min(850, victoryTime * 230);
  const flood = context.createRadialGradient(480, 300, 0, 480, 300, Math.max(1, radius));
  flood.addColorStop(0, `rgba(255, 238, 209, ${Math.min(0.9, victoryTime * 0.3)})`);
  flood.addColorStop(0.4, `rgba(255, 179, 71, ${Math.min(0.5, victoryTime * 0.16)})`);
  flood.addColorStop(1, "rgba(123, 143, 255, 0)");
  context.fillStyle = flood;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function pointerPosition(event) {
  const rectangle = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rectangle.left) * canvas.width / rectangle.width,
    y: (event.clientY - rectangle.top) * canvas.height / rectangle.height,
  };
}

canvas.addEventListener("pointermove", (event) => {
  if (!light) return;
  const pointer = pointerPosition(event);
  aimLight(light, pointer.x, pointer.y);
});
canvas.addEventListener("pointerdown", (event) => {
  if (!light) return;
  const pointer = pointerPosition(event);
  aimLight(light, pointer.x, pointer.y);
});

document.querySelector("#begin-button").addEventListener("click", beginRun);
document.querySelector("#instruction-continue").addEventListener("click", () => {
  instructionsShown = true;
  keys.clear();
  setPlaying();
});
document.querySelector("#resume-button").addEventListener("click", () => {
  keys.clear();
  setPlaying();
});
document.querySelector("#play-again-button").addEventListener("click", () => {
  state = "start";
  room = null;
  keys.clear();
  showState(state);
});
document.querySelector("#pause-button").addEventListener("click", () => {
  if (state !== "playing" || !document.querySelector("#instruction-screen").hidden) return;
  keys.clear();
  state = "paused";
  showState(state, "pause");
});

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (event.key === "Escape") {
    if (state === "playing" && document.querySelector("#instruction-screen").hidden) {
      keys.clear();
      state = "paused";
      showState(state, "pause");
    } else if (state === "paused") {
      setPlaying();
    }
    return;
  }
  if (state !== "playing" || !document.querySelector("#instruction-screen").hidden) return;
  if (!keys.has(event.key) && !event.repeat && /^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|[wasd])$/i.test(event.key)) {
    totalMoves += 1;
  }
  keys.add(event.key);
});
document.addEventListener("keyup", (event) => keys.delete(event.key));
window.addEventListener("blur", () => keys.clear());

function frame(timestamp) {
  const delta = Math.min((timestamp - lastFrame) / 1000 || 0, 0.05);
  lastFrame = timestamp;
  update(delta);
  render(timestamp);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
