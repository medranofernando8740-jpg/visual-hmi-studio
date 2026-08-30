import { Cpu } from "lucide-react";
import type { ProtocolKind } from "@/types/hmi";
import { useEditor } from "@/stores/editorStore";

const BOARDS = [
  { model: "esp32-s3", label: "ESP32-S3 (dual core, PSRAM)", w: 480, h: 320 },
  { model: "esp32", label: "ESP32 WROOM-32", w: 320, h: 240 },
  { model: "stm32f7", label: "STM32F746 Discovery", w: 480, h: 272 },
  { model: "stm32h7", label: "STM32H750 + RGB TFT", w: 800, h: 480 },
  { model: "rp2040", label: "Raspberry Pi Pico (RP2040)", w: 320, h: 240 },
  { model: "atmega2560", label: "Arduino Mega 2560", w: 320, h: 240 },
  { model: "nrf52840", label: "nRF52840 (BLE)", w: 240, h: 240 },
];

export function TargetPanel() {
  const target = useEditor((s) => s.project.target);
  const screen = useEditor((s) => s.activeScreen());
  const updateTarget = useEditor((s) => s.updateTarget);
  const updateScreen = useEditor((s) => s.updateScreen);

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <Cpu className="h-3 w-3" /> Target device
      </div>
      <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 overflow-y-auto p-3">
        <section className="space-y-2">
          <p className="field-label">Microcontrolador</p>
          <select
            className="mini-input"
            value={target.model}
            onChange={(e) => {
              const b = BOARDS.find((x) => x.model === e.target.value)!;
              updateTarget({
                model: b.model,
                name: b.label,
                displayWidth: b.w,
                displayHeight: b.h,
              });
            }}
          >
            {BOARDS.map((b) => (
              <option key={b.model} value={b.model}>
                {b.label}
              </option>
            ))}
          </select>
          <label className="block space-y-1">
            <span className="field-label">Protocolo por defecto</span>
            <select
              className="mini-input"
              value={target.protocol}
              onChange={(e) => updateTarget({ protocol: e.target.value as ProtocolKind })}
            >
              {["uart", "usb-serial", "rs485", "modbus-rtu", "modbus-tcp", "mqtt"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="field-label">Puerto</span>
            <input
              className="mini-input"
              value={target.port}
              onChange={(e) => updateTarget({ port: e.target.value })}
            />
          </label>
        </section>

        <section className="space-y-2">
          <p className="field-label">Display</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="field-label">Ancho</span>
              <input
                type="number"
                className="mini-input"
                value={target.displayWidth}
                onChange={(e) => updateTarget({ displayWidth: Number(e.target.value) })}
              />
            </label>
            <label className="space-y-1">
              <span className="field-label">Alto</span>
              <input
                type="number"
                className="mini-input"
                value={target.displayHeight}
                onChange={(e) => updateTarget({ displayHeight: Number(e.target.value) })}
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="field-label">Orientación</span>
            <select
              className="mini-input"
              value={target.orientation}
              onChange={(e) =>
                updateTarget({ orientation: e.target.value as "landscape" | "portrait" })
              }
            >
              <option value="landscape">landscape</option>
              <option value="portrait">portrait</option>
            </select>
          </label>
          <button
            className="tool-btn w-full border border-border"
            onClick={() =>
              updateScreen({ width: target.displayWidth, height: target.displayHeight })
            }
          >
            Aplicar resolución a “{screen.name}”
          </button>
        </section>

        <section className="space-y-2">
          <p className="field-label">Resumen de recursos (estimado)</p>
          <dl className="space-y-1 font-mono text-[11px]">
            <Stat label="Resolución pantalla" value={`${screen.width}×${screen.height}`} />
            <Stat label="Framebuffer 16bpp" value={`${((screen.width * screen.height * 2) / 1024).toFixed(1)} KB`} />
            <Stat label="Elementos en pantalla" value={String(screen.elements.length)} />
            <Stat label="Baud rate" value={String(target.baudRate)} />
          </dl>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            La generación de firmware y el flasheo se habilitarán cuando el backend de compilación
            esté conectado.
          </p>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
