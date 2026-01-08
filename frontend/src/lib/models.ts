// lib/models.ts

export enum EventKind {
  Concert = "Concert",
  Festival = "Festival",
  Sports = "Sports",
  Theater = "Theater",
  Conference = "Conference",
  Wedding = "Wedding",
  Museum = "Museum",
  Other = "Other"
}

export type EventType = { kind: EventKind.Concert } | { kind: EventKind.Festival; dateRange: [string, string] } | { kind: EventKind.Sports } | { kind: EventKind.Theater } | { kind: EventKind.Conference } | { kind: EventKind.Wedding } | { kind: EventKind.Museum } | { kind: EventKind.Other }

export type AppEvent = {
  id: number
  type: EventType
  name: string
  date?: string
  section?: number | string
  row?: number | string
  seat?: number | string
  notes?: string
}

export type EventDetailView = {
  id: number
  name: string
  kindLabel: string
  dateText: string
  section?: number | string
  seat?: number | string
  row?: number | string
  notes?: string
}

type NonFestivalUpdate = { dateRange?: never } // can't add a dateRange to non-festival events
type FestivalUpdate = { dateRange: [string, string] } // must provide dateRange for festivals

export type EventTypeUpdate = NonFestivalUpdate | FestivalUpdate

export type NewEventInput = Omit<AppEvent, "id">

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }
