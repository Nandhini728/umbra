export function overlaps(first, second) {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}

export function movePlayer(player, room, deltaX, deltaY) {
  moveAxis(player, room, deltaX, "x");
  moveAxis(player, room, deltaY, "y");
}

function moveAxis(player, room, amount, axis) {
  if (!amount) return;
  const candidate = playerRect(player);
  candidate[axis] += amount;
  if (!insideBounds(candidate, room.bounds)) {
    player[axis] = clampPlayer(player[axis], player, room.bounds, axis);
    stopPlayer(player, axis);
    return;
  }

  for (const wall of room.walls) {
    if ((!wall.solidOnly || player.solid) && overlaps(candidate, wall)) {
      stopPlayer(player, axis);
      return;
    }
  }
  for (const gate of room.gates) {
    if (!gate.open && overlaps(candidate, gate)) {
      stopPlayer(player, axis);
      return;
    }
  }
  for (const block of room.blocks) {
    if (!overlaps(candidate, block)) continue;
    if (player.solid && tryPushBlock(block, amount, axis, room)) continue;
    stopPlayer(player, axis);
    return;
  }
  player[axis] += amount;
}

function tryPushBlock(block, amount, axis, room) {
  const next = { ...block, [axis]: block[axis] + amount };
  if (!insideBounds(next, room.bounds)) return false;
  if (room.walls.some((wall) => overlaps(next, wall))) return false;
  if (room.gates.some((gate) => !gate.open && overlaps(next, gate))) return false;
  if (room.blocks.some((other) => other !== block && overlaps(next, other))) return false;
  block[axis] += amount;
  return true;
}

export function updateSwitches(room, player) {
  for (const pressureSwitch of room.switches) {
    const pressed = player.solid && room.blocks.some((block) => overlaps(block, pressureSwitch));
    if (pressed) pressureSwitch.active = true;
    if (pressureSwitch.active) {
      for (const gate of room.gates) {
        if (gate.switchId === pressureSwitch.id) gate.open = true;
      }
    }
  }
}

export function findSolidHazard(player, room) {
  if (!player.solid) return null;
  const bounds = playerRect(player);
  return room.hazards.find((hazard) => overlaps(bounds, hazard)) ?? null;
}

export function playerRect(player) {
  return { x: player.x - player.width / 2, y: player.y - player.height / 2, width: player.width, height: player.height };
}

function insideBounds(rectangle, bounds) {
  return rectangle.x >= bounds.x && rectangle.y >= bounds.y
    && rectangle.x + rectangle.width <= bounds.x + bounds.width
    && rectangle.y + rectangle.height <= bounds.y + bounds.height;
}

function clampPlayer(position, player, bounds, axis) {
  if (axis === "x") return Math.max(bounds.x + player.width / 2, Math.min(position, bounds.x + bounds.width - player.width / 2));
  return Math.max(bounds.y + player.height / 2, Math.min(position, bounds.y + bounds.height - player.height / 2));
}

function stopPlayer(player, axis) {
  if (axis === "x") player.vx = 0;
  else player.vy = 0;
}