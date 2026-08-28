import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Lock,
  LockOpen,
  MoveDown,
  MoveUp,
  Trash2,
} from "lucide-react";
import type { HmiElement } from "@/types/hmi";
import { useEditor } from "@/stores/editorStore";

export function LayersPanel() {
  const screen = useEditor((s) => s.activeScreen());
  const { selectedIds, select, updateElement, reorder, moveElementTo, deleteSelection } =
    useEditor();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [renaming, setRenaming] = useState<string | null>(null);

  const Row = ({ el, depth }: { el: HmiElement; depth: number }) => {
    const hasKids = Boolean(el.children?.length);
    const open = !collapsed[el.id];
    return (
      <>
        <div
          className="tree-row group"
          data-selected={selectedIds.includes(el.id)}
          style={{ paddingLeft: 4 + depth * 12 }}
          draggable={depth === 0}
          onDragStart={(e) => e.dataTransfer.setData("application/hmi-layer", el.id)}
          onDragOver={(e) => depth === 0 && e.preventDefault()}
          onDrop={(e) => {
            const dragId = e.dataTransfer.getData("application/hmi-layer");
            if (dragId) moveElementTo(dragId, el.id);
          }}
          onClick={() => select([el.id])}
          onDoubleClick={() => setRenaming(el.id)}
        >
          <button
            className="flex h-3 w-3 items-center justify-center text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              if (hasKids) setCollapsed((c) => ({ ...c, [el.id]: open }));
            }}
          >
            {hasKids ? (
              open ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )
            ) : null}
          </button>

          {renaming === el.id ? (
            <input
              autoFocus
              defaultValue={el.name}
              className="mini-input h-5 flex-1"
              onBlur={(e) => {
                updateElement(el.id, { name: e.target.value });
                setRenaming(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <span className="flex-1 truncate">{el.name}</span>
          )}

          <span className="font-mono text-[9.5px] uppercase text-muted-foreground opacity-60">
            {el.kind}
          </span>
          <button
            className="text-muted-foreground opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              updateElement(el.id, { locked: !el.locked });
            }}
            title={el.locked ? "Desbloquear" : "Bloquear"}
          >
            {el.locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
          </button>
          <button
            className="text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              updateElement(el.id, { visible: !el.visible });
            }}
            title={el.visible ? "Ocultar" : "Mostrar"}
          >
            {el.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 opacity-50" />}
          </button>
        </div>
        {hasKids &&
          open &&
          el.children!.map((c) => <Row key={c.id} el={c} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <Layers className="h-3 w-3" /> Capas — {screen.name}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            className="tool-btn h-5 px-1"
            title="Subir"
            onClick={() => selectedIds[0] && reorder(selectedIds[0], "forward")}
          >
            <MoveUp className="h-3 w-3" />
          </button>
          <button
            className="tool-btn h-5 px-1"
            title="Bajar"
            onClick={() => selectedIds[0] && reorder(selectedIds[0], "backward")}
          >
            <MoveDown className="h-3 w-3" />
          </button>
          <button className="tool-btn h-5 px-1" title="Eliminar" onClick={deleteSelection}>
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {[...screen.elements].reverse().map((el) => (
          <Row key={el.id} el={el} depth={0} />
        ))}
        {screen.elements.length === 0 && (
          <p className="p-3 text-[11px] text-muted-foreground">
            La pantalla está vacía. Arrastra widgets desde la biblioteca.
          </p>
        )}
      </div>
    </div>
  );
}
