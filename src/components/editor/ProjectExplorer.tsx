import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Cpu,
  FileImage,
  Monitor,
  Plus,
  Radio,
  Trash2,
  Variable,
  Boxes,
} from "lucide-react";
import { useEditor } from "@/stores/editorStore";

export function ProjectExplorer() {
  const project = useEditor((s) => s.project);
  const activeScreenId = useEditor((s) => s.activeScreenId);
  const { addScreen, selectScreen, removeScreen } = useEditor();
  const [open, setOpen] = useState<Record<string, boolean>>({
    screens: true,
    variables: false,
    widgets: false,
    connections: false,
    assets: false,
  });
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <Boxes className="h-3 w-3" /> Proyecto
      </div>
      <div className="flex-1 overflow-y-auto py-1 text-[11px]">
        <div className="tree-row font-semibold">
          <Cpu className="h-3 w-3 text-primary" />
          <span className="truncate">{project.name}</span>
        </div>

        <Group
          label={`Pantallas (${project.screens.length})`}
          icon={<Monitor className="h-3 w-3" />}
          open={open.screens!}
          onToggle={() => toggle("screens")}
          action={
            <button className="tool-btn h-4 px-0.5" onClick={addScreen} title="Nueva pantalla">
              <Plus className="h-3 w-3" />
            </button>
          }
        >
          {project.screens.map((s) => (
            <div
              key={s.id}
              className="tree-row group pl-7"
              data-active={s.id === activeScreenId}
              onClick={() => selectScreen(s.id)}
            >
              <span className="flex-1 truncate">{s.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {s.width}×{s.height}
              </span>
              {project.screens.length > 1 && (
                <button
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeScreen(s.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
          ))}
        </Group>

        <Group
          label={`Variables (${project.variables.length})`}
          icon={<Variable className="h-3 w-3" />}
          open={open.variables!}
          onToggle={() => toggle("variables")}
        >
          {project.variables.map((v) => (
            <div key={v.id} className="tree-row pl-7 font-mono text-[10px]">
              <span className="flex-1 truncate">{v.name}</span>
              <span className="text-muted-foreground">{v.type}</span>
            </div>
          ))}
        </Group>

        <Group
          label={`Widgets (${project.widgets.length})`}
          icon={<Boxes className="h-3 w-3" />}
          open={open.widgets!}
          onToggle={() => toggle("widgets")}
        >
          {project.widgets.length === 0 && (
            <p className="px-7 py-1 text-[10px] text-muted-foreground">
              Agrupa elementos y guárdalos como widget reutilizable.
            </p>
          )}
          {project.widgets.map((w) => (
            <div key={w.id} className="tree-row pl-7">
              <span className="flex-1 truncate">{w.name}</span>
              <span className="text-[10px] text-muted-foreground">{w.params.length} params</span>
            </div>
          ))}
        </Group>

        <Group
          label={`Conexiones (${project.connections.length})`}
          icon={<Radio className="h-3 w-3" />}
          open={open.connections!}
          onToggle={() => toggle("connections")}
        >
          {project.connections.map((c) => (
            <div key={c.id} className="tree-row pl-7">
              <span className="flex-1 truncate">{c.name}</span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: c.connected ? "var(--color-success)" : "var(--color-muted-foreground)",
                }}
              />
            </div>
          ))}
        </Group>

        <Group
          label={`Assets (${project.assets.length})`}
          icon={<FileImage className="h-3 w-3" />}
          open={open.assets!}
          onToggle={() => toggle("assets")}
        >
          {project.assets.map((a) => (
            <div key={a.id} className="tree-row pl-7">
              <span className="flex-1 truncate">{a.name}</span>
              <span className="text-[10px] text-muted-foreground">{a.type}</span>
            </div>
          ))}
        </Group>
      </div>
    </div>
  );
}

function Group({
  label,
  icon,
  open,
  onToggle,
  action,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="tree-row pl-3" onClick={onToggle}>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {icon}
        <span className="flex-1 truncate">{label}</span>
        <span onClick={(e) => e.stopPropagation()}>{action}</span>
      </div>
      {open && children}
    </div>
  );
}
