export function createLight(config) {
  const start = { x: config.x, y: config.y };
  return {
    x: start.x,
    y: start.y,
    targetX: start.x,
    targetY: start.y,
    radius: config.radius ?? 180,
    moving: config.path?.length > 1,
    path: config.path ?? [],
    period: config.period ?? 8,
    phase: 0,
  };
}

export function aimLight(light, x, y) {
  if (light.moving) return;
  light.targetX = x;
  light.targetY = y;
}

export function updateLight(light, delta) {
  if (light.moving) {
    light.phase = (light.phase + delta / light.period) % 1;
    const scaled = light.phase * light.path.length;
    const index = Math.floor(scaled) % light.path.length;
    const next = (index + 1) % light.path.length;
    const progress = scaled - Math.floor(scaled);
    const eased = progress * progress * (3 - 2 * progress);
    light.targetX = light.path[index].x + (light.path[next].x - light.path[index].x) * eased;
    light.targetY = light.path[index].y + (light.path[next].y - light.path[index].y) * eased;
  }
  const easing = 1 - Math.exp(-delta * 8);
  light.x += (light.targetX - light.x) * easing;
  light.y += (light.targetY - light.y) * easing;
}

export function isPointLit(light, x, y, room) {
  if (Math.hypot(light.x - x, light.y - y) > light.radius) return false;
  for (const rectangle of room.occluders) {
    if (segmentIntersectsRect(light.x, light.y, x, y, rectangle)) return false;
  }
  return true;
}

function segmentIntersectsRect(x1, y1, x2, y2, rectangle) {
  // Clip the lamp-to-player segment against the rectangle without sampling ray points.
  const dx = x2 - x1;
  const dy = y2 - y1;
  let minimum = 0;
  let maximum = 1;
  const clips = [
    [-dx, x1 - rectangle.x],
    [dx, rectangle.x + rectangle.width - x1],
    [-dy, y1 - rectangle.y],
    [dy, rectangle.y + rectangle.height - y1],
  ];

  for (const [denominator, numerator] of clips) {
    if (denominator === 0) {
      if (numerator < 0) return false;
      continue;
    }
    const amount = numerator / denominator;
    if (denominator < 0) minimum = Math.max(minimum, amount);
    else maximum = Math.min(maximum, amount);
    if (minimum > maximum) return false;
  }
  return maximum > 0.002 && minimum < 0.998;
}

export function renderLight(context, light) {
  context.save();
  context.globalCompositeOperation = "screen";
  const glow = context.createRadialGradient(light.x, light.y, 2, light.x, light.y, light.radius);
  glow.addColorStop(0, "rgba(255, 192, 111, 0.2)");
  glow.addColorStop(0.28, "rgba(255, 176, 92, 0.12)");
  glow.addColorStop(0.62, "rgba(141, 154, 255, 0.055)");
  glow.addColorStop(1, "rgba(123, 143, 255, 0)");
  context.fillStyle = glow;
  context.beginPath();
  context.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
  context.fill();

  const core = context.createRadialGradient(light.x, light.y, 1, light.x, light.y, 22);
  core.addColorStop(0, "rgba(255, 227, 182, 0.92)");
  core.addColorStop(0.25, "rgba(255, 185, 100, 0.55)");
  core.addColorStop(1, "rgba(255, 179, 71, 0)");
  context.fillStyle = core;
  context.beginPath();
  context.arc(light.x, light.y, 22, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(255, 224, 177, 0.64)";
  context.lineWidth = 1;
  context.beginPath();
  context.arc(light.x, light.y, 6, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}