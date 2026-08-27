import { create } from "zustand";
import type {
  Behavior,
  BehaviorType,
  Binding,
  ConnectionConfig,
  EditorMode,
  ElementKind,
  HmiElement,
  HmiVariable,
  Project,
  Screen,
  TargetDevice,
  VisualState,
  WidgetDefinition,
} from "@/types/hmi";
import { createBehavior, createElement } from "@/lib/factory";
import {
  cloneWithNewIds,
  findElement,
  findParent,
  mapElement,
  removeElement,
  uid,
} from "@/lib/tree";
import { createDemoProject } from "@/services/demoProject";
import { projectRepository } from "@/services/api";

export type PanelTab =
  | "variables"
  | "simulation"
  | "monitor"
  | "serial"
  | "build"
  | "connections"
  | "target";

interface EditorState {
  project: Project;
  activeScreenId: string;
  selectedIds: string[];
  mode: EditorMode;
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  bottomTab: PanelTab;
  dirty: boolean;
  past: Project[];
  future: Project[];
  simRunning: boolean;

  // meta
  hydrate: () => Promise<void>;
  save: () => Promise<void>;
  setMode: (mode: EditorMode) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setBottomTab: (tab: PanelTab) => void;
  undo: () => void;
  redo: () => void;

  // screens
  activeScreen: () => Screen;
  addScreen: () => void;
  selectScreen: (id: string) => void;
  updateScreen: (patch: Partial<Screen>) => void;
  removeScreen: (id: string) => void;

  // elements
  select: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  addElement: (kind: ElementKind, x?: number, y?: number) => void;
  addElementObject: (el: HmiElement) => void;
  updateElement: (id: string, patch: Partial<HmiElement>) => void;
  updateElementProp: (id: string, key: string, value: string | number | boolean) => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  groupSelection: () => void;
  ungroup: (id: string) => void;
  reorder: (id: string, dir: "front" | "back" | "forward" | "backward") => void;
  moveElementTo: (dragId: string, targetId: string) => void;

  // bindings / behaviors / states
  setBinding: (id: string, binding: Binding) => void;
  removeBinding: (id: string, property: string) => void;
  addBehavior: (id: string, type: BehaviorType) => void;
  updateBehavior: (id: string, behaviorId: string, patch: Partial<Behavior>) => void;
  removeBehavior: (id: string, behaviorId: string) => void;
  addState: (id: string) => void;
  updateState: (id: string, stateId: string, patch: Partial<VisualState>) => void;
  removeState: (id: string, stateId: string) => void;

  // variables
  addVariable: (v?: Partial<HmiVariable>) => void;
  updateVariable: (id: string, patch: Partial<HmiVariable>) => void;
  setVariableValue: (name: string, value: number | boolean | string) => void;
  removeVariable: (id: string) => void;

  // widgets
  createWidgetFromSelection: (name: string) => void;
  instantiateWidget: (widgetId: string, x: number, y: number) => void;
  updateWidgetInstanceParam: (id: string, param: string, variable: string) => void;

  // connections / target
  updateConnection: (id: string, patch: Partial<ConnectionConfig>) => void;
  addConnection: () => void;
  updateTarget: (patch: Partial<TargetDevice>) => void;
  setSimRunning: (running: boolean) => void;
}

const HISTORY_LIMIT = 60;
const initialProject = createDemoProject();

