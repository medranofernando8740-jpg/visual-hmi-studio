import {
  Copy,
  Grid3x3,
  Group,
  Magnet,
  MousePointer2,
  Play,
  Redo2,
  Save,
  Square,
  Trash2,
  Ungroup,
  Undo2,
  ZoomIn,
  ZoomOut,
  Cpu,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import type { EditorMode } from "@/types/hmi";
import { useEditor } from "@/stores/editorStore";

const MODES: { id: EditorMode; label: string; icon: typeof Play }[] = [
  { id: "design", label: "Diseño", icon: MousePointer2 },
  { id: "simulate", label: "Simulación", icon: Play },
  { id: "preview", label: "Preview", icon: Eye },
];

export function TopBar() {
  const s = useEditor();
  const selectedCount = s.selectedIds.length;

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-panel-header px-2">
      <div className="flex items-center gap-2 pr-2">
        <div className="grid h-6 w-6 place-items-center rounded-sm bg-primary/15 text-primary">
          <Cpu className="h-3.5 w-3.5" />
        </div>
        <div className="leading-tight">
          <p className="text-[12px] font-semibold tracking-tight">HMI Studio</p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {s.project.name}
            {s.dirty ? " •" : ""}
          </p>
        </div>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-0.5">
        <button className="tool-btn" onClick={s.undo} disabled={!s.past.length} title="Undo (Ctrl+Z)">
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button className="tool-btn" onClick={s.redo} disabled={!s.future.length} title="Redo">
          <Redo2 className="h-3.5 w-3.5" />
        </button>
        <button
          className="tool-btn"
          onClick={() => {
            void s.save();
            toast.success("Proyecto guardado localmente");
          }}
          title="Guardar (Ctrl+S)"
        >
          <Save className="h-3.5 w-3.5" /> Guardar
        </button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-0.5">
        <button className="tool-btn" onClick={s.duplicateSelection} disabled={!selectedCount}>
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button className="tool-btn" onClick={s.deleteSelection} disabled={!selectedCount}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button className="tool-btn" onClick={s.groupSelection} disabled={selectedCount < 2}>
          <Group className="h-3.5 w-3.5" />
        </button>
        <button
          className="tool-btn"
          onClick={() => s.selectedIds[0] && s.ungroup(s.selectedIds[0])}
          disabled={selectedCount !== 1}
        >
          <Ungroup className="h-3.5 w-3.5" />
        </button>
        <button
          className="tool-btn"
          onClick={() => {
            const name = window.prompt("Nombre del widget reutilizable", "MiWidget");
            if (name) {
              s.createWidgetFromSelection(name);
              toast.success(`Widget “${name}” añadido a la librería`);
            }
          }}
          disabled={!selectedCount}
        >
          <Square className="h-3.5 w-3.5" /> Crear widget
        </button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-0.5">
        <button className="tool-btn" data-active={s.showGrid} onClick={s.toggleGrid} title="Grid">
          <Grid3x3 className="h-3.5 w-3.5" />
        </button>
        <button className="tool-btn" data-active={s.snapToGrid} onClick={s.toggleSnap} title="Snap">
          <Magnet className="h-3.5 w-3.5" />
        </button>
        <button className="tool-btn" onClick={() => s.setZoom(s.zoom - 0.1)}>
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="w-10 text-center font-mono text-[11px] text-muted-foreground">
          {Math.round(s.zoom * 100)}%
        </span>
        <button className="tool-btn" onClick={() => s.setZoom(s.zoom + 0.1)}>
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          className="tool-btn"
          onClick={() => {
            s.setZoom(1);
            s.setPan({ x: 40, y: 30 });
          }}
        >
          Reset
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <span className="font-mono text-[10px] text-muted-foreground">
          {s.project.target.model} · {s.project.target.displayWidth}×
          {s.project.target.displayHeight}
        </span>
        <div className="flex items-center gap-0.5 rounded-sm border border-border bg-card p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              className="tool-btn"
              data-active={s.mode === m.id}
              onClick={() => s.setMode(m.id)}
            >
              <m.icon className="h-3.5 w-3.5" /> {m.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
