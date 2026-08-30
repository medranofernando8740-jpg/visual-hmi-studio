import { useState } from "react";
import { Hammer, Loader2, Upload } from "lucide-react";
import { useEditor } from "@/stores/editorStore";

interface LogLine {
  level: "info" | "warn" | "ok" | "error";
  text: string;
}

/** Mock build/flash console. A real toolchain job runner will replace this. */
export function BuildPanel() {
  const project = useEditor((s) => s.project);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogLine[]>([
    { level: "info", text: "Toolchain no conectado — salida simulada." },
  ]);

  const run = async (kind: "build" | "flash") => {
    setBusy(true);
    const steps: LogLine[] = [
      { level: "info", text: `> hmi ${kind} --target ${project.target.model}` },
      { level: "info", text: `Compilando ${project.screens.length} pantalla(s), ${project.variables.length} tags…` },
      { level: "info", text: "Generando ui_screens.c / ui_screens.h" },
      { level: "warn", text: "warning: 2 elementos exceden el área del display" },
      { level: "info", text: "Enlazando firmware.elf" },
      ...(kind === "flash"
        ? [
            { level: "info" as const, text: `Abriendo ${project.target.port} @ ${project.target.baudRate}` },
            { level: "info" as const, text: "Escribiendo 100% (0x10000)" },
          ]
        : []),
      { level: "ok", text: `${kind === "build" ? "Compilación" : "Flasheo"} completado en 3.4 s` },
    ];
    for (const s of steps) {
      await new Promise((r) => setTimeout(r, 320));
      setLog((l) => [...l, s]);
    }
    setBusy(false);
  };

  const color = {
    info: "text-muted-foreground",
    warn: "text-warning",
    ok: "text-success",
    error: "text-destructive",
  };

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <Hammer className="h-3 w-3" /> Build / Flash output
        <div className="ml-auto flex gap-1">
          <button className="tool-btn" disabled={busy} onClick={() => run("build")}>
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Hammer className="h-3 w-3" />}{" "}
            Compilar
          </button>
          <button className="tool-btn" disabled={busy} onClick={() => run("flash")}>
            <Upload className="h-3 w-3" /> Flashear
          </button>
          <button className="tool-btn" onClick={() => setLog([])}>
            Limpiar
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-canvas p-2 font-mono text-[11px] leading-relaxed">
        {log.map((l, i) => (
          <div key={i} className={color[l.level]}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
