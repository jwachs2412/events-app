import { AppEvent, NewEventInput, Result } from "./models"

const API_URL = "http://localhost:4000/events"

// GET all events
export async function fetchEvents(): Promise<Result<AppEvent[]>> {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error("Failed to fetch events")
    const data: AppEvent[] = await res.json()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

// GET single event by ID
export async function fetchEventById(id: number): Promise<Result<AppEvent>> {
  try {
    const res = await fetch(`${API_URL}/${id}`)
    if (!res.ok) throw new Error("Failed to fetch event")
    const data: AppEvent = await res.json()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

// Add event
export async function addEvent(event: NewEventInput): Promise<Result<AppEvent>> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    })
    if (!res.ok) throw new Error("Failed to add event")
    const data: AppEvent = await res.json()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

// Edit event
export async function editEvent(id: number, event: NewEventInput): Promise<Result<AppEvent>> {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    })
    if (!res.ok) throw new Error("Failed to update event")
    const data: AppEvent = await res.json()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

// Delete event
export async function deleteEvent(id: number): Promise<Result<{}>> {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete event")
    return { ok: true, data: {} }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
