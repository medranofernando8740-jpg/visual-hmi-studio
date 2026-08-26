/**
 * Data access layer. Every read/write goes through this repository so the
 * mock implementation can be swapped for a Laravel REST client without
 * touching UI or store code.
 */
import type { Project } from "@/types/hmi";
import { createDemoProject } from "./demoProject";

const STORAGE_KEY = "hmi-studio.project.v1";

export interface ProjectRepository {
  load(): Promise<Project>;
  save(project: Project): Promise<void>;
  list(): Promise<{ id: string; name: string }[]>;
}

/** Placeholder REST client for the future Laravel API. */
export class RestProjectRepository implements ProjectRepository {
  constructor(private baseUrl: string) {}
  async load(): Promise<Project> {
    const res = await fetch(`${this.baseUrl}/projects/current`);
    return (await res.json()) as Project;
  }
  async save(project: Project): Promise<void> {
    await fetch(`${this.baseUrl}/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
  }
  async list() {
    const res = await fetch(`${this.baseUrl}/projects`);
    return (await res.json()) as { id: string; name: string }[];
  }
}

export class LocalProjectRepository implements ProjectRepository {
  async load(): Promise<Project> {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw) as Project;
        } catch {
          /* fall through to demo */
        }
      }
    }
    return createDemoProject();
  }
  async save(project: Project): Promise<void> {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    }
  }
  async list() {
    return [{ id: "demo", name: "Planta Demo" }];
  }
}

export const projectRepository: ProjectRepository = new LocalProjectRepository();

export function resetStoredProject() {
  if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
