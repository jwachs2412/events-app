import express from "express";
import { db } from "../db"; // MySQL connection
var EventKind;
(function (EventKind) {
    EventKind["Concert"] = "Concert";
    EventKind["Festival"] = "Festival";
    EventKind["Sports"] = "Sports";
    EventKind["Theater"] = "Theater";
    EventKind["Conference"] = "Conference";
    EventKind["Wedding"] = "Wedding";
    EventKind["Museum"] = "Museum";
    EventKind["Other"] = "Other";
})(EventKind || (EventKind = {}));
const router = express.Router();
// --------------------
// Helper: map frontend AppEvent → DB row
// --------------------
function mapEventToDbRow(event) {
    let date = null;
    let start_date = null;
    let end_date = null;
    if (event.type.kind === EventKind.Festival) {
        ;
        [start_date, end_date] = event.type.dateRange;
    }
    else {
        date = event.date ?? null;
    }
    return {
        name: event.name,
        kind: event.type.kind,
        date,
        start_date,
        end_date,
        venue: event.venue ?? null,
        location: event.location ?? null,
        section_value: event.section ?? null,
        row_value: event.row ?? null,
        seat_value: event.seat ?? null,
        notes: event.notes ?? null
    };
}
// --------------------
// GET all events
// --------------------
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM events");
        const events = rows.map(row => {
            const type = row.kind === EventKind.Festival ? { kind: row.kind, dateRange: [row.start_date, row.end_date] } : { kind: row.kind };
            return {
                id: row.id,
                name: row.name,
                type,
                date: row.date,
                venue: row.venue,
                location: row.location,
                section: row.section_value,
                row: row.row_value,
                seat: row.seat_value,
                notes: row.notes
            };
        });
        res.json(events);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});
// --------------------
// GET single event by ID
// --------------------
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [id]);
        if (rows.length === 0)
            return res.status(404).json({ error: "Event not found" });
        const row = rows[0];
        const type = row.kind === EventKind.Festival ? { kind: row.kind, dateRange: [row.start_date, row.end_date] } : { kind: row.kind };
        const event = {
            id: row.id,
            name: row.name,
            type,
            date: row.date,
            venue: row.venue,
            location: row.location,
            section: row.section_value,
            row: row.row_value,
            seat: row.seat_value,
            notes: row.notes
        };
        res.json(event);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch event" });
    }
});
// --------------------
// Add new event
// --------------------
router.post("/", async (req, res) => {
    try {
        const event = req.body;
        const dbRow = mapEventToDbRow(event);
        const result = await db.query(`INSERT INTO events (name, kind, date, start_date, end_date, venue, location, section_value, row_value, seat_value, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [dbRow.name, dbRow.kind, dbRow.date, dbRow.start_date, dbRow.end_date, dbRow.venue, dbRow.location, dbRow.section_value, dbRow.row_value, dbRow.seat_value, dbRow.notes]);
        const insertedEvent = {
            id: result[0].insertId,
            name: event.name,
            type: event.type,
            date: event.date,
            venue: event.venue,
            location: event.location,
            section: event.section,
            row: event.row,
            seat: event.seat,
            notes: event.notes
        };
        res.json(insertedEvent);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add event" });
    }
});
// --------------------
// Update existing event
// --------------------
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const event = req.body;
        const dbRow = mapEventToDbRow(event);
        await db.query(`UPDATE events
       SET name=?, kind=?, date=?, start_date=?, end_date=?, venue=?, location=?,section_value=?, row_value=?, seat_value=?, notes=?
       WHERE id=?`, [dbRow.name, dbRow.kind, dbRow.date, dbRow.start_date, dbRow.end_date, dbRow.venue, dbRow.location, dbRow.section_value, dbRow.row_value, dbRow.seat_value, dbRow.notes, id]);
        const updatedEvent = {
            id: Number(id),
            name: event.name,
            type: event.type,
            date: event.date,
            venue: event.venue,
            location: event.location,
            section: event.section,
            row: event.row,
            seat: event.seat,
            notes: event.notes
        };
        res.json(updatedEvent);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update event" });
    }
});
// --------------------
// Delete event
// --------------------
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM events WHERE id = ?", [id]);
        res.json({ message: "Event deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete event" });
    }
});
export default router;
