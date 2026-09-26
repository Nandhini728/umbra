const hud = document.querySelector("#hud");
const screens = {
  start: document.querySelector("#start-screen"),
  instructions: document.querySelector("#instruction-screen"),
  pause: document.querySelector("#pause-screen"),
  victory: document.querySelector("#victory-screen"),
};
const transitionShade = document.querySelector("#transition-shade");
const stage = document.querySelector(".stage-wrap");
const pauseButton = document.querySelector("#pause-button");
const progressDots = document.querySelector("#progress-dots");
let previousRoomId = null;

export function initializeUI(roomCount) {
  progressDots.replaceChildren(...Array.from({ length: roomCount }, () => document.createElement("i")));
  previousRoomId = null;
}

export function showState(state, overlay = null) {
  for (const screen of Object.values(screens)) screen.hidden = true;
  if (state === "start") screens.start.hidden = false;
  if (overlay) screens[overlay].hidden = false;
  hud.hidden = state === "start" || state === "victory";
  pauseButton.hidden = state !== "playing";
  if (state !== "victory") stage.classList.remove("victory-flood");
}

export function updateRoomHUD(room, roomIndex, elapsed, moves, resets, solid, completed) {
  document.querySelector("#room-index").textContent = `ROOM ${String(room.id).padStart(2, "0")}`;
  document.querySelector("#room-name").textContent = room.name;
  document.querySelector("#timer").textContent = formatTime(elapsed);
  document.querySelector("#move-count").textContent = String(moves);
  document.querySelector("#reset-count").textContent = String(resets);
  const indicator = document.querySelector("#state-indicator");
  indicator.classList.toggle("solid", solid);
  indicator.querySelector("b").textContent = solid ? "SOLID" : "PHANTOM";
  [...progressDots.children].forEach((dot, index) => {
    dot.classList.toggle("done", index < completed);
    dot.classList.toggle("current", index === roomIndex);
  });
  if (previousRoomId !== room.id) {
    const roomLabel = document.querySelector(".room-label");
    roomLabel.classList.remove("room-enter");
    requestAnimationFrame(() => roomLabel.classList.add("room-enter"));
    previousRoomId = room.id;
  }
}

export function showVictory(totalTime, resets, stars) {
  document.querySelector("#final-time").textContent = formatTime(totalTime);
  document.querySelector("#final-resets").textContent = String(resets);
  document.querySelector("#final-rating").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
  showState("victory");
  screens.victory.hidden = false;
  stage.classList.add("victory-flood");
}

export function flashDamage() {
  stage.classList.remove("damage-flash");
  void stage.offsetWidth;
  stage.classList.add("damage-flash");
  window.setTimeout(() => stage.classList.remove("damage-flash"), 220);
}

export function setTransition(covered) {
  transitionShade.style.transition = "opacity 190ms ease";
  transitionShade.style.opacity = covered ? "1" : "0";
}

export function waitForTransition() {
  return new Promise((resolve) => window.setTimeout(resolve, 200));
}

export function formatTime(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, "0")}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}