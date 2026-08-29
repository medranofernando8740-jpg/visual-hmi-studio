import { Plus, Star, Trash2, Variable as VarIcon } from "lucide-react";
import type { HmiVariable, SignalKind, VariableType } from "@/types/hmi";
import { useEditor } from "@/stores/editorStore";

const SIGNALS: SignalKind[] = [
  "manual",
  "constant",
  "ramp",
  "sine",
  "triangle",
  "square",
  "random",
  "counter",
  "timer",
];

export function VariablesPanel() {
  const variables = useEditor((s) => s.project.variables);
  const { addVariable, updateVariable, removeVariable } = useEditor();

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <VarIcon className="h-3 w-3" /> Variables / Tags
        <button className="tool-btn ml-auto h-5 px-1" onClick={() => addVariable()}>
          <Plus className="h-3 w-3" /> Nueva
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 bg-panel-header text-left text-[10px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1 font-semibold">Nombre</th>
              <th className="px-2 py-1 font-semibold">Tipo</th>
              <th className="px-2 py-1 font-semibold">Valor</th>
              <th className="px-2 py-1 font-semibold">Unidad</th>
              <th className="px-2 py-1 font-semibold">Señal</th>
              <th className="px-2 py-1 font-semibold">Rango</th>
              <th className="px-2 py-1 font-semibold">Fuente</th>
              <th className="px-2 py-1 font-semibold">Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {variables.map((v) => (
              <tr key={v.id} className="border-b border-border hover:bg-accent/40">
                <td className="px-2 py-1">
                  <input
                    className="mini-input h-6"
                    value={v.name}
                    onChange={(e) => updateVariable(v.id, { name: e.target.value })}
                  />
                </td>
                <td className="px-2 py-1">
                  <select
                    className="mini-input h-6"
                    value={v.type}
                    onChange={(e) =>
                      updateVariable(v.id, {
                        type: e.target.value as VariableType,
                        value: e.target.value === "boolean" ? false : 0,
                      })
                    }
                  >
                    <option value="boolean">boolean</option>
                    <option value="number">number</option>
                    <option value="string">string</option>
                  </select>
                </td>
                <td className="px-2 py-1 font-mono">
                  <ValueCell v={v} />
                </td>
                <td className="px-2 py-1">
                  <input
                    className="mini-input h-6 w-16"
                    value={v.unit ?? ""}
                    onChange={(e) => updateVariable(v.id, { unit: e.target.value })}
                  />
                </td>
                <td className="px-2 py-1">
                  <select
                    className="mini-input h-6"
                    value={v.signal}
                    onChange={(e) => updateVariable(v.id, { signal: e.target.value as SignalKind })}
                  >
                    {SIGNALS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <div className="flex gap-1">
                    <input
                      type="number"
                      className="mini-input h-6 w-14"
                      value={v.min}
                      onChange={(e) => updateVariable(v.id, { min: Number(e.target.value) })}
                    />
                    <input
                      type="number"
                      className="mini-input h-6 w-14"
                      value={v.max}
                      onChange={(e) => updateVariable(v.id, { max: Number(e.target.value) })}
                    />
                  </div>
                </td>
                <td className="px-2 py-1 text-muted-foreground">{v.source}</td>
                <td className="px-2 py-1">
                  <span
                    className={
                      v.quality === "good"
                        ? "rounded bg-success/20 px-1.5 py-0.5 text-[10px] text-success"
                        : "rounded bg-warning/20 px-1.5 py-0.5 text-[10px] text-warning"
                    }
                  >
                    {v.quality}
                  </span>
                </td>
                <td className="px-2 py-1">
                  <div className="flex gap-0.5">
                    <button
                      className="tool-btn h-5 px-1"
                      data-active={Boolean(v.favorite)}
                      onClick={() => updateVariable(v.id, { favorite: !v.favorite })}
                      title="Favorita"
                    >
                      <Star className="h-3 w-3" />
                    </button>
                    <button className="tool-btn h-5 px-1" onClick={() => removeVariable(v.id)}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ValueCell({ v }: { v: HmiVariable }) {
  const setVariableValue = useEditor((s) => s.setVariableValue);
  if (v.type === "boolean")
    return (
      <button
        className="tool-btn h-5 px-1.5"
        data-active={Boolean(v.value)}
        onClick={() => setVariableValue(v.name, !v.value)}
      >
        {v.value ? "TRUE" : "FALSE"}
      </button>
    );
  return (
    <input
      className="mini-input h-6 w-20"
      value={String(v.value)}
      onChange={(e) =>
        setVariableValue(v.name, v.type === "number" ? Number(e.target.value) : e.target.value)
      }
    />
  );
}
