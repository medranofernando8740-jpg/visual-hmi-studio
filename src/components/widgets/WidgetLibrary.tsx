import { useRef, useState } from "react";
import {
  AlignLeft,
  BatteryMedium,
  Box,
  CircleDot,
  Cpu,
  Gauge,
  Image as ImageIcon,
  LayoutGrid,
  Lightbulb,
  ListTree,
  Search,
  SlidersHorizontal,
  Sparkles,
  Table as TableIcon,
  Thermometer,
  Type,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { ElementKind } from "@/types/hmi";
import { prettyKind } from "@/lib/factory";
import { importSvg, SAMPLE_FAN_SVG } from "@/lib/svgImport";
import { useEditor } from "@/stores/editorStore";

interface Group {
  id: string;
  label: string;
  icon: typeof Type;
  items: ElementKind[];
}

const GROUPS: Group[] = [
  {
    id: "text",
    label: "Display y texto",
    icon: Type,
    items: ["text", "multitext", "numeric", "textinput", "numericinput"],
  },
  {
    id: "controls",
    label: "Controles",
    icon: SlidersHorizontal,
    items: [
      "button",
      "toggle",
      "switch",
      "checkbox",
      "slider",
      "vslider",
      "knob",
      "dropdown",
    ],
  },
  {
    id: "indicators",
    label: "Indicadores",
    icon: Lightbulb,
    items: [
      "led",
      "pilot",
      "progress",
      "vprogress",
      "circularprogress",
      "gauge",
      "meter",
      "thermometer",
      "battery",
      "level",
      "bargraph",
    ],
  },
  {
    id: "charts",
    label: "Gráficas y datos",
    icon: TableIcon,
    items: ["linechart", "areachart", "barchart", "trend", "table", "alarmlist"],
  },
  {
    id: "graphics",
    label: "Gráficos y formas",
    icon: ImageIcon,
    items: [
      "rect",
      "roundrect",
      "circle",
      "ellipse",
      "line",
      "polygon",
      "path",
      "image",
      "icon",
      "group",
      "frame",
    ],
  },
];

const EQUIPMENT = [
  "Motor",
  "Bomba",
  "Ventilador",
  "Banda transportadora",
  "Válvula",
  "Tanque",
  "Sensor",
  "Inversor",
  "Panel solar",
];

const ICONS: Partial<Record<ElementKind, typeof Type>> = {
  gauge: Gauge,
  meter: Gauge,
  led: CircleDot,
  pilot: CircleDot,
  thermometer: Thermometer,
  battery: BatteryMedium,
  text: AlignLeft,
  group: LayoutGrid,
  frame: Box,
};

export function WidgetLibrary() {
  const [tab, setTab] = useState("text");
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const addElement = useEditor((s) => s.addElement);
  const addElementObject = useEditor((s) => s.addElementObject);
  const widgets = useEditor((s) => s.project.widgets);

  const handleSvgText = (text: string, name: string) => {
    const result = importSvg(text, name);
    if (!result) {
      toast.error("El archivo SVG no se pudo interpretar");
      return;
    }
    addElementObject(result.element);
    toast.success(`SVG importado: ${result.nodeCount} nodos detectados`);
  };

  const groups = query
    ? [
        {
          id: "search",
          label: "Resultados",
          icon: Search,
          items: GROUPS.flatMap((g) => g.items).filter((k) =>
            prettyKind(k).toLowerCase().includes(query.toLowerCase()),
          ),
        },
      ]
    : GROUPS.filter((g) => g.id === tab);

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <LayoutGrid className="h-3 w-3" /> Biblioteca
      </div>

      <div className="flex items-center gap-1 border-b border-border px-1.5 py-1.5">
        <Search className="h-3 w-3 text-muted-foreground" />
        <input
          className="mini-input border-0 bg-transparent font-sans"
          placeholder="Buscar widget…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query && (
        <div className="flex flex-wrap gap-0.5 border-b border-border p-1">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              className="tool-btn text-[10.5px]"
              data-active={tab === g.id}
              onClick={() => setTab(g.id)}
              title={g.label}
            >
              <g.icon className="h-3 w-3" />
            </button>
          ))}
          <button
            className="tool-btn text-[10.5px]"
            data-active={tab === "equipment"}
            onClick={() => setTab("equipment")}
            title="Equipos"
          >
            <Cpu className="h-3 w-3" />
          </button>
          <button
            className="tool-btn text-[10.5px]"
            data-active={tab === "custom"}
            onClick={() => setTab("custom")}
            title="Widgets propios"
          >
            <Sparkles className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-1.5">
        {tab === "equipment" && !query && (
          <div className="space-y-1">
            <p className="field-label px-1">Equipos industriales (plantillas SVG)</p>
            {EQUIPMENT.map((name) => (
              <button
                key={name}
                className="tree-row w-full px-2"
                onClick={() => handleSvgText(SAMPLE_FAN_SVG, name)}
                title="Inserta una plantilla SVG editable por capas"
              >
                <Cpu className="h-3 w-3 text-primary" /> {name}
              </button>
            ))}
          </div>
        )}

        {tab === "custom" && !query && (
          <div className="space-y-1">
            <p className="field-label px-1">Widgets reutilizables</p>
            {widgets.length === 0 && (
              <p className="px-1 py-4 text-[11px] leading-relaxed text-muted-foreground">
                Selecciona varios elementos en el canvas y usa “Crear widget” para guardarlos aquí.
              </p>
            )}
            {widgets.map((w) => (
              <div
                key={w.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("application/hmi-widget", w.id)}
                className="tree-row px-2"
                title={`${w.params.map((p) => p.name).join(", ")}`}
              >
                <Sparkles className="h-3 w-3 text-primary" /> {w.name}
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {w.params.length} params
                </span>
              </div>
            ))}
          </div>
        )}

        {groups.map((g) => (
          <div key={g.id} className="mb-2">
            <p className="field-label px-1 py-1">{g.label}</p>
            <div className="grid grid-cols-2 gap-1">
              {g.items.map((kind) => {
                const Icon = ICONS[kind] ?? Box;
                return (
                  <button
                    key={kind}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("application/hmi-kind", kind)}
                    onDoubleClick={() => addElement(kind)}
                    className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-1.5 py-1.5 text-left text-[10.5px] text-foreground transition-colors hover:border-primary/60 hover:bg-accent"
                    title={`${prettyKind(kind)} — arrastra al canvas`}
                  >
                    <Icon className="h-3 w-3 shrink-0 text-primary" />
                    <span className="truncate">{prettyKind(kind)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-1.5">
        <input
          ref={fileRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            handleSvgText(await file.text(), file.name);
            e.target.value = "";
          }}
        />
        <button
          className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-primary/50 bg-primary/15 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/25"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3 w-3" /> Importar SVG
        </button>
        <button
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-sm border border-border py-1.5 text-[11px] text-muted-foreground hover:bg-accent"
          onClick={() => handleSvgText(SAMPLE_FAN_SVG, "VENTILADOR_DEMO.svg")}
        >
          <ListTree className="h-3 w-3" /> Insertar SVG de ejemplo
        </button>
      </div>
    </div>
  );
}
