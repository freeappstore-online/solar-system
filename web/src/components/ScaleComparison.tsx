import { useRef, useEffect, useMemo } from "react";
import { PLANETS, PLUTO, SUN_DATA, type PlanetData } from "../data/planets";

interface ScaleComparisonProps {
  showPluto: boolean;
  onClose: () => void;
}

export default function ScaleComparison({
  showPluto,
  onClose,
}: ScaleComparisonProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const allBodies: PlanetData[] = useMemo(
    () =>
      showPluto
        ? [SUN_DATA, ...PLANETS, PLUTO]
        : [SUN_DATA, ...PLANETS],
    [showPluto],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth ?? 800;
    const height = canvas.parentElement?.clientHeight ?? 500;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawComparison(ctx, width, height, allBodies);
  }, [allBodies]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0, 0, 0, 0.7)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 rounded-2xl overflow-hidden shadow-2xl mx-4"
        style={{
          background: "#0f0f23",
          border: "1px solid var(--line)",
          width: "min(900px, 95vw)",
          height: "min(550px, 80vh)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            background: "var(--glass)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
          >
            True Relative Sizes
          </h2>
          <button
            onClick={onClose}
            className="rounded-md w-7 h-7 flex items-center justify-center text-sm cursor-pointer"
            style={{
              background: "var(--panel)",
              color: "var(--muted)",
              border: "1px solid var(--line)",
            }}
          >
            x
          </button>
        </div>

        {/* Canvas */}
        <div className="w-full" style={{ height: "calc(100% - 48px)" }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

function drawComparison(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bodies: PlanetData[],
): void {
  // Background
  ctx.fillStyle = "#0f0f23";
  ctx.fillRect(0, 0, width, height);

  // Subtle starfield
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1 + 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Earth diameter as reference for scaling.
  // Earth = 12756 km. Sun = 1392700 km (109x Earth).
  // We want the planets to be visible, so scale to fill height.
  // The largest planet we need to fully show is Jupiter at 142984 km.
  // Scale so Jupiter is about 40% of height.
  const jupiterDiameter = 142984;
  const pixelsPerKm = (height * 0.4) / jupiterDiameter;

  // Position planets from left to right (skip Sun, show Sun as arc on left)
  const planets = bodies.filter((b) => b.name !== "Sun");

  // Total width needed for planets
  const padding = 30;
  let totalWidth = 0;
  const planetWidths = planets.map((p) => {
    const d = Math.max(p.diameterKm * pixelsPerKm, 4);
    return d;
  });
  for (const w of planetWidths) {
    totalWidth += w + padding;
  }

  // Draw Sun arc on left edge
  const sunR = SUN_DATA.diameterKm * pixelsPerKm * 0.5;
  const sunGrad = ctx.createRadialGradient(
    -sunR * 0.8,
    height / 2,
    sunR * 0.5,
    -sunR * 0.8,
    height / 2,
    sunR,
  );
  sunGrad.addColorStop(0, "#FFF5C0");
  sunGrad.addColorStop(0.3, "#FDB813");
  sunGrad.addColorStop(0.7, "#FF6B00");
  sunGrad.addColorStop(1, "rgba(255, 107, 0, 0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(-sunR * 0.8, height / 2, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Sun label
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "11px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Sun (partial)", 40, height - 20);

  // Start x for planets
  const startX = 80;
  const availableWidth = width - startX - 20;
  const scale = Math.min(1, availableWidth / totalWidth);

  let x = startX;
  const baselineY = height * 0.6;

  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i]!;
    const diameter = Math.max(planet.diameterKm * pixelsPerKm * scale, 3);
    const r = diameter / 2;

    x += r + padding * scale * 0.5;

    const cy = baselineY;

    // Planet gradient
    const grad = ctx.createRadialGradient(
      x - r * 0.3,
      cy - r * 0.3,
      r * 0.1,
      x,
      cy,
      r,
    );
    grad.addColorStop(0, lighten(planet.color, 40));
    grad.addColorStop(0.7, planet.color);
    grad.addColorStop(1, planet.colorSecondary ?? planet.color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Saturn rings
    if (planet.hasRings) {
      ctx.save();
      ctx.translate(x, cy);
      ctx.scale(1, 0.35);
      ctx.strokeStyle = "rgba(210, 180, 120, 0.35)";
      ctx.lineWidth = r * 0.15;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "10px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(planet.name, x, cy + r + 16);

    // Diameter label
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "8px Manrope, sans-serif";
    ctx.fillText(
      `${planet.diameterKm.toLocaleString()} km`,
      x,
      cy + r + 28,
    );

    x += r + padding * scale * 0.5;
  }
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}
