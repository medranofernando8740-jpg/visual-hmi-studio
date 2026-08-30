import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEditor, type PanelTab } from "@/stores/editorStore";
import { useSimulation } from "@/hooks/useSimulation";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/inspector/Inspector";
import { WidgetLibrary } from "@/components/widgets/WidgetLibrary";
import { LayersPanel } from "@/components/layers/LayersPanel";
import { VariablesPanel } from "@/components/variables/VariablesPanel";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { WatchWindow } from "@/components/panels/WatchWindow";
import { SerialMonitor } from "@/components/panels/SerialMonitor";
import { BuildPanel } from "@/components/panels/BuildPanel";
import { ConnectionsPanel } from "@/components/panels/ConnectionsPanel";
import { TargetPanel } from "@/components/panels/TargetPanel";
import { ProjectExplorer } from "@/components/editor/ProjectExplorer";
import { TopBar } from "@/components/editor/TopBar";

const TABS: { id: PanelTab; label: string }[] = [
  { id: "variables", label: "Variables" },
  { id: "simulation", label: "Simulación" },
  { id: "monitor", label: "Watch" },
  { id: "serial", label: "Serial" },
  { id: "build", label: "Build" },
  { id: "connections", label: "Conexiones" },
  { id: "target", label: "Target" },
];

export function EditorShell() {
  const bottomTab = useEditor((s) => s.bottomTab);
  const setBottomTab = useEditor((s) => s.setBottomTab);
  const mode = useEditor((s) => s.mode);
  const zoom = useEditor((s) => s.zoom);
  const selectedIds = useEditor((s) => s.selectedIds);
  const screen = useEditor((s) => s.activeScreen());
  const simRunning = useEditor((s) => s.simRunning);
  const save = useEditor((s) => s.save);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);

  useSimulation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      } else if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, undo, redo]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <TopBar />

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize="17" minSize="12" className="flex flex-col">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="38" minSize="15" className="panel">
              <ProjectExplorer />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="62" minSize="20" className="panel">
              <WidgetLibrary />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize="58" minSize="30">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="68" minSize="25">
              <Canvas />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="32" minSize="12" className="panel flex flex-col">
              <div className="flex shrink-0 items-center gap-0.5 border-b border-border bg-panel-header px-1.5 py-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    className="tool-btn"
                    data-active={bottomTab === t.id}
                    onClick={() => setBottomTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="min-h-0 flex-1">
                {bottomTab === "variables" && <VariablesPanel />}
                {bottomTab === "simulation" && <SimulationPanel />}
                {bottomTab === "monitor" && <WatchWindow />}
                {bottomTab === "serial" && <SerialMonitor />}
                {bottomTab === "build" && <BuildPanel />}
                {bottomTab === "connections" && <ConnectionsPanel />}
                {bottomTab === "target" && <TargetPanel />}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize="25" minSize="16" className="flex flex-col">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="35" minSize="15" className="panel">
              <LayersPanel />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="65" minSize="25" className="panel">
              <Inspector />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <footer className="flex h-6 shrink-0 items-center gap-3 border-t border-border bg-panel-header px-2 font-mono text-[10px] text-muted-foreground">
        <span>Modo: {mode}</span>
        <span>
          Pantalla: {screen.name} · {screen.width}×{screen.height}
        </span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span>Selección: {selectedIds.length}</span>
        <span className="ml-auto flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                mode !== "design" && simRunning
                  ? "var(--color-success)"
                  : "var(--color-muted-foreground)",
            }}
          />
          {mode !== "design" && simRunning ? "Simulación activa" : "Simulación detenida"}
        </span>
      </footer>

      <Toaster />
    </div>
  );
}
