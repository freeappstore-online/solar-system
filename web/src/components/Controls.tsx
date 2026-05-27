import { type RenderOptions } from "../engine/renderer";

interface ControlsProps {
  timeScale: number;
  paused: boolean;
  options: RenderOptions;
  showPluto: boolean;
  onTimeScaleChange: (scale: number) => void;
  onPausedChange: (paused: boolean) => void;
  onOptionsChange: (options: RenderOptions) => void;
  onShowPlutoChange: (show: boolean) => void;
  onResetView: () => void;
  onShowComparison: () => void;
}

export default function Controls({
  timeScale,
  paused,
  options,
  showPluto,
  onTimeScaleChange,
  onPausedChange,
  onOptionsChange,
  onShowPlutoChange,
  onResetView,
  onShowComparison,
}: ControlsProps) {
  return (
    <div className="fixed top-4 left-4 z-20 flex flex-col gap-2 select-none">
      {/* Main controls panel */}
      <div
        className="rounded-xl px-4 py-3 flex flex-col gap-3 w-64 shadow-lg"
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--line)",
        }}
      >
        <h2
          className="text-sm font-bold tracking-wide"
          style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
        >
          Solar System Explorer
        </h2>

        {/* Time scale */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              className="text-xs font-medium"
              style={{ color: "var(--muted)" }}
            >
              Time Scale
            </label>
            <span className="text-xs font-mono" style={{ color: "var(--ink)" }}>
              {paused ? "Paused" : `${timeScale}x`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPausedChange(!paused)}
              className="rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: paused ? "var(--accent)" : "var(--panel)",
                color: paused ? "#fff" : "var(--ink)",
                border: "1px solid var(--line)",
              }}
            >
              {paused ? "Play" : "Pause"}
            </button>
            <input
              type="range"
              min="1"
              max="10000"
              step="1"
              value={timeScale}
              onChange={(e) => onTimeScaleChange(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: "var(--accent)" }}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-1.5">
          <Toggle
            label="Orbit lines"
            checked={options.showOrbits}
            onChange={(v) => onOptionsChange({ ...options, showOrbits: v })}
          />
          <Toggle
            label="Planet labels"
            checked={options.showLabels}
            onChange={(v) => onOptionsChange({ ...options, showLabels: v })}
          />
          <Toggle
            label="Orbital trails"
            checked={options.showTrails}
            onChange={(v) => onOptionsChange({ ...options, showTrails: v })}
          />
          <Toggle
            label="Include Pluto"
            checked={showPluto}
            onChange={onShowPlutoChange}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onResetView}
            className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: "var(--panel)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
            }}
          >
            Reset View
          </button>
          <button
            onClick={onShowComparison}
            className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
            }}
          >
            Size Compare
          </button>
        </div>
      </div>

      {/* Hint */}
      <div
        className="rounded-lg px-3 py-2 text-xs"
        style={{ color: "var(--muted)", background: "var(--glass)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--line)" }}
      >
        Scroll to zoom. Drag to pan. Click a planet for details.
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs" style={{ color: "var(--ink)" }}>
        {label}
      </span>
      <div
        className="relative w-8 h-4 rounded-full transition-colors"
        style={{
          background: checked ? "var(--accent)" : "var(--line-strong)",
        }}
        onClick={() => onChange(!checked)}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full transition-transform bg-white shadow-sm"
          style={{
            left: checked ? "18px" : "2px",
            transition: "left 0.15s ease",
          }}
        />
      </div>
    </label>
  );
}
