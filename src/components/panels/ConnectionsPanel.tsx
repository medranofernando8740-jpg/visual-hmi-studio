import { Plus, Radio } from "lucide-react";
import type { ProtocolKind } from "@/types/hmi";
import { useEditor } from "@/stores/editorStore";

const PROTOCOLS: ProtocolKind[] = [
  "uart",
  "usb-serial",
  "rs232",
  "rs485",
  "modbus-rtu",
  "modbus-ascii",
  "modbus-tcp",
  "mqtt",
  "websocket",
  "http",
  "opc-ua",
];
const BAUDS = [4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export function ConnectionsPanel() {
  const connections = useEditor((s) => s.project.connections);
  const { updateConnection, addConnection } = useEditor();

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <Radio className="h-3 w-3" /> Connections / Communication
        <button className="tool-btn ml-auto h-5 px-1" onClick={addConnection}>
          <Plus className="h-3 w-3" /> Nueva
        </button>
      </div>
      <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2 overflow-y-auto p-2">
        {connections.map((c) => {
          const isNet = ["modbus-tcp", "mqtt", "websocket", "http", "opc-ua"].includes(c.protocol);
          return (
            <div key={c.id} className="space-y-2 rounded-sm border border-border bg-card p-2">
              <div className="flex items-center gap-1">
                <input
                  className="mini-input flex-1 font-sans"
                  value={c.name}
                  onChange={(e) => updateConnection(c.id, { name: e.target.value })}
                />
                <button
                  className="tool-btn border border-border"
                  data-active={c.connected}
                  onClick={() => updateConnection(c.id, { connected: !c.connected })}
                >
                  {c.connected ? "Online" : "Offline"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Row label="Protocolo">
                  <select
                    className="mini-input"
                    value={c.protocol}
                    onChange={(e) =>
                      updateConnection(c.id, { protocol: e.target.value as ProtocolKind })
                    }
                  >
                    {PROTOCOLS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Row>

                {isNet ? (
                  <>
                    <Row label="Host">
                      <input
                        className="mini-input"
                        value={c.host ?? "192.168.1.50"}
                        onChange={(e) => updateConnection(c.id, { host: e.target.value })}
                      />
                    </Row>
                    <Row label="Puerto TCP">
                      <input
                        type="number"
                        className="mini-input"
                        value={c.tcpPort ?? 502}
                        onChange={(e) => updateConnection(c.id, { tcpPort: Number(e.target.value) })}
                      />
                    </Row>
                  </>
                ) : (
                  <>
                    <Row label="COM port">
                      <input
                        className="mini-input"
                        value={c.port}
                        onChange={(e) => updateConnection(c.id, { port: e.target.value })}
                      />
                    </Row>
                    <Row label="Baud rate">
                      <select
                        className="mini-input"
                        value={c.baudRate}
                        onChange={(e) =>
                          updateConnection(c.id, { baudRate: Number(e.target.value) })
                        }
                      >
                        {BAUDS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Row>
                    <Row label="Data bits">
                      <select
                        className="mini-input"
                        value={c.dataBits}
                        onChange={(e) =>
                          updateConnection(c.id, { dataBits: Number(e.target.value) })
                        }
                      >
                        {[5, 6, 7, 8].map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Row>
                    <Row label="Stop bits">
                      <select
                        className="mini-input"
                        value={c.stopBits}
                        onChange={(e) =>
                          updateConnection(c.id, { stopBits: Number(e.target.value) })
                        }
                      >
                        {[1, 2].map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Row>
                    <Row label="Paridad">
                      <select
                        className="mini-input"
                        value={c.parity}
                        onChange={(e) =>
                          updateConnection(c.id, { parity: e.target.value as typeof c.parity })
                        }
                      >
                        {["none", "even", "odd"].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Row>
                    <Row label="Flow control">
                      <select
                        className="mini-input"
                        value={c.flowControl}
                        onChange={(e) =>
                          updateConnection(c.id, {
                            flowControl: e.target.value as typeof c.flowControl,
                          })
                        }
                      >
                        {["none", "hardware", "software"].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Row>
                  </>
                )}

                <Row label="Read timeout (ms)">
                  <input
                    type="number"
                    className="mini-input"
                    value={c.readTimeout}
                    onChange={(e) => updateConnection(c.id, { readTimeout: Number(e.target.value) })}
                  />
                </Row>
                <Row label="Write timeout (ms)">
                  <input
                    type="number"
                    className="mini-input"
                    value={c.writeTimeout}
                    onChange={(e) =>
                      updateConnection(c.id, { writeTimeout: Number(e.target.value) })
                    }
                  />
                </Row>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Driver pendiente: la configuración se enviará al motor de comunicación (Web Serial /
                Modbus / MQTT) cuando el backend esté disponible.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
