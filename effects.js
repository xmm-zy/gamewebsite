const canvas = document.getElementById("bgEffects");
const ctx = canvas.getContext("2d");

let petals = [];
let stars = [];
let width = 0;
let height = 0;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createPetal() {
  return {
    x: random(0, width),
    y: random(-height, height),
    size: random(6, 13),
    speedY: random(0.4, 1.2),
    speedX: random(-0.6, 0.6),
    wobble: random(0, Math.PI * 2)
  };
}

function createStar() {
  return {
    x: random(0, width),
    y: random(0, height),
    r: random(0.8, 2.2),
    alpha: random(0.2, 0.8),
    delta: random(0.003, 0.01)
  };
}

function init() {
  resize();
  petals = Array.from({ length: Math.max(18, Math.floor(width / 70)) }, createPetal);
  stars = Array.from({ length: Math.max(28, Math.floor(width / 45)) }, createStar);
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(Math.sin(p.wobble) * 0.5);
  ctx.fillStyle = "rgba(255, 140, 194, 0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.55, p.size, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStar(s) {
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
  ctx.fill();
}

function tick() {
  ctx.clearRect(0, 0, width, height);

  for (const s of stars) {
    s.alpha += s.delta;
    if (s.alpha > 0.9 || s.alpha < 0.12) {
      s.delta *= -1;
    }
    drawStar(s);
  }

  for (const p of petals) {
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(p.wobble) * 0.2;
    p.wobble += 0.03;
    if (p.y > height + 20) {
      Object.assign(p, createPetal(), { y: -20 });
    }
    if (p.x < -30) p.x = width + 30;
    if (p.x > width + 30) p.x = -30;
    drawPetal(p);
  }

  requestAnimationFrame(tick);
}

window.addEventListener("resize", init);
init();
tick();