export const useEditor = create<EditorState>((set, get) => {
  /** Commits a project mutation to history so undo/redo stays coherent. */
  const commit = (mutate: (p: Project) => Project) => {
    const { project, past } = get();
    const next = mutate(project);
    set({
      project: next,
      past: [...past, project].slice(-HISTORY_LIMIT),
      future: [],
      dirty: true,
    });
  };

  const mutateScreen = (mutate: (s: Screen) => Screen) =>
    commit((p) => ({
      ...p,
      screens: p.screens.map((s) => (s.id === get().activeScreenId ? mutate(s) : s)),
    }));

  const mutateElement = (id: string, fn: (el: HmiElement) => HmiElement) =>
    mutateScreen((s) => ({ ...s, elements: mapElement(s.elements, id, fn) }));

  return {
    project: initialProject,
    activeScreenId: initialProject.screens[0]!.id,
    selectedIds: [],
    mode: "design",
    zoom: 1,
    pan: { x: 40, y: 30 },
    showGrid: true,
    snapToGrid: true,
    gridSize: 8,
    bottomTab: "variables",
    dirty: false,
    past: [],
    future: [],
    simRunning: true,

    hydrate: async () => {
      const project = await projectRepository.load();
      set({
        project,
        activeScreenId: project.screens[0]?.id ?? "",
        selectedIds: [],
        past: [],
        future: [],
        dirty: false,
      });
    },
    save: async () => {
      await projectRepository.save(get().project);
      set({ dirty: false });
    },
    setMode: (mode) => set({ mode, selectedIds: mode === "design" ? get().selectedIds : [] }),
    setZoom: (zoom) => set({ zoom: Math.min(6, Math.max(0.15, zoom)) }),
    setPan: (pan) => set({ pan }),
    toggleGrid: () => set({ showGrid: !get().showGrid }),
    toggleSnap: () => set({ snapToGrid: !get().snapToGrid }),
    setBottomTab: (bottomTab) => set({ bottomTab }),
    undo: () => {
      const { past, project, future } = get();
      const prev = past[past.length - 1];
      if (!prev) return;
      set({
        project: prev,
        past: past.slice(0, -1),
        future: [project, ...future].slice(0, HISTORY_LIMIT),
      });
    },
    redo: () => {
      const { future, project, past } = get();
      const next = future[0];
      if (!next) return;
      set({ project: next, future: future.slice(1), past: [...past, project] });
    },

    activeScreen: () => {
      const { project, activeScreenId } = get();
      return project.screens.find((s) => s.id === activeScreenId) ?? project.screens[0]!;
    },
    addScreen: () =>
      commit((p) => ({
        ...p,
        screens: [
          ...p.screens,
          {
            id: uid("scr"),
            name: `Screen ${p.screens.length + 1}`,
            width: p.target.displayWidth,
            height: p.target.displayHeight,
            background: "#0f141c",
            elements: [],
          },
        ],
      })),
    selectScreen: (activeScreenId) => set({ activeScreenId, selectedIds: [] }),
    updateScreen: (patch) => mutateScreen((s) => ({ ...s, ...patch })),
    removeScreen: (id) =>
      commit((p) => {
        if (p.screens.length <= 1) return p;
        const screens = p.screens.filter((s) => s.id !== id);
        if (get().activeScreenId === id) set({ activeScreenId: screens[0]!.id, selectedIds: [] });
        return { ...p, screens };
      }),

    select: (selectedIds) => set({ selectedIds }),
    toggleSelect: (id) => {
      const { selectedIds } = get();
      set({
        selectedIds: selectedIds.includes(id)
          ? selectedIds.filter((x) => x !== id)
          : [...selectedIds, id],
      });
    },
    addElement: (kind, x = 60, y = 60) => {
      const el = createElement(kind, x, y);
      mutateScreen((s) => ({ ...s, elements: [...s.elements, el] }));
      set({ selectedIds: [el.id] });
    },
    addElementObject: (el) => {
      mutateScreen((s) => ({ ...s, elements: [...s.elements, el] }));
      set({ selectedIds: [el.id] });
    },
    updateElement: (id, patch) => mutateElement(id, (el) => ({ ...el, ...patch })),
    updateElementProp: (id, key, value) =>
      mutateElement(id, (el) => ({ ...el, props: { ...el.props, [key]: value } })),
    deleteSelection: () => {
      const ids = get().selectedIds;
      mutateScreen((s) => ({
        ...s,
        elements: ids.reduce((acc, id) => removeElement(acc, id), s.elements),
      }));
      set({ selectedIds: [] });
    },
    duplicateSelection: () => {
      const { selectedIds } = get();
      const screen = get().activeScreen();
      const copies = selectedIds
        .map((id) => findElement(screen.elements, id))
        .filter((el): el is HmiElement => Boolean(el))
        .map((el) => ({ ...cloneWithNewIds(el), x: el.x + 16, y: el.y + 16 }));
      if (!copies.length) return;
      mutateScreen((s) => ({ ...s, elements: [...s.elements, ...copies] }));
      set({ selectedIds: copies.map((c) => c.id) });
    },
    groupSelection: () => {
      const { selectedIds } = get();
      if (selectedIds.length < 2) return;
      const screen = get().activeScreen();
      const items = selectedIds
        .map((id) => findElement(screen.elements, id))
        .filter((el): el is HmiElement => Boolean(el));
      if (items.length < 2) return;
      const x = Math.min(...items.map((i) => i.x));
      const y = Math.min(...items.map((i) => i.y));
      const group = createElement("group", x, y);
      group.width = Math.max(...items.map((i) => i.x + i.width)) - x;
      group.height = Math.max(...items.map((i) => i.y + i.height)) - y;
      group.fill = "transparent";
      group.stroke = "transparent";
      group.children = items.map((i) => ({ ...i, x: i.x - x, y: i.y - y }));
      mutateScreen((s) => ({
        ...s,
        elements: [
          ...selectedIds.reduce((acc, id) => removeElement(acc, id), s.elements),
          group,
        ],
      }));
      set({ selectedIds: [group.id] });
    },
    ungroup: (id) => {
      const screen = get().activeScreen();
      const group = findElement(screen.elements, id);
      if (!group?.children?.length) return;
      const kids = group.children.map((c) => ({ ...c, x: c.x + group.x, y: c.y + group.y }));
      mutateScreen((s) => ({ ...s, elements: [...removeElement(s.elements, id), ...kids] }));
      set({ selectedIds: kids.map((k) => k.id) });
    },
    reorder: (id, dir) =>
      mutateScreen((s) => {
        const list = [...s.elements];
        const i = list.findIndex((e) => e.id === id);
        if (i < 0) return s;
        const [item] = list.splice(i, 1);
        const target =
          dir === "front"
            ? list.length
            : dir === "back"
              ? 0
              : dir === "forward"
                ? Math.min(list.length, i + 1)
                : Math.max(0, i - 1);
        list.splice(target, 0, item!);
        return { ...s, elements: list };
      }),
    moveElementTo: (dragId, targetId) =>
      mutateScreen((s) => {
        if (dragId === targetId) return s;
        const dragged = findElement(s.elements, dragId);
        if (!dragged) return s;
        const withoutDragged = removeElement(s.elements, dragId);
        const list = [...withoutDragged];
        const i = list.findIndex((e) => e.id === targetId);
        if (i < 0) return { ...s, elements: [...withoutDragged, dragged] };
        list.splice(i, 0, dragged);
        return { ...s, elements: list };
      }),

    setBinding: (id, binding) =>
      mutateElement(id, (el) => ({
        ...el,
        bindings: [...el.bindings.filter((b) => b.property !== binding.property), binding],
      })),
    removeBinding: (id, property) =>
      mutateElement(id, (el) => ({
        ...el,
        bindings: el.bindings.filter((b) => b.property !== property),
      })),
    addBehavior: (id, type) =>
      mutateElement(id, (el) => ({ ...el, behaviors: [...el.behaviors, createBehavior(type)] })),
    updateBehavior: (id, behaviorId, patch) =>
      mutateElement(id, (el) => ({
        ...el,
        behaviors: el.behaviors.map((b) => (b.id === behaviorId ? { ...b, ...patch } : b)),
      })),
    removeBehavior: (id, behaviorId) =>
      mutateElement(id, (el) => ({
        ...el,
        behaviors: el.behaviors.filter((b) => b.id !== behaviorId),
      })),
    addState: (id) =>
      mutateElement(id, (el) => ({
        ...el,
        states: [
          ...el.states,
          {
            id: uid("st"),
            name: `STATE_${el.states.length + 1}`,
            condition: "",
            fill: "#22c55e",
            blink: false,
          },
        ],
      })),
    updateState: (id, stateId, patch) =>
      mutateElement(id, (el) => ({
        ...el,
        states: el.states.map((s) => (s.id === stateId ? { ...s, ...patch } : s)),
      })),
    removeState: (id, stateId) =>
      mutateElement(id, (el) => ({ ...el, states: el.states.filter((s) => s.id !== stateId) })),

    addVariable: (v) =>
      commit((p) => ({
        ...p,
        variables: [
          ...p.variables,
          {
            id: uid("var"),
            name: `TAG_${p.variables.length + 1}`,
            type: "number",
            value: 0,
            source: "Simulated",
            quality: "good",
            timestamp: Date.now(),
            signal: "manual",
            min: 0,
            max: 100,
            periodMs: 4000,
            ...v,
          },
        ],
      })),
    updateVariable: (id, patch) =>
      commit((p) => ({
        ...p,
        variables: p.variables.map((v) =>
          v.id === id ? { ...v, ...patch, timestamp: Date.now() } : v,
        ),
      })),
    // value changes during simulation should not pollute undo history
    setVariableValue: (name, value) =>
      set((st) => ({
        project: {
          ...st.project,
          variables: st.project.variables.map((v) =>
            v.name === name ? { ...v, value, timestamp: Date.now() } : v,
          ),
        },
      })),
    removeVariable: (id) =>
      commit((p) => ({ ...p, variables: p.variables.filter((v) => v.id !== id) })),

    createWidgetFromSelection: (name) => {
      const { selectedIds } = get();
      const screen = get().activeScreen();
      const items = selectedIds
        .map((id) => findElement(screen.elements, id))
        .filter((el): el is HmiElement => Boolean(el));
      if (!items.length) return;
      const x = Math.min(...items.map((i) => i.x));
      const y = Math.min(...items.map((i) => i.y));
      const width = Math.max(...items.map((i) => i.x + i.width)) - x;
      const height = Math.max(...items.map((i) => i.y + i.height)) - y;
      const def: WidgetDefinition = {
        id: uid("wgt"),
        name,
        category: "Custom",
        params: [
          { name: "Running", type: "boolean" },
          { name: "Speed", type: "number" },
          { name: "Alarm", type: "boolean" },
        ],
        width: Math.max(20, width),
        height: Math.max(20, height),
        elements: items.map((i) => ({ ...cloneWithNewIds(i), x: i.x - x, y: i.y - y })),
      };
      commit((p) => ({ ...p, widgets: [...p.widgets, def] }));
    },
    instantiateWidget: (widgetId, x, y) => {
      const def = get().project.widgets.find((w) => w.id === widgetId);
      if (!def) return;
      const inst = createElement("widget", x, y);
      inst.name = def.name;
      inst.width = def.width;
      inst.height = def.height;
      inst.fill = "transparent";
      inst.stroke = "transparent";
      inst.widgetId = def.id;
      inst.paramMap = {};
      inst.children = def.elements.map(cloneWithNewIds);
      get().addElementObject(inst);
    },
    updateWidgetInstanceParam: (id, param, variable) =>
      mutateElement(id, (el) => ({
        ...el,
        paramMap: { ...(el.paramMap ?? {}), [param]: variable },
      })),

    updateConnection: (id, patch) =>
      commit((p) => ({
        ...p,
        connections: p.connections.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),
    addConnection: () =>
      commit((p) => ({
        ...p,
        connections: [
          ...p.connections,
          {
            id: uid("conn"),
            name: `Connection ${p.connections.length + 1}`,
            protocol: "modbus-rtu",
            port: "COM1",
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: "none",
            flowControl: "none",
            readTimeout: 1000,
            writeTimeout: 1000,
            connected: false,
          },
        ],
      })),
    updateTarget: (patch) => commit((p) => ({ ...p, target: { ...p.target, ...patch } })),
    setSimRunning: (simRunning) => set({ simRunning }),
  };
});

export const useSelectedElement = () =>
  useEditor((s) => {
    const screen = s.project.screens.find((x) => x.id === s.activeScreenId);
    const id = s.selectedIds[0];
    if (!screen || !id) return undefined;
    return findElement(screen.elements, id);
  });

export const useSelectedParent = () =>
  useEditor((s) => {
    const screen = s.project.screens.find((x) => x.id === s.activeScreenId);
    const id = s.selectedIds[0];
    if (!screen || !id) return null;
    return findParent(screen.elements, id) ?? null;
  });
