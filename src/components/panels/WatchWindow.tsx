import { Eye, Star } from "lucide-react";
import { useEditor } from "@/stores/editorStore";

export function WatchWindow() {
  const variables = useEditor((s) => s.project.variables);
  const updateVariable = useEditor((s) => s.updateVariable);
  const favorites = variables.filter((v) => v.favorite);
  const list = favorites.length ? favorites : variables;

  return (
    <div className="flex h-full flex-col">
      <div className="panel-title">
        <Eye className="h-3 w-3" /> Watch window
        <span className="ml-auto normal-case text-muted-foreground">
          {favorites.length ? "favoritas" : "todas las variables"}
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead className="sticky top-0 bg-panel-header text-left text-[10px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1">Variable</th>
              <th className="px-2 py-1">Tipo</th>
              <th className="px-2 py-1 text-right">Valor</th>
              <th className="px-2 py-1">Unidad</th>
              <th className="px-2 py-1">Fuente</th>
              <th className="px-2 py-1">Timestamp</th>
              <th className="px-2 py-1">Calidad</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.id} className="border-b border-border">
                <td className="px-2 py-1 text-foreground">{v.name}</td>
                <td className="px-2 py-1 text-muted-foreground">{v.type}</td>
                <td className="px-2 py-1 text-right text-primary">
                  {typeof v.value === "number" ? v.value.toFixed(2) : String(v.value)}
                </td>
                <td className="px-2 py-1 text-muted-foreground">{v.unit ?? "—"}</td>
                <td className="px-2 py-1 text-muted-foreground">{v.source}</td>
                <td className="px-2 py-1 text-muted-foreground">
                  {new Date(v.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-2 py-1 text-success">{v.quality}</td>
                <td className="px-2 py-1">
                  <button
                    className="tool-btn h-5 px-1"
                    data-active={Boolean(v.favorite)}
                    onClick={() => updateVariable(v.id, { favorite: !v.favorite })}
                  >
                    <Star className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
