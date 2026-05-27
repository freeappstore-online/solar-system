import { useState } from "react";
import { useCanvas } from "./hooks/useCanvas";
import Controls from "./components/Controls";
import PlanetDetail from "./components/PlanetDetail";
import ScaleComparison from "./components/ScaleComparison";

export default function App() {
  const {
    canvasRef,
    timeScale,
    paused,
    options,
    selectedPlanet,
    showPluto,
    setTimeScale,
    setPaused,
    setOptions,
    setSelectedPlanet,
    setShowPluto,
    jumpToPlanet,
    resetView,
  } = useCanvas();

  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: "#0f0f23" }}>
      {/* Full-screen canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: "grab", touchAction: "none" }}
      />

      {/* Controls panel */}
      <Controls
        timeScale={timeScale}
        paused={paused}
        options={options}
        showPluto={showPluto}
        onTimeScaleChange={setTimeScale}
        onPausedChange={setPaused}
        onOptionsChange={setOptions}
        onShowPlutoChange={setShowPluto}
        onResetView={resetView}
        onShowComparison={() => setShowComparison(true)}
      />

      {/* Planet detail panel */}
      {selectedPlanet && (
        <PlanetDetail
          planet={selectedPlanet}
          onClose={() => setSelectedPlanet(null)}
          onJumpTo={(planet) => {
            jumpToPlanet(planet);
            setSelectedPlanet(planet);
          }}
        />
      )}

      {/* Scale comparison modal */}
      {showComparison && (
        <ScaleComparison
          showPluto={showPluto}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
