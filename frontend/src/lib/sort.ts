import { EventDetailView } from "./models"

export type SortDirection = "asc" | "desc"

export function sortEvents<T extends keyof EventDetailView>(events: EventDetailView[], key: T, direction: SortDirection = "asc"): EventDetailView[] {
  return [...events].sort((a, b) => {
    const aVal = a[key] ?? ""
    const bVal = b[key] ?? ""
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal
    }
    return 0
  })
}
