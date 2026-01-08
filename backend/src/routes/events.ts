import express from "express"
import { db } from "../db" // MySQL connection

enum EventKind {
  Concert = "Concert",
  Festival = "Festival",
  Sports = "Sports",
  Theater = "Theater",
  Conference = "Conference",
  Wedding = "Wedding",
  Museum = "Museum",
  Other = "Other"
}

type EventType = { kind: EventKind.Concert } | { kind: EventKind.Festival; dateRange: [string, string] } | { kind: EventKind.Sports } | { kind: EventKind.Theater } | { kind: EventKind.Conference } | { kind: EventKind.Wedding } | { kind: EventKind.Museum } | { kind: EventKind.Other }

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

// Input type for creating/updating events
export type NewEventInput = Omit<AppEvent, "id">

const router = express.Router()

// --------------------
// Helper: map frontend AppEvent → DB row
// --------------------
function mapEventToDbRow(event: NewEventInput) {
  let date: string | null = null
  let start_date: string | null = null
  let end_date: string | null = null

  if (event.type.kind === EventKind.Festival) {
    ;[start_date, end_date] = event.type.dateRange
  } else {
    date = event.date ?? null
  }

  return {
    name: event.name,
    kind: event.type.kind,
    date,
    start_date,
    end_date,
    section_value: event.section ?? null,
    row_value: event.row ?? null,
    seat_value: event.seat ?? null,
    notes: event.notes ?? null
  }
}

// --------------------
// GET all events
// --------------------
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM events")
    const events: AppEvent[] = (rows as any[]).map(row => {
      const type: EventType = row.kind === EventKind.Festival ? { kind: row.kind, dateRange: [row.start_date, row.end_date] } : { kind: row.kind }

      return {
        id: row.id,
        name: row.name,
        type,
        date: row.date,
        section: row.section_value,
        row: row.row_value,
        seat: row.seat_value,
        notes: row.notes
      }
    })
    res.json(events)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch events" })
  }
})

// --------------------
// GET single event by ID
// --------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [id])
    if ((rows as any[]).length === 0) return res.status(404).json({ error: "Event not found" })

    const row = (rows as any[])[0]
    const type: EventType = row.kind === EventKind.Festival ? { kind: row.kind, dateRange: [row.start_date, row.end_date] } : { kind: row.kind }

    const event: AppEvent = {
      id: row.id,
      name: row.name,
      type,
      date: row.date,
      section: row.section_value,
      row: row.row_value,
      seat: row.seat_value,
      notes: row.notes
    }

    res.json(event)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch event" })
  }
})

// --------------------
// Add new event
// --------------------
router.post("/", async (req, res) => {
  try {
    const event: NewEventInput = req.body
    const dbRow = mapEventToDbRow(event)

    const result: any = await db.query(
      `INSERT INTO events (name, kind, date, start_date, end_date, section_value, row_value, seat_value, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dbRow.name, dbRow.kind, dbRow.date, dbRow.start_date, dbRow.end_date, dbRow.section_value, dbRow.row_value, dbRow.seat_value, dbRow.notes]
    )

    const insertedEvent: AppEvent = {
      id: result[0].insertId,
      name: event.name,
      type: event.type,
      date: event.date,
      section: event.section,
      row: event.row,
      seat: event.seat,
      notes: event.notes
    }

    res.json(insertedEvent)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to add event" })
  }
})

// --------------------
// Update existing event
// --------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const event: NewEventInput = req.body
    const dbRow = mapEventToDbRow(event)

    await db.query(
      `UPDATE events
       SET name=?, kind=?, date=?, start_date=?, end_date=?, section_value=?, row_value=?, seat_value=?, notes=?
       WHERE id=?`,
      [dbRow.name, dbRow.kind, dbRow.date, dbRow.start_date, dbRow.end_date, dbRow.section_value, dbRow.row_value, dbRow.seat_value, dbRow.notes, id]
    )

    const updatedEvent: AppEvent = {
      id: Number(id),
      name: event.name,
      type: event.type,
      date: event.date,
      section: event.section,
      row: event.row,
      seat: event.seat,
      notes: event.notes
    }

    res.json(updatedEvent)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to update event" })
  }
})

// --------------------
// Delete event
// --------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    await db.query("DELETE FROM events WHERE id = ?", [id])
    res.json({ message: "Event deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to delete event" })
  }
})

export default router
