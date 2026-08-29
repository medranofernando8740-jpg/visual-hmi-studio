import { useState } from "react";
import { Link2, Link2Off, Variable } from "lucide-react";
import type { Binding, BindingMode } from "@/types/hmi";
import { useEditor } from "@/stores/editorStore";

interface Props {
  elementId: string;
  property: string;
  label: string;
  binding: Binding | undefined;
  children: React.ReactNode;
}

/** Property row with the fixed / variable / expression binding switch. */
export function BindingField({ elementId, property, label, binding, children }: Props) {
  const [open, setOpen] = useState(false);
  const variables = useEditor((s) => s.project.variables);
  const setBinding = useEditor((s) => s.setBinding);
  const removeBinding = useEditor((s) => s.removeBinding);
  const bound = binding && binding.mode !== "fixed";

  const update = (patch: Partial<Binding>) =>
    setBinding(elementId, {
      property,
      mode: binding?.mode ?? "variable",
      ...(binding?.variable ? { variable: binding.variable } : {}),
      ...(binding?.expression ? { expression: binding.expression } : {}),
      ...patch,
    } as Binding);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="field-label flex-1">{label}</span>
        <button
          className="tool-btn h-5 px-1"
          data-active={Boolean(bound)}
          title="Conectar a variable o expresión"
          onClick={() => setOpen(!open)}
        >
          {bound ? <Link2 className="h-3 w-3" /> : <Link2Off className="h-3 w-3" />}
        </button>
      </div>

      {bound ? (
        <div className="flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-1 font-mono text-[10.5px] text-primary">
          <Variable className="h-3 w-3" />
          <span className="truncate">
            {binding!.mode === "variable" ? binding!.variable : binding!.expression}
          </span>
        </div>
      ) : (
        children
      )}

      {open && (
        <div className="space-y-1 rounded-sm border border-border bg-card p-1.5">
          <div className="flex gap-1">
            {(["fixed", "variable", "expression"] as BindingMode[]).map((m) => (
              <button
                key={m}
                className="tool-btn h-5 flex-1 text-[10px]"
                data-active={(binding?.mode ?? "fixed") === m}
                onClick={() => (m === "fixed" ? removeBinding(elementId, property) : update({ mode: m }))}
              >
                {m === "fixed" ? "Fijo" : m === "variable" ? "Variable" : "Expresión"}
              </button>
            ))}
          </div>
          {binding?.mode === "variable" && (
            <select
              className="mini-input"
              value={binding.variable ?? ""}
              onChange={(e) => update({ variable: e.target.value })}
            >
              <option value="">— seleccionar tag —</option>
              {variables.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name} ({v.type})
                </option>
              ))}
            </select>
          )}
          {binding?.mode === "expression" && (
            <input
              className="mini-input"
              placeholder="ej. FAN_SPEED * 0.1"
              defaultValue={binding.expression ?? ""}
              onBlur={(e) => update({ expression: e.target.value })}
            />
          )}
        </div>
      )}
    </div>
  );
}
