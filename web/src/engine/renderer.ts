import { type PlanetData, type Moon, SUN_DATA } from "../data/planets";

/** Orbital state for animation */
export interface OrbitalState {
  planet: PlanetData;
  angle: number; // current angle in radians
  x: number;
  y: number;
  trail: Array<{ x: number; y: number }>;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface RenderOptions {
  showOrbits: boolean;
  showLabels: boolean;
  showTrails: boolean;
}

/** Stars for the background starfield */
interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
}

const ORBIT_SCALE = 18; // pixels per AU
const TRAIL_MAX = 300;

let stars: Star[] = [];

function ensureStars(width: number, height: number): void {
  if (stars.length > 0) return;
  const count = Math.floor((width * height) / 800);
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width * 3 - width,
      y: Math.random() * height * 3 - height,
      size: Math.random() * 1.5 + 0.3,
      brightness: Math.random() * 0.6 + 0.4,
    });
  }
}

/** Convert AU distance + angle to screen coordinates */
function orbitToScreen(
  distanceAU: number,
  eccentricity: number,
  angle: number,
  zoom: number,
): { x: number; y: number } {
  const semiMajor = distanceAU * ORBIT_SCALE * zoom;
  const semiMinor = semiMajor * Math.sqrt(1 - eccentricity * eccentricity);
  const x = semiMajor * Math.cos(angle);
  const y = semiMinor * Math.sin(angle);
  return { x, y };
}

/** Update orbital positions based on time */
export function updateOrbits(
  states: OrbitalState[],
  dt: number,
  timeScale: number,
  showTrails: boolean,
): void {
  // dt is in ms, convert to days at scale
  const daysElapsed = (dt / 1000) * (timeScale / 365.25) * 60; // 60 = speedup so it looks nice at 1x

  for (const state of states) {
    const { planet } = state;
    if (planet.orbitalPeriodDays === 0) continue;

    const angularVelocity = (2 * Math.PI) / planet.orbitalPeriodDays;
    state.angle += angularVelocity * daysElapsed;

    const pos = orbitToScreen(
      planet.distanceAU,
      planet.eccentricity,
      state.angle,
      1,
    );
    state.x = pos.x;
    state.y = pos.y;

    if (showTrails) {
      state.trail.push({ x: state.x, y: state.y });
      if (state.trail.length > TRAIL_MAX) {
        state.trail.shift();
      }
    }
  }
}

/** Initialize orbital states for a list of planets */
export function initOrbitalStates(planets: PlanetData[]): OrbitalState[] {
  return planets.map((planet) => {
    const angle = Math.random() * Math.PI * 2;
    const pos = orbitToScreen(planet.distanceAU, planet.eccentricity, angle, 1);
    return {
      planet,
      angle,
      x: pos.x,
      y: pos.y,
      trail: [],
    };
  });
}

