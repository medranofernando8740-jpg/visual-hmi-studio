import { useState } from "react";
import { Activity, Plus, Settings2, Sparkles, Trash2, Waves } from "lucide-react";
import type { BehaviorType } from "@/types/hmi";
import { prettyKind } from "@/lib/factory";
import { useEditor, useSelectedElement } from "@/stores/editorStore";
import { BindingField } from "./BindingField";

const BEHAVIOR_TYPES: BehaviorType[] = [
  "rotate",
  "translateX",
  "translateY",
  "scale",
  "opacity",
  "color",
  "fillLevel",
  "progress",
  "width",
  "height",
  "blink",
  "pulse",
  "shake",
  "flash",
];

type Tab = "props" | "behaviors" | "states" | "widget";

export function Inspector() {
  const el = useSelectedElement();
  const [tab, setTab] = useState<Tab>("props");
  const {
    updateElement,
    updateElementProp,
    addBehavior,
    updateBehavior,
    removeBehavior,
    addState,
    updateState,
    removeState,
    updateWidgetInstanceParam,
    project,
  } = useEditor();
  const screen = useEditor((s) => s.activeScreen());
  const updateScreen = useEditor((s) => s.updateScreen);

  if (!el) {
    return (
      <div className="flex h-full flex-col">
        <div className="panel-title">
          <Settings2 className="h-3 w-3" /> Inspector — Pantalla
        </div>
        <div className="space-y-2 p-2">
          <Field label="Nombre">
            <input
              className="mini-input"
              value={screen.name}
              onChange={(e) => updateScreen({ name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Ancho">
              <input
                type="number"
                className="mini-input"
                value={screen.width}
                onChange={(e) => updateScreen({ width: Number(e.target.value) })}
              />
            </Field>
            <Field label="Alto">
              <input
                type="number"
                className="mini-input"
                value={screen.height}
                onChange={(e) => updateScreen({ height: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Fondo">
            <input
              type="color"
              className="mini-input h-7 p-0.5"
              value={screen.background}
              onChange={(e) => updateScreen({ background: e.target.value })}
            />
          </Field>
          <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
            Selecciona un elemento en el canvas o en el árbol de capas para editar sus propiedades,
            bindings y animaciones.
          </p>
        </div>
      </div>
    );
  }

  const binding = (property: string) => el.bindings.find((b) => b.property === property);
  const widgetDef = project.widgets.find((w) => w.id === el.widgetId);

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <Settings2 className="h-3 w-3" /> {el.name}
        <span className="ml-auto font-mono text-[9.5px] normal-case text-muted-foreground">
          {prettyKind(el.kind)}
        </span>
      </div>

      <div className="flex border-b border-border">
        {(
          [
            ["props", "Propiedades", Settings2],
            ["behaviors", "Comport.", Activity],
            ["states", "Estados", Waves],
            ...(widgetDef ? ([["widget", "Widget", Sparkles]] as const) : []),
          ] as [Tab, string, typeof Settings2][]
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            className="tool-btn flex-1 rounded-none text-[10.5px]"
            data-active={tab === id}
            onClick={() => setTab(id)}
          >
            <Icon className="h-3 w-3" /> {label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {tab === "props" && (
          <>
            <Field label="ID">
              <input className="mini-input opacity-60" readOnly value={el.id} />
            </Field>
            <Field label="Nombre">
              <input
                className="mini-input"
                value={el.name}
                onChange={(e) => updateElement(el.id, { name: e.target.value })}
              />
            </Field>
            {el.svgRef && (
              <Field label="SVG id">
                <input className="mini-input opacity-60" readOnly value={el.svgRef} />
              </Field>
            )}

            {el.kind !== "svgnode" && (
              <div className="grid grid-cols-2 gap-2">
                <NumField label="X" value={el.x} onChange={(x) => updateElement(el.id, { x })} />
                <NumField label="Y" value={el.y} onChange={(y) => updateElement(el.id, { y })} />
                <NumField
                  label="Ancho"
                  value={el.width}
                  onChange={(width) => updateElement(el.id, { width })}
                />
                <NumField
                  label="Alto"
                  value={el.height}
                  onChange={(height) => updateElement(el.id, { height })}
                />
              </div>
            )}

            <BindingField
              elementId={el.id}
              property="rotation"
              label="Rotación (°)"
              binding={binding("rotation")}
            >
              <input
                type="number"
                className="mini-input"
                value={el.rotation}
                onChange={(e) => updateElement(el.id, { rotation: Number(e.target.value) })}
              />
            </BindingField>

            <BindingField
              elementId={el.id}
              property="opacity"
              label="Opacidad"
              binding={binding("opacity")}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                className="w-full accent-primary"
                value={el.opacity}
                onChange={(e) => updateElement(el.id, { opacity: Number(e.target.value) })}
              />
            </BindingField>

            <BindingField
              elementId={el.id}
              property="visible"
              label="Visible"
              binding={binding("visible")}
            >
              <button
                className="tool-btn w-full justify-start"
                data-active={el.visible}
                onClick={() => updateElement(el.id, { visible: !el.visible })}
              >
                {el.visible ? "Visible" : "Oculto"}
              </button>
            </BindingField>

            <BindingField elementId={el.id} property="fill" label="Color" binding={binding("fill")}>
              <div className="flex gap-1">
                <input
                  type="color"
                  className="mini-input h-7 w-10 p-0.5"
                  value={/^#/.test(el.fill) ? el.fill : "#2b3442"}
                  onChange={(e) => updateElement(el.id, { fill: e.target.value })}
                />
                <input
                  className="mini-input"
                  value={el.fill}
                  onChange={(e) => updateElement(el.id, { fill: e.target.value })}
                />
              </div>
            </BindingField>

            {el.kind !== "svgnode" && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Borde">
                  <input
                    type="color"
                    className="mini-input h-7 p-0.5"
                    value={/^#/.test(el.stroke) ? el.stroke : "#3f4a5a"}
                    onChange={(e) => updateElement(el.id, { stroke: e.target.value })}
                  />
                </Field>
                <NumField
                  label="Grosor"
                  value={el.strokeWidth}
                  onChange={(strokeWidth) => updateElement(el.id, { strokeWidth })}
                />
                <NumField
                  label="Radio"
                  value={el.radius}
                  onChange={(radius) => updateElement(el.id, { radius })}
                />
                {el.fontSize !== undefined && (
                  <NumField
                    label="Fuente"
                    value={el.fontSize}
                    onChange={(fontSize) => updateElement(el.id, { fontSize })}
                  />
                )}
              </div>
            )}

            {el.text !== undefined && (
              <BindingField
                elementId={el.id}
                property="text"
                label="Texto"
                binding={binding("text")}
              >
                <input
                  className="mini-input font-sans"
                  value={el.text}
                  onChange={(e) => updateElement(el.id, { text: e.target.value })}
                />
              </BindingField>
            )}

            {el.props["value"] !== undefined && (
              <>
                <BindingField
                  elementId={el.id}
                  property="value"
                  label="Valor"
                  binding={binding("value")}
                >
                  <input
                    type="number"
                    className="mini-input"
                    value={Number(el.props["value"])}
                    onChange={(e) => updateElementProp(el.id, "value", Number(e.target.value))}
                  />
                </BindingField>
                <div className="grid grid-cols-2 gap-2">
                  <NumField
                    label="Mín"
                    value={Number(el.props["min"] ?? 0)}
                    onChange={(v) => updateElementProp(el.id, "min", v)}
                  />
                  <NumField
                    label="Máx"
                    value={Number(el.props["max"] ?? 100)}
                    onChange={(v) => updateElementProp(el.id, "max", v)}
                  />
                  <Field label="Unidad">
                    <input
                      className="mini-input"
                      value={String(el.props["unit"] ?? "")}
                      onChange={(e) => updateElementProp(el.id, "unit", e.target.value)}
                    />
                  </Field>
                  <NumField
                    label="Decimales"
                    value={Number(el.props["decimals"] ?? 1)}
                    onChange={(v) => updateElementProp(el.id, "decimals", v)}
                  />
                </div>
              </>
            )}
          </>
        )}

        {tab === "behaviors" && (
          <>
            <div className="flex items-center gap-1">
              <select
                className="mini-input"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) addBehavior(el.id, e.target.value as BehaviorType);
                  e.target.value = "";
                }}
              >
                <option value="">+ Agregar comportamiento…</option>
                {BEHAVIOR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {el.behaviors.length === 0 && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Sin comportamientos. Ejemplo: <code>rotate</code> con condición{" "}
                <code>FAN_RUNNING == true</code> y velocidad desde <code>FAN_SPEED</code>.
              </p>
            )}

            {el.behaviors.map((b) => (
              <div key={b.id} className="space-y-1.5 rounded-sm border border-border bg-card p-2">
                <div className="flex items-center gap-1">
                  <select
                    className="mini-input flex-1"
                    value={b.type}
                    onChange={(e) =>
                      updateBehavior(el.id, b.id, { type: e.target.value as BehaviorType })
                    }
                  >
                    {BEHAVIOR_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    className="tool-btn h-6 px-1"
                    data-active={b.enabled}
                    onClick={() => updateBehavior(el.id, b.id, { enabled: !b.enabled })}
                    title="Habilitar/deshabilitar"
                  >
                    <Activity className="h-3 w-3" />
                  </button>
                  <button
                    className="tool-btn h-6 px-1"
                    onClick={() => removeBehavior(el.id, b.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <Field label="Cuando (condición)">
                  <input
                    className="mini-input"
                    placeholder="FAN_RUNNING == true"
                    defaultValue={b.condition ?? ""}
                    onBlur={(e) => updateBehavior(el.id, b.id, { condition: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Variable de valor">
                    <select
                      className="mini-input"
                      value={b.valueVariable ?? ""}
                      onChange={(e) =>
                        updateBehavior(el.id, b.id, { valueVariable: e.target.value })
                      }
                    >
                      <option value="">— fijo —</option>
                      {project.variables.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <NumField
                    label="Velocidad"
                    value={b.speed}
                    onChange={(speed) => updateBehavior(el.id, b.id, { speed })}
                  />
                  <Field label="Dirección">
                    <select
                      className="mini-input"
                      value={b.direction}
                      onChange={(e) =>
                        updateBehavior(el.id, b.id, {
                          direction: e.target.value as typeof b.direction,
                        })
                      }
                    >
                      <option value="cw">Clockwise</option>
                      <option value="ccw">Counter-clockwise</option>
                      <option value="normal">Normal</option>
                      <option value="reverse">Reverse</option>
                    </select>
                  </Field>
                  <Field label="Modo">
                    <select
                      className="mini-input"
                      value={b.mode}
                      onChange={(e) =>
                        updateBehavior(el.id, b.id, { mode: e.target.value as typeof b.mode })
                      }
                    >
                      <option value="continuous">Continuous</option>
                      <option value="oneshot">One-shot</option>
                      <option value="pingpong">Ping-pong</option>
                    </select>
                  </Field>
                  <NumField
                    label="Mín"
                    value={b.min}
                    onChange={(min) => updateBehavior(el.id, b.id, { min })}
                  />
                  <NumField
                    label="Máx"
                    value={b.max}
                    onChange={(max) => updateBehavior(el.id, b.id, { max })}
                  />
                  <NumField
                    label="Distancia px"
                    value={b.distance}
                    onChange={(distance) => updateBehavior(el.id, b.id, { distance })}
                  />
                  <NumField
                    label="Duración ms"
                    value={b.durationMs}
                    onChange={(durationMs) => updateBehavior(el.id, b.id, { durationMs })}
                  />
                </div>

                {b.type === "color" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Color bajo">
                      <input
                        type="color"
                        className="mini-input h-7 p-0.5"
                        value={b.colorLow}
                        onChange={(e) => updateBehavior(el.id, b.id, { colorLow: e.target.value })}
                      />
                    </Field>
                    <Field label="Color alto">
                      <input
                        type="color"
                        className="mini-input h-7 p-0.5"
                        value={b.colorHigh}
                        onChange={(e) => updateBehavior(el.id, b.id, { colorHigh: e.target.value })}
                      />
                    </Field>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {tab === "states" && (
          <>
            <button
              className="tool-btn w-full justify-center border border-border"
              onClick={() => addState(el.id)}
            >
              <Plus className="h-3 w-3" /> Agregar estado
            </button>
            {el.states.map((st) => (
              <div key={st.id} className="space-y-1.5 rounded-sm border border-border bg-card p-2">
                <div className="flex gap-1">
                  <input
                    className="mini-input flex-1"
                    value={st.name}
                    onChange={(e) => updateState(el.id, st.id, { name: e.target.value })}
                  />
                  <button className="tool-btn h-6 px-1" onClick={() => removeState(el.id, st.id)}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <Field label="Condición">
                  <input
                    className="mini-input"
                    placeholder="MOTOR_ALARM == true"
                    defaultValue={st.condition}
                    onBlur={(e) => updateState(el.id, st.id, { condition: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Color">
                    <input
                      type="color"
                      className="mini-input h-7 p-0.5"
                      value={st.fill ?? "#22c55e"}
                      onChange={(e) => updateState(el.id, st.id, { fill: e.target.value })}
                    />
                  </Field>
                  <Field label="Parpadeo">
                    <button
                      className="tool-btn w-full justify-center"
                      data-active={Boolean(st.blink)}
                      onClick={() => updateState(el.id, st.id, { blink: !st.blink })}
                    >
                      {st.blink ? "Blink ON" : "Blink OFF"}
                    </button>
                  </Field>
                </div>
                <Field label="Texto (opcional)">
                  <input
                    className="mini-input font-sans"
                    defaultValue={st.text ?? ""}
                    onBlur={(e) => updateState(el.id, st.id, { text: e.target.value })}
                  />
                </Field>
              </div>
            ))}
          </>
        )}

        {tab === "widget" && widgetDef && (
          <>
            <p className="field-label">Parámetros de la instancia</p>
            {widgetDef.params.map((p) => (
              <Field key={p.name} label={`${p.name} (${p.type})`}>
                <select
                  className="mini-input"
                  value={el.paramMap?.[p.name] ?? ""}
                  onChange={(e) => updateWidgetInstanceParam(el.id, p.name, e.target.value)}
                >
                  <option value="">— sin conectar —</option>
                  {project.variables
                    .filter((v) => v.type === p.type)
                    .map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                </select>
              </Field>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        className="mini-input"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
