import { useEffect, useRef, useState } from "react";
import { Eraser, Pause, Play, Plug, Send, Terminal } from "lucide-react";
import { useEditor } from "@/stores/editorStore";

const BAUDS = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

interface Line {
  dir: "rx" | "tx";
  text: string;
  at: number;
}

/** Mock serial terminal. Web Serial / backend bridge will replace the feed. */
export function SerialMonitor() {
  const target = useEditor((s) => s.project.target);
  const updateTarget = useEditor((s) => s.updateTarget);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hex, setHex] = useState(false);
  const [timestamps, setTimestamps] = useState(true);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connected || paused) return;
    const timer = window.setInterval(() => {
      const rpm = Math.round(800 + Math.random() * 400);
      setLines((l) =>
        [...l, { dir: "rx" as const, text: `{"fan":${rpm},"temp":${(55 + Math.random() * 8).toFixed(1)}}`, at: Date.now() }].slice(-300),
      );
    }, 700);
    return () => window.clearInterval(timer);
  }, [connected, paused]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const render = (l: Line) => {
    const body = hex
      ? Array.from(l.text)
          .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(" ")
      : l.text;
    return `${timestamps ? `[${new Date(l.at).toLocaleTimeString()}] ` : ""}${l.dir === "rx" ? "<<" : ">>"} ${body}`;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <Terminal className="h-3 w-3" /> Serial monitor
      </div>
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-1.5">
        <select
          className="mini-input h-6 w-24"
          value={target.port}
          onChange={(e) => updateTarget({ port: e.target.value })}
        >
          {["COM1", "COM3", "COM4", "/dev/ttyUSB0", "/dev/ttyACM0"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="mini-input h-6 w-24"
          value={target.baudRate}
          onChange={(e) => updateTarget({ baudRate: Number(e.target.value) })}
        >
          {BAUDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <button
          className="tool-btn"
          data-active={connected}
          onClick={() => setConnected((c) => !c)}
        >
          <Plug className="h-3 w-3" /> {connected ? "Desconectar" : "Conectar"}
        </button>
        <button className="tool-btn" data-active={paused} onClick={() => setPaused((p) => !p)}>
          {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />} Pausa
        </button>
        <button className="tool-btn" onClick={() => setLines([])}>
          <Eraser className="h-3 w-3" /> Limpiar
        </button>
        <button className="tool-btn" data-active={hex} onClick={() => setHex((h) => !h)}>
          {hex ? "HEX" : "ASCII"}
        </button>
        <button
          className="tool-btn"
          data-active={timestamps}
          onClick={() => setTimestamps((t) => !t)}
        >
          Timestamp
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-canvas p-2 font-mono text-[11px] leading-relaxed">
        {lines.length === 0 && (
          <p className="text-muted-foreground">
            Terminal inactiva. Conecta un puerto (mock) para ver tráfico RX/TX simulado.
          </p>
        )}
        {lines.map((l, i) => (
          <div key={i} className={l.dir === "rx" ? "text-primary" : "text-warning"}>
            {render(l)}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-center gap-1 border-t border-border p-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          setLines((l) => [...l, { dir: "tx", text: input, at: Date.now() }]);
          setInput("");
        }}
      >
        <input
          className="mini-input"
          placeholder="Enviar comando…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="tool-btn border border-border" type="submit">
          <Send className="h-3 w-3" /> TX
        </button>
      </form>
    </div>
  );
}