/** Render the full scene */
export function render(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera,
  states: OrbitalState[],
  options: RenderOptions,
  time: number,
): void {
  ctx.save();

  // Background
  ctx.fillStyle = "#0f0f23";
  ctx.fillRect(0, 0, width, height);

  // Starfield with parallax
  ensureStars(width, height);
  const parallax = 0.15;
  for (const star of stars) {
    const sx = star.x - camera.x * parallax;
    const sy = star.y - camera.y * parallax;
    // Wrap stars
    const wx = ((sx % (width * 3)) + width * 3) % (width * 3) - width;
    const wy = ((sy % (height * 3)) + height * 3) % (height * 3) - height;
    if (wx < -10 || wx > width + 10 || wy < -10 || wy > height + 10) continue;
    const twinkle =
      star.brightness * (0.7 + 0.3 * Math.sin(time * 0.001 + star.x));
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.beginPath();
    ctx.arc(wx, wy, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Translate to center + camera
  ctx.translate(width / 2 - camera.x * camera.zoom, height / 2 - camera.y * camera.zoom);
  ctx.scale(camera.zoom, camera.zoom);

  // Draw orbit lines
  if (options.showOrbits) {
    for (const state of states) {
      const { planet } = state;
      if (planet.distanceAU === 0) continue;
      const semiMajor = planet.distanceAU * ORBIT_SCALE;
      const semiMinor =
        semiMajor * Math.sqrt(1 - planet.eccentricity * planet.eccentricity);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 0.5 / camera.zoom;
      ctx.beginPath();
      ctx.ellipse(0, 0, semiMajor, semiMinor, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Asteroid belt (between Mars ~2.2 AU and Jupiter ~3.2 AU)
  drawAsteroidBelt(ctx, camera, time);

  // Draw trails
  if (options.showTrails) {
    for (const state of states) {
      if (state.trail.length < 2) continue;
      ctx.beginPath();
      const firstTrail = state.trail[0]!;
      ctx.moveTo(firstTrail.x, firstTrail.y);
      for (let i = 1; i < state.trail.length; i++) {
        const pt = state.trail[i]!;
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = state.planet.color + "60";
      ctx.lineWidth = 1 / camera.zoom;
      ctx.stroke();
    }
  }

  // Draw Sun
  drawSun(ctx, time, camera);

  // Draw planets
  for (const state of states) {
    drawPlanet(ctx, state, options, time, camera);
  }

  ctx.restore();
}

function drawSun(
  ctx: CanvasRenderingContext2D,
  time: number,
  camera: Camera,
): void {
  const sun = SUN_DATA;
  const r = sun.radius;
  const pulse = 1 + 0.03 * Math.sin(time * 0.002);

  // Outer glow
  const glow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 4 * pulse);
  glow.addColorStop(0, "rgba(253, 184, 19, 0.5)");
  glow.addColorStop(0.4, "rgba(255, 107, 0, 0.15)");
  glow.addColorStop(1, "rgba(255, 107, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 4 * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Sun body
  const grad = ctx.createRadialGradient(
    -r * 0.2,
    -r * 0.2,
    r * 0.1,
    0,
    0,
    r,
  );
  grad.addColorStop(0, "#FFF5C0");
  grad.addColorStop(0.5, "#FDB813");
  grad.addColorStop(1, "#FF6B00");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Label
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = `${Math.max(8, 10 / camera.zoom)}px Manrope, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("Sun", 0, -r - 6 / camera.zoom);
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  state: OrbitalState,
  options: RenderOptions,
  time: number,
  camera: Camera,
): void {
  const { planet, x, y } = state;
  const r = planet.radius;

  ctx.save();
  ctx.translate(x, y);

  // Saturn rings (behind planet)
  if (planet.hasRings && planet.ringInnerRadius && planet.ringOuterRadius) {
    drawRings(ctx, planet, camera);
  }

  // Planet body with gradient for 3D effect
  const grad = ctx.createRadialGradient(
    -r * 0.3,
    -r * 0.3,
    r * 0.1,
    0,
    0,
    r,
  );
  grad.addColorStop(0, lightenColor(planet.color, 30));
  grad.addColorStop(0.7, planet.color);
  grad.addColorStop(1, planet.colorSecondary ?? darkenColor(planet.color, 30));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Jupiter bands
  if (planet.name === "Jupiter") {
    drawJupiterBands(ctx, r);
  }

  // Moons
  for (const moon of planet.moons) {
    drawMoon(ctx, moon, time, camera);
  }

  // Label
  if (options.showLabels) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = `${Math.max(7, 9 / camera.zoom)}px Manrope, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(planet.name, 0, -r - 5 / camera.zoom);
  }

  ctx.restore();
}

function drawRings(
  ctx: CanvasRenderingContext2D,
  planet: PlanetData,
  _camera: Camera,
): void {
  const inner = planet.ringInnerRadius!;
  const outer = planet.ringOuterRadius!;

  ctx.save();
  ctx.scale(1, 0.35); // tilt rings

  for (let i = 0; i < 5; i++) {
    const rr = inner + ((outer - inner) * i) / 5;
    const alpha = 0.15 + (i % 2) * 0.1;
    ctx.strokeStyle = `rgba(210, 180, 120, ${alpha})`;
    ctx.lineWidth = (outer - inner) / 6;
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawJupiterBands(ctx: CanvasRenderingContext2D, r: number): void {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.2;

  const bandColors = [
    "#A0522D",
    "#C88B3A",
    "#8B6914",
    "#C88B3A",
    "#D2691E",
    "#C88B3A",
  ];
  const bandHeight = (r * 2) / bandColors.length;

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();

  for (let i = 0; i < bandColors.length; i++) {
    ctx.fillStyle = bandColors[i]!;
    ctx.fillRect(-r, -r + i * bandHeight, r * 2, bandHeight);
  }

  ctx.restore();
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  moon: Moon,
  time: number,
  camera: Camera,
): void {
  const angle = (time * 0.001 * 2 * Math.PI) / (moon.orbitalPeriod * 10);
  const mx = Math.cos(angle) * moon.orbitRadius;
  const my = Math.sin(angle) * moon.orbitRadius * 0.6; // slight tilt

  // Moon orbit line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 0.3 / camera.zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, moon.orbitRadius, moon.orbitRadius * 0.6, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Moon body
  ctx.fillStyle = moon.color;
  ctx.beginPath();
  ctx.arc(mx, my, moon.size, 0, Math.PI * 2);
  ctx.fill();
}

function drawAsteroidBelt(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  time: number,
): void {
  const innerAU = 2.1;
  const outerAU = 3.3;
  const count = 200;

  ctx.fillStyle = "rgba(160, 140, 120, 0.3)";

  for (let i = 0; i < count; i++) {
    // Use deterministic positions based on index
    const seed = i * 137.508; // golden angle
    const au = innerAU + ((seed * 0.618) % 1) * (outerAU - innerAU);
    const baseAngle = ((seed * 2.618) % 1) * Math.PI * 2;
    const drift = time * 0.00001 * (1 + (i % 3) * 0.5);
    const angle = baseAngle + drift;

    const r = au * ORBIT_SCALE;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle) * 0.98;

    const size = 0.3 + (i % 3) * 0.3;

    ctx.beginPath();
    ctx.arc(x, y, size / Math.max(camera.zoom, 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Hit test: check if a screen position is on a planet */
export function hitTest(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  camera: Camera,
  states: OrbitalState[],
): OrbitalState | null {
  // Convert screen coords to world coords
  const worldX = (screenX - width / 2) / camera.zoom + camera.x;
  const worldY = (screenY - height / 2) / camera.zoom + camera.y;

  // Check Sun
  const sunDist = Math.sqrt(worldX * worldX + worldY * worldY);
  if (sunDist <= SUN_DATA.radius * 1.5) {
    return {
      planet: SUN_DATA,
      angle: 0,
      x: 0,
      y: 0,
      trail: [],
    };
  }

  // Check planets (reverse order so top-rendered checked first)
  for (let i = states.length - 1; i >= 0; i--) {
    const state = states[i]!;
    const dx = worldX - state.x;
    const dy = worldY - state.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hitRadius = Math.max(state.planet.radius * 1.5, 8 / camera.zoom);
    if (dist <= hitRadius) {
      return state;
    }
  }

  return null;
}

// Color helpers
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}
