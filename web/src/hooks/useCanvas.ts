import { useRef, useEffect, useCallback, useState } from "react";
import {
  type OrbitalState,
  type Camera,
  type RenderOptions,
  render,
  updateOrbits,
  initOrbitalStates,
  hitTest,
} from "../engine/renderer";
import { type PlanetData, PLANETS, PLUTO } from "../data/planets";

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  camera: Camera;
  timeScale: number;
  paused: boolean;
  options: RenderOptions;
  selectedPlanet: PlanetData | null;
  showPluto: boolean;
  setTimeScale: (s: number) => void;
  setPaused: (p: boolean) => void;
  setOptions: (o: RenderOptions) => void;
  setSelectedPlanet: (p: PlanetData | null) => void;
  setShowPluto: (s: boolean) => void;
  jumpToPlanet: (planet: PlanetData) => void;
  resetView: () => void;
}

export function useCanvas(): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statesRef = useRef<OrbitalState[]>([]);
  const cameraRef = useRef<Camera>({ x: 0, y: 0, zoom: 1.5 });
  const timeScaleRef = useRef(100);
  const pausedRef = useRef(false);
  const optionsRef = useRef<RenderOptions>({
    showOrbits: true,
    showLabels: true,
    showTrails: false,
  });
  const showPlutoRef = useRef(false);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef(0);

  // State mirrors for React UI
  const [camera, setCamera] = useState<Camera>(cameraRef.current);
  const [timeScale, _setTimeScale] = useState(timeScaleRef.current);
  const [paused, _setPaused] = useState(false);
  const [options, _setOptions] = useState<RenderOptions>(optionsRef.current);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showPluto, _setShowPluto] = useState(false);

  const setTimeScale = useCallback((s: number) => {
    timeScaleRef.current = s;
    _setTimeScale(s);
  }, []);

  const setPaused = useCallback((p: boolean) => {
    pausedRef.current = p;
    _setPaused(p);
  }, []);

  const setOptions = useCallback((o: RenderOptions) => {
    optionsRef.current = o;
    _setOptions(o);
  }, []);

  const setShowPluto = useCallback((s: boolean) => {
    showPlutoRef.current = s;
    _setShowPluto(s);
    // Rebuild orbital states
    const allPlanets = s ? [...PLANETS, PLUTO] : [...PLANETS];
    statesRef.current = initOrbitalStates(allPlanets);
  }, []);

  const jumpToPlanet = useCallback((planet: PlanetData) => {
    // Find the state for this planet
    const state = statesRef.current.find((s) => s.planet.name === planet.name);
    if (state) {
      cameraRef.current = {
        x: state.x,
        y: state.y,
        zoom: Math.max(2, 30 / Math.max(planet.distanceAU, 0.5)),
      };
      setCamera({ ...cameraRef.current });
    } else if (planet.name === "Sun") {
      cameraRef.current = { x: 0, y: 0, zoom: 3 };
      setCamera({ ...cameraRef.current });
    }
  }, []);

  const resetView = useCallback(() => {
    cameraRef.current = { x: 0, y: 0, zoom: 1.5 };
    setCamera({ ...cameraRef.current });
  }, []);

  // Initialize
  useEffect(() => {
    statesRef.current = initOrbitalStates([...PLANETS]);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handler
    const resize = (): void => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Animation loop
    const loop = (timestamp: number): void => {
      const dt = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;

      if (!pausedRef.current) {
        updateOrbits(
          statesRef.current,
          dt,
          timeScaleRef.current,
          optionsRef.current.showTrails,
        );
      }

      render(
        ctx,
        window.innerWidth,
        window.innerHeight,
        cameraRef.current,
        statesRef.current,
        optionsRef.current,
        timestamp,
      );

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    // Mouse interaction: pan
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let camStartX = 0;
    let camStartY = 0;

    const onMouseDown = (e: MouseEvent): void => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      camStartX = cameraRef.current.x;
      camStartY = cameraRef.current.y;
    };

    const onMouseMove = (e: MouseEvent): void => {
      if (!isDragging) return;
      const dx = (e.clientX - dragStartX) / cameraRef.current.zoom;
      const dy = (e.clientY - dragStartY) / cameraRef.current.zoom;
      cameraRef.current.x = camStartX - dx;
      cameraRef.current.y = camStartY - dy;
      setCamera({ ...cameraRef.current });
    };

    const onMouseUp = (): void => {
      isDragging = false;
    };

    // Click for planet selection
    const onClick = (e: MouseEvent): void => {
      const result = hitTest(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight,
        cameraRef.current,
        statesRef.current,
      );
      setSelectedPlanet(result?.planet ?? null);
    };

    // Mouse wheel zoom
    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      cameraRef.current.zoom = Math.max(
        0.1,
        Math.min(50, cameraRef.current.zoom * factor),
      );
      setCamera({ ...cameraRef.current });
    };

    // Touch: pinch zoom + pan
    let lastTouchDist = 0;

    const onTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 1) {
        const t = e.touches[0]!;
        isDragging = true;
        dragStartX = t.clientX;
        dragStartY = t.clientY;
        camStartX = cameraRef.current.x;
        camStartY = cameraRef.current.y;
      }
      if (e.touches.length === 2) {
        const t1 = e.touches[0]!;
        const t2 = e.touches[1]!;
        lastTouchDist = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY,
        );
      }
    };

    const onTouchMove = (e: TouchEvent): void => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const t = e.touches[0]!;
        const dx = (t.clientX - dragStartX) / cameraRef.current.zoom;
        const dy = (t.clientY - dragStartY) / cameraRef.current.zoom;
        cameraRef.current.x = camStartX - dx;
        cameraRef.current.y = camStartY - dy;
        setCamera({ ...cameraRef.current });
      }
      if (e.touches.length === 2) {
        const t1 = e.touches[0]!;
        const t2 = e.touches[1]!;
        const dist = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY,
        );

        if (lastTouchDist > 0) {
          const factor = dist / lastTouchDist;
          cameraRef.current.zoom = Math.max(
            0.1,
            Math.min(50, cameraRef.current.zoom * factor),
          );
          setCamera({ ...cameraRef.current });
        }

        lastTouchDist = dist;
      }
    };

    const onTouchEnd = (e: TouchEvent): void => {
      if (e.touches.length < 2) lastTouchDist = 0;
      if (e.touches.length === 0) isDragging = false;

      // Tap = click
      if (e.changedTouches.length === 1 && !isDragging) {
        const t = e.changedTouches[0]!;
        const result = hitTest(
          t.clientX,
          t.clientY,
          window.innerWidth,
          window.innerHeight,
          cameraRef.current,
          statesRef.current,
        );
        setSelectedPlanet(result?.planet ?? null);
      }
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return {
    canvasRef,
    camera,
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
  };
}
