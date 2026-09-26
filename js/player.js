import { movePlayer, findSolidHazard } from "./collision.js";
import { isPointLit } from "./light.js";

const PLAYER_WIDTH = 22;
const PLAYER_HEIGHT = 27;

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    vx: 0,
    vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    solid: false,
    solidity: 0,
    switchPulse: 0,
    sparks: [],
  };
}

export function updatePlayer(player, keys, room, light, delta) {
  const horizontal = Number(keys.has("ArrowRight") || keys.has("d") || keys.has("D")) - Number(keys.has("ArrowLeft") || keys.has("a") || keys.has("A"));
  const vertical = Number(keys.has("ArrowDown") || keys.has("s") || keys.has("S")) - Number(keys.has("ArrowUp") || keys.has("w") || keys.has("W"));
  const magnitude = Math.hypot(horizontal, vertical) || 1;
  const acceleration = 1050;
  const friction = 950;
  const maxSpeed = 205;

  if (horizontal || vertical) {
    player.vx += horizontal / magnitude * acceleration * delta;
    player.vy += vertical / magnitude * acceleration * delta;
    const speed = Math.hypot(player.vx, player.vy);
    if (speed > maxSpeed) {
      player.vx = player.vx / speed * maxSpeed;
      player.vy = player.vy / speed * maxSpeed;
    }
  } else {
    const speed = Math.hypot(player.vx, player.vy);
    const nextSpeed = Math.max(0, speed - friction * delta);
    const ratio = speed === 0 ? 0 : nextSpeed / speed;
    player.vx *= ratio;
    player.vy *= ratio;
  }

  const wasSolid = player.solid;
  player.solid = isPointLit(light, player.x, player.y, room);
  if (wasSolid !== player.solid) {
    player.switchPulse = 0.2;
    for (let index = 0; index < 10; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 22 + Math.random() * 75;
      player.sparks.push({ x: player.x, y: player.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.28 + Math.random() * 0.16, maxLife: 0.44 });
    }
  }

  player.solidity += ((player.solid ? 1 : 0) - player.solidity) * Math.min(1, delta * 8);
  player.switchPulse = Math.max(0, player.switchPulse - delta);
  movePlayer(player, room, player.vx * delta, player.vy * delta);

  for (const spark of player.sparks) {
    spark.x += spark.vx * delta;
    spark.y += spark.vy * delta;
    spark.vx *= 0.9;
    spark.vy *= 0.9;
    spark.life -= delta;
  }
  player.sparks = player.sparks.filter((spark) => spark.life > 0);
  return findSolidHazard(player, room);
}

export function renderPlayer(context, player) {
  const amount = player.solidity;
  const red = Math.round(123 + (255 - 123) * amount);
  const green = Math.round(143 + (179 - 143) * amount);
  const blue = Math.round(255 + (71 - 255) * amount);
  const alpha = 0.54 + amount * 0.46;
  const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;

  context.save();
  context.shadowBlur = 19 + player.switchPulse * 32;
  context.shadowColor = player.solid ? "#ffb347" : "#7b8fff";
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height, 8);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = "rgba(11, 14, 26, 0.82)";
  context.fillRect(player.x - 4, player.y - 3, 2, 2);
  context.fillRect(player.x + 2, player.y - 3, 2, 2);
  for (const spark of player.sparks) {
    context.globalAlpha = Math.min(1, spark.life / 0.2);
    context.fillStyle = player.solid ? "#ffd39a" : "#c3cbff";
    context.fillRect(spark.x - 1.5, spark.y - 1.5, 3, 3);
  }
  context.restore();
}