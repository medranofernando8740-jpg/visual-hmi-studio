import { FlaskConical, Pause, Play } from "lucide-react";
import { useEditor } from "@/stores/editorStore";

export function SimulationPanel({ compact = false }: { compact?: boolean }) {
  const variables = useEditor((s) => s.project.variables);
  const setVariableValue = useEditor((s) => s.setVariableValue);
  const updateVariable = useEditor((s) => s.updateVariable);
  const simRunning = useEditor((s) => s.simRunning);
  const setSimRunning = useEditor((s) => s.setSimRunning);

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <FlaskConical className="h-3 w-3" /> Laboratorio de simulación
        <button
          className="tool-btn ml-auto h-5 px-1"
          data-active={simRunning}
          onClick={() => setSimRunning(!simRunning)}
        >
          {simRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {simRunning ? "Pausar" : "Reanudar"}
        </button>
      </div>
      <div
        className={
          compact
            ? "flex-1 space-y-2 overflow-y-auto p-2"
            : "grid flex-1 grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2 overflow-y-auto p-2"
        }
      >
        {variables.map((v) => (
          <div key={v.id} className="rounded-sm border border-border bg-card p-2">
            <div className="flex items-center gap-1">
              <span className="flex-1 truncate font-mono text-[11px]">{v.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{v.signal}</span>
            </div>

            {v.type === "boolean" ? (
              <button
                className="mt-1.5 w-full rounded-sm px-2 py-1 text-[11px] font-semibold transition-colors"
                style={{
                  background: v.value
                    ? "color-mix(in oklab, var(--color-success) 30%, transparent)"
                    : "var(--color-muted)",
                  color: v.value ? "var(--color-success)" : "var(--color-muted-foreground)",
                }}
                onClick={() => setVariableValue(v.name, !v.value)}
              >
                {v.value ? "ON" : "OFF"}
              </button>
            ) : v.type === "number" ? (
              <>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="range"
                    className="w-full accent-primary"
                    min={v.min}
                    max={v.max}
                    step={(v.max - v.min) / 200 || 1}
                    value={Number(v.value)}
                    onChange={(e) => setVariableValue(v.name, Number(e.target.value))}
                  />
                  <span className="w-20 shrink-0 text-right font-mono text-[11px] text-primary">
                    {Number(v.value).toFixed(1)} {v.unit}
                  </span>
                </div>
                <select
                  className="mini-input mt-1 h-6"
                  value={v.signal}
                  onChange={(e) =>
                    updateVariable(v.id, { signal: e.target.value as typeof v.signal })
                  }
                >
                  {["manual", "sine", "triangle", "ramp", "square", "random", "counter"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <input
                className="mini-input mt-1"
                value={String(v.value)}
                onChange={(e) => setVariableValue(v.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
