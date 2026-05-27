import { type PlanetData } from "../data/planets";

interface PlanetDetailProps {
  planet: PlanetData;
  onClose: () => void;
  onJumpTo: (planet: PlanetData) => void;
}

export default function PlanetDetail({
  planet,
  onClose,
  onJumpTo,
}: PlanetDetailProps) {
  const typeLabel = planet.type.charAt(0).toUpperCase() + planet.type.slice(1);
  const distanceKm = (planet.distanceAU * 149597870.7).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });

  return (
    <div
      className="fixed top-4 right-4 z-20 w-80 max-h-[calc(100vh-32px)] overflow-y-auto rounded-xl shadow-lg select-none"
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--line)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
          >
            {planet.name}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {typeLabel}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md w-7 h-7 flex items-center justify-center text-sm cursor-pointer transition-colors"
          style={{
            background: "var(--panel)",
            color: "var(--muted)",
            border: "1px solid var(--line)",
          }}
        >
          x
        </button>
      </div>

      {/* Planet color preview */}
      <div className="px-5 pb-3">
        <div
          className="w-full h-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${planet.color}, ${planet.colorSecondary ?? planet.color})`,
          }}
        />
      </div>

      {/* Stats grid */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Stat label="Diameter" value={`${planet.diameterKm.toLocaleString()} km`} />
          <Stat
            label="Mass"
            value={
              planet.massEarths >= 1
                ? `${planet.massEarths.toLocaleString()} Earths`
                : `${planet.massEarths} Earths`
            }
          />
          <Stat label="Distance (AU)" value={`${planet.distanceAU} AU`} />
          <Stat label="Distance (km)" value={`${distanceKm} km`} />
          <Stat
            label="Orbital period"
            value={
              planet.orbitalPeriodDays > 365
                ? `${(planet.orbitalPeriodDays / 365.25).toFixed(1)} years`
                : `${planet.orbitalPeriodDays} days`
            }
          />
          <Stat
            label="Known moons"
            value={String(planet.knownMoons)}
          />
        </div>
      </div>

      {/* Temperature */}
      <div className="px-5 pb-3">
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted)" }}>
          Temperature
        </p>
        <p className="text-sm" style={{ color: "var(--ink)" }}>
          {planet.temperatureRange}
        </p>
      </div>

      {/* Atmosphere */}
      <div className="px-5 pb-3">
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted)" }}>
          Atmosphere
        </p>
        <p className="text-sm" style={{ color: "var(--ink)" }}>
          {planet.atmosphere}
        </p>
      </div>

      {/* Fun facts */}
      <div className="px-5 pb-3">
        <p className="text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>
          Fun Facts
        </p>
        <ul className="flex flex-col gap-1.5">
          {planet.funFacts.map((fact, i) => (
            <li
              key={i}
              className="text-xs leading-relaxed pl-3 relative"
              style={{ color: "var(--ink)" }}
            >
              <span
                className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full"
                style={{ background: planet.color }}
              />
              {fact}
            </li>
          ))}
        </ul>
      </div>

      {/* Jump to button */}
      {planet.distanceAU > 0 && (
        <div className="px-5 pb-4">
          <button
            onClick={() => onJumpTo(planet)}
            className="w-full rounded-lg py-2 text-sm font-medium cursor-pointer transition-colors"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
            }}
          >
            Jump to {planet.name}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
        {value}
      </p>
    </div>
  );
}
