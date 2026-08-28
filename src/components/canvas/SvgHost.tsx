import { useEffect, useRef } from "react";
import type { HmiElement } from "@/types/hmi";
import type { VarScope } from "@/lib/expression";
import { computeRuntime } from "@/lib/runtime";
import { flatten } from "@/lib/tree";
import { useEditor } from "@/stores/editorStore";

interface Props {
  el: HmiElement;
  scope: VarScope;
  live: boolean;
}

/**
 * Renders an imported SVG document and applies bindings/behaviors imperatively
 * to the nodes referenced by the element tree. Keeping the original markup
 * intact allows future SVG export.
 */
export function SvgHost({ el, scope, live }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const highlightId = useEditor((s) => s.selectedIds[0]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const nodes = flatten(el.children ?? []).map((x) => x.el);

    for (const node of nodes) {
      if (!node.svgRef) continue;
      let target: Element | null = null;
      try {
        target = host.querySelector(`#${CSS.escape(node.svgRef)}`);
      } catch {
        target = null;
      }
      if (!(target instanceof SVGElement)) continue;
      const rt = computeRuntime(node, scope, live);
      const style = target.style;
      style.transformBox = "fill-box";
      style.transformOrigin = "center";
      style.animation = rt.animation || "";
      style.setProperty("--hmi-dist", `${rt.animDistance}px`);
      style.opacity = rt.visible ? String(rt.opacity) : "0";
      style.transform =
        rt.animation && rt.animation.includes("hmi-spin")
          ? ""
          : `rotate(${rt.rotation}deg) translate(${rt.dx}px, ${rt.dy}px) scale(${rt.scale})`;
      if (rt.fill && rt.fill !== node.fill) style.fill = rt.fill;
      else if (!rt.fill) style.removeProperty("fill");
      style.outline = node.id === highlightId ? "1.5px dashed var(--color-selection)" : "";
    }
  }, [el, scope, live, highlightId]);

  return (
    <div
      ref={hostRef}
      className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
      // markup is produced by our own SVG importer/serializer
      dangerouslySetInnerHTML={{ __html: el.svgMarkup ?? "" }}
    />
  );
}
