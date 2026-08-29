import { useEffect } from "react";
import { useEditor } from "@/stores/editorStore";

/**
 * Simulated data source. In a future release this loop is replaced by the
 * Laravel/driver bridge (Web Serial, MQTT, Modbus...) pushing real tag values.
 */
export function useSimulation() {
  const mode = useEditor((s) => s.mode);
  const simRunning = useEditor((s) => s.simRunning);

  useEffect(() => {
    if (mode === "design" || !simRunning) return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const t = performance.now() - start;
      const { project, setVariableValue } = useEditor.getState();
      for (const v of project.variables) {
        if (v.signal === "manual" || v.signal === "constant") continue;
        const period = Math.max(200, v.periodMs);
        const phase = ((t % period) / period) * Math.PI * 2;
        const span = v.max - v.min;
        let next: number | boolean = Number(v.value);
        switch (v.signal) {
          case "sine":
            next = v.min + ((Math.sin(phase) + 1) / 2) * span;
            break;
          case "triangle": {
            const x = (t % period) / period;
            next = v.min + (x < 0.5 ? x * 2 : (1 - x) * 2) * span;
            break;
          }
          case "ramp":
            next = v.min + ((t % period) / period) * span;
            break;
          case "square":
            next = (t % period) / period < 0.5 ? v.min : v.max;
            break;
          case "random":
            next = v.min + Math.random() * span;
            break;
          case "counter":
            next = v.min + (Math.floor(t / period) % Math.max(1, span));
            break;
          case "timer":
            next = Math.floor(t / 1000);
            break;
        }
        if (v.type === "boolean") setVariableValue(v.name, Number(next) > (v.min + v.max) / 2);
        else setVariableValue(v.name, Math.round(Number(next) * 100) / 100);
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [mode, simRunning]);
}
