import { createFileRoute } from "@tanstack/react-router";
import { EditorShell } from "@/components/editor/EditorShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HMI Studio — Editor visual HMI para microcontroladores" },
      {
        name: "description",
        content:
          "Entorno profesional de diseño HMI: canvas vectorial, bindings a tags, simulación en tiempo real y configuración de comunicación industrial.",
      },
      { property: "og:title", content: "HMI Studio — Editor visual HMI industrial" },
      {
        property: "og:description",
        content:
          "Diseña pantallas HMI para ESP32, STM32 y RP2040 con bindings, animaciones y simulación de señales.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  return (
    <main>
      <EditorShell />
    </main>
  );
}
