import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "@/stores/editorStore";
import { scopeFromVariables } from "@/lib/expression";
import { absolutePosition, findElement } from "@/lib/tree";
import type { ElementKind } from "@/types/hmi";
import { ElementView } from "./ElementView";

const HANDLES = [
  ["nw", 0, 0],
  ["n", 0.5, 0],
  ["ne", 1, 0],
  ["e", 1, 0.5],
  ["se", 1, 1],
  ["s", 0.5, 1],
  ["sw", 0, 1],
  ["w", 0, 0.5],
] as const;

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    mode,
    zoom,
    pan,
    showGrid,
    snapToGrid,
    gridSize,
    selectedIds,
    setZoom,
    setPan,
    select,
    toggleSelect,
    updateElement,
    addElement,
    instantiateWidget,
    deleteSelection,
    duplicateSelection,
    groupSelection,
    undo,
    redo,
  } = useEditor();
  const screen = useEditor((s) => s.activeScreen());
  const variables = useEditor((s) => s.project.variables);
  const scope = scopeFromVariables(variables);
  const live = mode !== "design";
  const [drag, setDrag] = useState<null | {
    kind: "move" | "resize" | "pan";
    handle?: string;
    startX: number;
    startY: number;
    origin: { x: number; y: number; width: number; height: number };
    panOrigin: { x: number; y: number };
    id?: string;
  }>(null);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef(pan);
  panRef.current = pan;

  // Non-passive wheel listener: cursor-anchored zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey || e.altKey)) {
        e.preventDefault();
        setPan({ x: panRef.current.x - e.deltaX, y: panRef.current.y - e.deltaY });
        return;
      }
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const current = zoomRef.current;
      const next = Math.min(6, Math.max(0.15, current * Math.exp(-dy * 0.0018)));
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const k = next / current;
      setPan({
        x: px - (px - panRef.current.x) * k,
        y: py - (py - panRef.current.y) * k,
      });
      setZoom(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setPan, setZoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelection();
      } else if (mod && e.key.toLowerCase() === "g") {
        e.preventDefault();
        groupSelection();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length) {
          e.preventDefault();
          deleteSelection();
        }
      } else if (e.key.startsWith("Arrow") && selectedIds.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        for (const id of selectedIds) {
          const el = findElement(screen.elements, id);
          if (!el || el.locked) continue;
          const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
          const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
          updateElement(id, { x: el.x + dx, y: el.y + dy });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    selectedIds,
    screen,
    deleteSelection,
    duplicateSelection,
    groupSelection,
    undo,
    redo,
    updateElement,
  ]);

  const snap = useCallback(
    (v: number) => (snapToGrid ? Math.round(v / gridSize) * gridSize : Math.round(v)),
    [snapToGrid, gridSize],
  );

  const onSelectElement = (id: string, additive: boolean, e: React.PointerEvent) => {
    if (live) return;
    const el = findElement(screen.elements, id);
    if (!el) return;
    if (additive) {
      toggleSelect(id);
      return;
    }
    select([id]);
    if (el.locked) return;
    setDrag({
      kind: "move",
      startX: e.clientX,
      startY: e.clientY,
      origin: { x: el.x, y: el.y, width: el.width, height: el.height },
      panOrigin: pan,
      id,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / zoom;
    const dy = (e.clientY - drag.startY) / zoom;
    if (drag.kind === "pan") {
      setPan({ x: drag.panOrigin.x + (e.clientX - drag.startX), y: drag.panOrigin.y + (e.clientY - drag.startY) });
      return;
    }
    if (!drag.id) return;
    if (drag.kind === "move") {
      updateElement(drag.id, { x: snap(drag.origin.x + dx), y: snap(drag.origin.y + dy) });
      return;
    }
    const h = drag.handle ?? "se";
    let { x, y, width, height } = drag.origin;
    if (h.includes("e")) width = Math.max(4, drag.origin.width + dx);
    if (h.includes("s")) height = Math.max(4, drag.origin.height + dy);
    if (h.includes("w")) {
      width = Math.max(4, drag.origin.width - dx);
      x = drag.origin.x + dx;
    }
    if (h.includes("n")) {
      height = Math.max(4, drag.origin.height - dy);
      y = drag.origin.y + dy;
    }
    updateElement(drag.id, {
      x: snap(x),
      y: snap(y),
      width: snap(width),
      height: snap(height),
    });
  };

  const selected = selectedIds[0] ? findElement(screen.elements, selectedIds[0]) : undefined;
  const selectedAbs = selectedIds[0] ? absolutePosition(screen.elements, selectedIds[0]) : null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-canvas"
      onPointerDown={(e) => {
        if (e.button === 1 || e.altKey || (e.button === 0 && e.currentTarget === e.target)) {
          if (e.button === 1 || e.altKey) {
            setDrag({
              kind: "pan",
              startX: e.clientX,
              startY: e.clientY,
              origin: { x: 0, y: 0, width: 0, height: 0 },
              panOrigin: pan,
            });
          } else {
            select([]);
          }
        }
      }}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
      onDragOver={(e) => {
        if (live) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (live) return;
        e.preventDefault();
        const rect = containerRef.current!.getBoundingClientRect();
        const x = snap((e.clientX - rect.left - pan.x) / zoom);
        const y = snap((e.clientY - rect.top - pan.y) / zoom);
        const kind = e.dataTransfer.getData("application/hmi-kind");
        const widgetId = e.dataTransfer.getData("application/hmi-widget");
        if (widgetId) instantiateWidget(widgetId, x, y);
        else if (kind) addElement(kind as ElementKind, x, y);
      }}
    >
      <div
        className="absolute origin-top-left"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <div
          className="relative shadow-float"
          style={{
            width: screen.width,
            height: screen.height,
            background: screen.background,
            outline: "1px solid var(--color-border)",
          }}
        >
          {showGrid && !live && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--color-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid) 1px, transparent 1px)",
                backgroundSize: `${gridSize * 4}px ${gridSize * 4}px`,
                opacity: 0.35,
              }}
            />
          )}
          {screen.elements.map((el) => (
            <ElementView
              key={el.id}
              el={el}
              scope={scope}
              live={live}
              selectedIds={selectedIds}
              interactive={live}
              {...(live ? {} : { onSelect: onSelectElement })}
            />
          ))}

          {!live && selected && selectedAbs && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: selectedAbs.x,
                top: selectedAbs.y,
                width: selected.width,
                height: selected.height,
                outline: "1px solid var(--color-selection)",
              }}
            >
              {HANDLES.map(([h, fx, fy]) => (
                <div
                  key={h}
                  className="pointer-events-auto absolute h-2 w-2 border border-background bg-selection"
                  style={{
                    left: `calc(${fx * 100}% - 4px)`,
                    top: `calc(${fy * 100}% - 4px)`,
                    cursor: `${h}-resize`,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setDrag({
                      kind: "resize",
                      handle: h,
                      startX: e.clientX,
                      startY: e.clientY,
                      origin: {
                        x: selected.x,
                        y: selected.y,
                        width: selected.width,
                        height: selected.height,
                      },
                      panOrigin: pan,
                      id: selected.id,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-2 rounded border border-border bg-panel/90 px-2 py-1 font-mono text-[10px] text-muted-foreground">
        {screen.width}×{screen.height} · {Math.round(zoom * 100)}% · {screen.elements.length} objs
      </div>
    </div>
  );
}
